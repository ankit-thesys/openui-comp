import fs from 'node:fs/promises';
import net from 'node:net';
import {spawn} from 'node:child_process';
import {performance} from 'node:perf_hooks';
import {chromium} from 'playwright';
const seconds=Number(process.env.SOAK_ARM_SECONDS||300);
const phase=process.env.SOAK_PHASE||'all';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const MiB=1024**2;
const median=a=>{const b=[...a].sort((x,y)=>x-y);return b.length?b[Math.floor(b.length/2)]:null;};
const reports=[];
async function freePort(port){await new Promise((resolve,reject)=>{const server=net.createServer();server.once('error',reject);server.listen(port,'127.0.0.1',()=>server.close(resolve));});}
async function start(args,port,env={}){
 await freePort(port);let log='';const child=spawn(process.execPath,args,{env:{...process.env,...env},stdio:['ignore','pipe','pipe']});
 child.stdout.on('data',d=>log=(log+d).slice(-12000));child.stderr.on('data',d=>log=(log+d).slice(-12000));
 const url='http://127.0.0.1:'+port;
 for(let i=0;i<120;i++){if(child.exitCode!==null)throw Error('Owned server exited: '+log);try{const r=await fetch(url+(env.PROTOTYPE_DIAGNOSTICS?'/api/diagnostics':'/stats'),{signal:AbortSignal.timeout(1000)});if(r.ok)return {child,url,logs:()=>log};}catch{}await pause(250);}
 child.kill();throw Error('Server startup timeout '+log);
}
async function stop(child){if(child.exitCode!==null||child.signalCode!==null)return;child.kill('SIGTERM');await Promise.race([new Promise(r=>child.once('exit',r)),pause(3000).then(()=>{if(child.exitCode===null&&child.signalCode===null)child.kill('SIGKILL')})]);}
async function write(report){await fs.writeFile(`results/memory-${report.kind}.json`,JSON.stringify(report,null,2)+'\n');}
function growth(checkpoints,key){const points=checkpoints.filter(c=>c.stage!=='cold'&&Number.isFinite(c[key]));const first=(points.find(c=>c.stage==='warm')||points[0])?.[key];const terminal=points.filter(c=>['after-abort','after-load','idle'].includes(c.stage));const last=median((terminal.length?terminal:points.slice(-3)).map(c=>c[key])),delta=last-first;return {earlyMedian:first,lateMedian:last,delta,relativePercent:first?delta/first*100:null,budgetBytes:Math.max(5*MiB,first*.1),needsInvestigation:delta>Math.max(5*MiB,first*.1)};}
async function nextSoak(){
 const report={kind:'next',startedAt:new Date().toISOString(),secondsPerArm:seconds,scope:'Production Next SSR real components. Separate fresh server process per CSS arm, ten bounded concurrent requests, alternating chat/dashboard and red/blue. Natural-GC load interval; explicit forced-GC warm and terminal idle retention checkpoints only. No browser or stylesheet downloads; no production capacity claim.',arms:[],failures:[]};reports.push(report);
 for(const arm of ['baseline','generated']){
  const server=await start(['--expose-gc','next-fixture/node_modules/next/dist/bin/next','start','next-real-fixture','--hostname','127.0.0.1','--port','4186'],4186,{PROTOTYPE_DIAGNOSTICS:'1'});
  const row={arm,completed:0,bytes:0,aborted:0,checkpoints:[],errors:[]};report.arms.push(row);
  const stat=async gc=>{const r=await fetch(server.url+'/api/diagnostics'+(gc?'?gc=1':''),{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Diagnostics '+r.status);return r.json();};
  const checkpoint=async stage=>{await pause(500);const natural=await stat(false);let forced=null;if(stage!=='interval'){await stat(true);await pause(100);forced=await stat(true);if(!forced.gcApplied)throw Error('Next GC diagnostic not enabled');}row.checkpoints.push({stage,elapsedMs:performance.now()-began,pid:natural.pid,natural:natural.memory,forced:forced?.memory??null,heapUsed:forced?.memory.heapUsed??null,rss:natural.memory.rss});console.log(`Next ${arm} ${stage}: ${row.completed} responses, ${forced?'retained':'natural'} heap ${((forced?.memory.heapUsed??natural.memory.heapUsed)/MiB).toFixed(1)} MiB, RSS ${(natural.memory.rss/MiB).toFixed(1)} MiB`);await write(report);};
  const request=async i=>{const scenario=i%2?'dashboard':'chat',theme=i%3?'blue':'red';const r=await fetch(server.url+'/?'+new URLSearchParams({scenario,theme,arm}),{signal:AbortSignal.timeout(15000)});const html=await r.text();if(!r.ok||!html.includes('data-late="true"')||!html.includes(scenario==='dashboard'?'Regional revenue dashboard':'OpenUI research conversation')||!html.includes('openui-input')||(scenario==='dashboard'&&(!html.includes('openui-table')||!html.includes('aria-label="Bar chart"'))))throw Error(`Invalid real SSR ${scenario}: ${r.status}`);row.completed++;row.bytes+=Buffer.byteLength(html);};
  let began=performance.now();
  try{
   await checkpoint('cold');for(let i=0;i<3;i++)await Promise.all(Array.from({length:10},(_,j)=>request(i*10+j)));await checkpoint('warm');
   const start=performance.now();let sampleAt=start+30000,batch=0;
   while(performance.now()-start<seconds*1000){await Promise.all(Array.from({length:10},(_,j)=>request(batch*10+j)));batch++;if(performance.now()>=sampleAt){await checkpoint('interval');sampleAt=performance.now()+30000;}await pause(150);}
   // Cancellation then idle checks cover cleanup, not only successful responses.
   for(let i=0;i<6;i++){const ctrl=new AbortController();const r=await fetch(server.url+'/?'+new URLSearchParams({scenario:i%2?'dashboard':'chat',arm}),{signal:ctrl.signal});await r.body.getReader().read();ctrl.abort();row.aborted++;}
   await pause(2000);await checkpoint('after-abort');await pause(5000);await checkpoint('idle');
   row.retainedHeap=growth(row.checkpoints,'heapUsed');row.rss=growth(row.checkpoints,'rss');if(row.retainedHeap.needsInvestigation)report.failures.push({arm,retainedHeap:row.retainedHeap});
  }catch(e){row.errors.push(String(e));report.failures.push({arm,error:String(e),serverLogs:server.logs()});}finally{await stop(server.child);await write(report);}
 }
 report.finishedAt=new Date().toISOString();await write(report);
}
async function browserSoak(){
 const report={kind:'browser',startedAt:new Date().toISOString(),secondsPerArm:seconds,scope:'Actual AgentInterface, ChatProvider/store and streaming parser. Two persistent pages per arm (chat and dashboard), sequential sends, cancel/unmount/remount. Fixed two-block/panel payload and fixed teardown checkpoint; no accumulating history. Separate browser process per arm. Natural-GC load interval; explicit CDP forced-GC warm and terminal idle checkpoints only. Bounded harness event buffer500 and server history20.',arms:[],failures:[]};reports.push(report);
 const server=await start(['.chat-dist/server.cjs'],4185,{PORT:'4185'});
 try{for(const arm of ['baseline','generated']){
  const browser=await chromium.launch({channel:'chrome',headless:true});const row={arm,completed:0,cancelled:0,checkpoints:[],errors:[]};report.arms.push(row);const began=performance.now();
  try{
   const pages=[];
   for(const scenario of ['chat','dashboard']){const page=await browser.newPage({viewport:{width:1280,height:900}});page.on('pageerror',e=>row.errors.push(e.message));await page.goto(server.url+'/?'+new URLSearchParams({scenario,arm,size:'2'}));await page.waitForFunction(()=>window.__fullChat?.snapshot());const cdp=await page.context().newCDPSession(page);await cdp.send('Performance.enable');await page.evaluate(()=>window.__fullChat.unmount());const expected=(await(await fetch(server.url+'/api/expected?scenario='+scenario+'&size=2')).json()).content;pages.push({page,cdp,scenario,expected});}
   const checkpoint=async stage=>{await pause(300);const values=[];for(const {page,cdp,scenario}of pages){const natural=await cdp.send('Runtime.getHeapUsage');const domBefore=await cdp.send('Memory.getDOMCounters');let forced=null;if(stage!=='interval'){await cdp.send('HeapProfiler.collectGarbage');await cdp.send('HeapProfiler.collectGarbage');forced=await cdp.send('Runtime.getHeapUsage');}const dom=await cdp.send('Memory.getDOMCounters');const styles=await page.evaluate(()=>({elements:document.querySelectorAll('#app *').length,sheets:document.styleSheets.length,rules:[...document.styleSheets].reduce((n,s)=>{try{return n+s.cssRules.length}catch{return n}},0),mounted:!!window.__fullChat.snapshot()}));if(styles.elements||styles.mounted)throw Error('Not at fixed unmounted checkpoint');values.push({scenario,natural,forced,domBefore,dom,styles});}
    const stats=await(await fetch(server.url+'/stats')).json();if(stats.active!==0)throw Error('Active chat stream after teardown');const heapUsed=stage==='interval'?null:values.reduce((n,v)=>n+v.forced.usedSize,0);const naturalHeapUsed=values.reduce((n,v)=>n+v.natural.usedSize,0);row.checkpoints.push({stage,elapsedMs:performance.now()-began,heapUsed,naturalHeapUsed,values,activeStreams:stats.active});console.log(`Browser ${arm} ${stage}: ${row.completed} streams, ${row.cancelled} cancels, ${heapUsed===null?'natural':'retained'} heap ${((heapUsed??naturalHeapUsed)/MiB).toFixed(1)} MiB`);await write(report);};
   const cycle=async(index,cancel=false)=>{const {page,scenario,expected}=pages[index%2];await page.evaluate(()=>window.__fullChat.mount());await page.waitForFunction(()=>window.__fullChat.snapshot());const before=await page.evaluate(()=>window.__fullChat.snapshot());if(before.messages.length)throw Error('New mount retained conversation unexpectedly');await page.evaluate(()=>{void window.__fullChat.send('Soak: analyze regional results')});await page.waitForFunction(()=>window.__fullChat.snapshot()?.isRunning,{},{timeout:15000});if(cancel){await page.evaluate(()=>window.__fullChat.unmount());row.cancelled++;await pause(100);return;}
    await page.waitForFunction(()=>{const s=window.__fullChat.snapshot();return s&&!s.isRunning&&s.messages.length===2&&s.messages[1].content.length>100},{},{timeout:30000});const snap=await page.evaluate(()=>window.__fullChat.snapshot());if(snap.error)throw Error(snap.error);if(snap.messages.at(-1).content!==expected)throw Error('Final full-chat content mismatch');const rendered=await page.evaluate(()=>({tables:document.querySelectorAll('table').length,bars:document.querySelectorAll('path[class*="bar-chart-bar"]').length,cards:document.querySelectorAll('.openui-card').length}));if(!rendered.cards||(scenario==='dashboard'&&(rendered.tables<2||rendered.bars<24)))throw Error('Missing actual full-chat content '+JSON.stringify(rendered));await page.evaluate(()=>window.__fullChat.unmount());row.completed++;};
   await checkpoint('cold');for(let i=0;i<8;i++)await cycle(i);await checkpoint('warm');const start=performance.now();let sampleAt=start+30000,index=0;
   while(performance.now()-start<seconds*1000){await cycle(index,index%10===9);index++;if(performance.now()>=sampleAt){await checkpoint('interval');sampleAt=performance.now()+30000;}}
   await pause(2000);await checkpoint('after-load');await pause(5000);await checkpoint('idle');row.retainedHeap=growth(row.checkpoints,'heapUsed');if(row.retainedHeap.needsInvestigation)report.failures.push({arm,retainedHeap:row.retainedHeap});
   for(const scenario of ['chat','dashboard']){const points=row.checkpoints.filter(c=>c.stage!=='cold'&&c.heapUsed!==null).map(c=>c.values.find(v=>v.scenario===scenario));const early=points.slice(0,1),late=points.slice(-2);for(const key of ['sheets','rules'])if(median(late.map(v=>v.styles[key]))>median(early.map(v=>v.styles[key])))report.failures.push({arm,scenario,reason:'Stylesheet/rule growth',key});const nodeDelta=median(late.map(v=>v.dom.nodes))-median(early.map(v=>v.dom.nodes));const listenerDelta=median(late.map(v=>v.dom.jsEventListeners))-median(early.map(v=>v.dom.jsEventListeners));if(nodeDelta>100||listenerDelta>20)report.failures.push({arm,scenario,nodeDelta,listenerDelta,reason:'Retained DOM/listener growth'});}
   if(row.errors.length)report.failures.push({arm,errors:row.errors});
  }catch(e){row.errors.push(String(e));report.failures.push({arm,error:String(e)});}finally{await browser.close();await write(report);}
 }}finally{await stop(server.child);}report.finishedAt=new Date().toISOString();await write(report);
}
if(phase==='next'||phase==='all')await nextSoak();
if(phase==='browser'||phase==='all')await browserSoak();
if(reports.some(r=>r.failures.length))process.exitCode=1;
