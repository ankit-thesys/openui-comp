import fs from 'node:fs/promises';
import net from 'node:net';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

// Correctness and bounded retention diagnostic, not a throughput measurement.
const port=4188,origin=`http://127.0.0.1:${port}`,cycles=30,warmup=3;
const report={scope:'Repeated cancellation after a real HTTP stream has published partial assistant content. Actual AgentInterface/ChatProvider/store and production GenUI; fixed unmounted checkpoints. Warm/terminal explicit CDP GC diagnostics, not a long soak or performance comparison.',startedAt:new Date().toISOString(),cyclesPerCase:cycles,warmupPerCase:warmup,status:'failed',cases:[],failures:[]};
let child,browser,serverFailure=null,serverLogs='';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const assert=(value,message)=>{if(!value)throw Error(message);};
const watchdog=setTimeout(()=>{serverFailure=new Error('Partial-abort checker exceeded 240s watchdog');void browser?.close();child?.kill();},240000);watchdog.unref();
async function stats(){const response=await fetch(origin+'/stats',{signal:AbortSignal.timeout(3000)});assert(response.ok,'Server statistics unavailable');return response.json();}
async function drain(){for(let i=0;i<60;i++){if(serverFailure)throw serverFailure;if((await stats()).active===0)return;await pause(25);}throw Error('HTTP streams did not drain after cancellation');}
async function checkpoint(page,cdp){await pause(100);const natural=await cdp.send('Runtime.getHeapUsage');await cdp.send('HeapProfiler.collectGarbage');await cdp.send('HeapProfiler.collectGarbage');const forced=await cdp.send('Runtime.getHeapUsage'),dom=await cdp.send('Memory.getDOMCounters');const styles=await page.evaluate(()=>({elements:document.querySelectorAll('#app *').length,mounted:!!window.__fullChat.snapshot(),sheets:document.styleSheets.length,rules:[...document.styleSheets].reduce((sum,sheet)=>sum+sheet.cssRules.length,0)}));assert(!styles.elements&&!styles.mounted,'Memory checkpoint must use empty root and unmounted store');await drain();return {natural,forced,dom,styles,activeStreams:(await stats()).active};}
try{
 await new Promise((resolve,reject)=>{const probe=net.createServer();probe.once('error',reject);probe.listen(port,'127.0.0.1',()=>probe.close(resolve));});
 child=spawn(process.execPath,['.chat-dist/server.cjs'],{env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']});child.stdout.on('data',data=>serverLogs=(serverLogs+data).slice(-12000));child.stderr.on('data',data=>serverLogs=(serverLogs+data).slice(-12000));child.once('error',error=>{serverFailure=error;void browser?.close();});child.once('exit',(code,signal)=>{serverFailure=new Error(`Owned server exited ${code}/${signal}: ${serverLogs}`);void browser?.close();});
 let ready=false;for(let i=0;i<100;i++){if(serverFailure)throw serverFailure;try{await stats();ready=true;break;}catch{}await pause(100);}assert(ready,'Owned server startup timeout');
 for(const arm of ['baseline','generated']){
  browser=await chromium.launch({channel:'chrome',headless:true});
  try{for(const scenario of ['chat','dashboard']){
   const row={arm,scenario,completed:0,observations:[],errors:[]};report.cases.push(row);const page=await browser.newPage({viewport:{width:1280,height:900}});page.on('pageerror',error=>row.errors.push(error.message));
   try{
    await page.goto(origin+'/?'+new URLSearchParams({arm,scenario,size:'2'}));await page.waitForFunction(()=>window.__fullChat?.snapshot());const cdp=await page.context().newCDPSession(page);await page.evaluate(()=>window.__fullChat.unmount());
    const expected=(await(await fetch(origin+'/api/expected?'+new URLSearchParams({scenario,size:'2'}),{signal:AbortSignal.timeout(3000)})).json()).content;
    const cycle=async record=>{
     await page.evaluate(()=>window.__fullChat.mount());await page.waitForFunction(()=>window.__fullChat.snapshot());assert((await page.evaluate(()=>window.__fullChat.snapshot().messages.length))===0,'Fresh mount retained conversation');
     await page.evaluate(()=>{void window.__fullChat.send('Cancel this actual partial response');});
     await page.waitForFunction(expected=>{const state=window.__fullChat.snapshot(),last=state?.messages.at(-1);return state?.isRunning&&last?.role==='assistant'&&last.content.length>100&&last.content.length<expected.length;},expected,{timeout:15000});
     const activeBefore=(await stats()).active;assert(activeBefore>0,'No active HTTP stream at cancellation checkpoint');const partial=await page.evaluate(()=>{const state=window.__fullChat.snapshot();return {running:state.isRunning,messages:state.messages.length,content:state.messages.at(-1).content};});assert(partial.running&&partial.content.length>100&&partial.content.length<expected.length,'Response was no longer partial at cancellation');assert(expected.startsWith(partial.content),'Partial response does not match deterministic expected source');
     await page.evaluate(()=>window.__fullChat.cancel());await page.waitForFunction(()=>!window.__fullChat.snapshot()?.isRunning);await page.evaluate(()=>window.__fullChat.unmount());await drain();assert(await page.evaluate(()=>document.querySelectorAll('#app *').length===0&&window.__fullChat.snapshot()===null),'Unmount did not clear root/store');
     // Remount also verifies cancellation has not poisoned the next real store.
     await page.evaluate(()=>window.__fullChat.mount());await page.waitForFunction(()=>window.__fullChat.snapshot());const fresh=await page.evaluate(()=>window.__fullChat.snapshot());assert(!fresh.isRunning&&!fresh.messages.length&&!fresh.error,'Fresh store invalid after cancellation');await page.evaluate(()=>window.__fullChat.unmount());if(record){row.completed++;row.observations.push({partialChars:partial.content.length,expectedChars:expected.length,activeBefore,activeAfter:0,freshStoreEmpty:true});}
    };
    for(let i=0;i<warmup;i++)await cycle(false);row.before=await checkpoint(page,cdp);for(let i=0;i<cycles;i++)await cycle(true);row.after=await checkpoint(page,cdp);
    row.retention={heapDeltaBytes:row.after.forced.usedSize-row.before.forced.usedSize,nodeDelta:row.after.dom.nodes-row.before.dom.nodes,listenerDelta:row.after.dom.jsEventListeners-row.before.dom.jsEventListeners,sheetDelta:row.after.styles.sheets-row.before.styles.sheets,ruleDelta:row.after.styles.rules-row.before.styles.rules};const budget=Math.max(5*1024**2,row.before.forced.usedSize*.1);row.retention.heapInvestigationBudgetBytes=budget;assert(row.retention.heapDeltaBytes<=budget,'Forced-GC heap retention exceeds investigation budget');assert(row.retention.nodeDelta<=100&&row.retention.listenerDelta<=20,'Retained DOM/listener growth requires investigation');assert(row.retention.sheetDelta<=0&&row.retention.ruleDelta<=0,'Stylesheet/rule growth after repeated partial aborts');assert(row.errors.length===0,'Browser errors: '+row.errors.join(';'));
   }catch(error){row.errors.push(String(error));throw error;}finally{await page.close();await fs.writeFile('results/partial-aborts.json',JSON.stringify(report,null,2)+'\n');}
  }}finally{await browser.close();browser=null;}
 }
 assert(!serverFailure,serverFailure?.message);assert(report.cases.length===4&&report.cases.every(row=>row.completed===cycles),'Missing scenario/arm abort cycles');report.status='passed';console.log(JSON.stringify({status:report.status,cases:report.cases.length,partialAborts:report.cases.reduce((n,row)=>n+row.completed,0)}));
}catch(error){report.failures.push({message:serverFailure?.message||error.message,stack:error.stack,serverLogs});process.exitCode=1;}finally{clearTimeout(watchdog);report.finishedAt=new Date().toISOString();await fs.writeFile('results/partial-aborts.json',JSON.stringify(report,null,2)+'\n');await browser?.close();if(child&&child.exitCode===null&&child.signalCode===null){child.kill('SIGTERM');await Promise.race([new Promise(resolve=>child.once('exit',resolve)),pause(3000).then(()=>{if(child.exitCode===null&&child.signalCode===null)child.kill('SIGKILL');})]);}}
