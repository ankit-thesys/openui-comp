import React from 'react';
import {renderToPipeableStream} from 'react-dom/server';
import {Writable} from 'node:stream';
import {Fixture} from './Fixture';

const workerStartedAt=new Date().toISOString(),workerStarted=performance.now();
const arm=process.env.SOAK_ARM==='baseline'?'baseline':'runtime';
const themeMode=process.env.SOAK_THEMES==='unique'?'unique':'finite';
const perScenario=Math.max(1,Number(process.env.SOAK_RENDER_COUNT)||1000),warmup=40;
const report:any={startedAt:workerStartedAt,arm,themeMode,pid:process.pid,perScenario,warmup,concurrency:4,counts:{chat:0,dashboard:0},bytes:0,checkpoints:[],errors:[],control:'Theme tokens delivered as React inline style on actual boundary; component Goober unchanged; SSR-only diagnostic, not accepted fix or browser validation',scope:'Actual Fixture streaming SSR. Each render drains to a discarded writable; four concurrent renders per batch. Finite themes alternate red/blue; unique accents intentionally stress Goober process-global serialization caches. No retained response strings or consumer CSS.'};
const uniqueAccent=(i:number)=>`oklch(0.55 0.2 ${(i*0.137+13).toFixed(6)} / 1)`;
let activeStreams=0,completedStreams=0,timedOutStreams=0;
async function render(index:number,warming=false){
 const scenario=index%2?'dashboard':'chat',theme=index%4<2?'blue':'red';
 const accent=themeMode==='unique'?uniqueAccent(index+(warming?1000000:0)):undefined;
 const expectedAccent=accent??(theme==='red'?'oklch(0.55 0.2 25 / 1)':'oklch(0.55 0.2 260 / 1)');
 let html='';activeStreams++;
 try{await new Promise<void>((resolve,reject)=>{
  let settled=false,timer:ReturnType<typeof setTimeout>,stream:ReturnType<typeof renderToPipeableStream>;
  const finish=(error?:unknown)=>{if(settled)return;settled=true;clearTimeout(timer);if(error){stream?.abort();destination.destroy();reject(error);}else{completedStreams++;resolve();}};
  const destination=new Writable({write(chunk,_encoding,next){html+=chunk.toString();next();}});
  destination.once('error',finish);destination.once('finish',()=>finish());
  timer=setTimeout(()=>{timedOutStreams++;finish(Error('Individual render timeout'));},15000);
  stream=renderToPipeableStream(<Fixture scenario={scenario} arm={arm} theme={theme} accent={accent} size={2}/>,{onAllReady(){stream.pipe(destination);},onError(error){report.errors.push(String(error));finish(error);}});
 });
 if(!html.includes(scenario==='dashboard'?'Regional revenue dashboard':'OpenUI research conversation')||!html.includes('openui-input')||(scenario==='dashboard'&&!html.includes('openui-table')))throw Error('Actual Fixture SSR content missing for '+scenario);
 if(arm==='runtime'){
  if(!html.includes('openui-runtime-v1:Button:')||!html.includes('openui-runtime-v1:Input:'))throw Error('Actual runtime component resources missing');
  if(html.includes('openui-runtime-v1:Theme:'))throw Error('Theme Goober resource unexpectedly retained by inline control');
  const boundaries=[...html.matchAll(/<section\b[^>]*data-arm="runtime"[^>]*style="([^"]+)"[^>]*>/g)];
  if(boundaries.length!==1)throw Error('Expected one correct inline-token runtime boundary');
  const declarations=[...boundaries[0][1].matchAll(/--openui-interactive-accent-default:([^;}]+)/g)].map(match=>match[1].trim());
  if(declarations.length!==1||declarations[0]!==expectedAccent)throw Error('Inline token theme isolation mismatch '+JSON.stringify({expectedAccent,declarations}));
 }
 if(!warming){report.counts[scenario]++;report.bytes+=Buffer.byteLength(html);}
 }finally{activeStreams--;}
}
async function checkpoint(stage:string){if(activeStreams!==0)throw Error('Streams active at checkpoint');await new Promise(resolve=>setImmediate(resolve));const natural=process.memoryUsage();if(!global.gc)throw Error('--expose-gc required');global.gc();global.gc();await new Promise(resolve=>setImmediate(resolve));global.gc();report.checkpoints.push({stage,activeStreams,completedStreams,timedOutStreams,completed:report.counts.chat+report.counts.dashboard,natural,forced:process.memoryUsage()});}
async function main(){try{await checkpoint('cold');for(let i=0;i<warmup;i+=4)await Promise.all(Array.from({length:4},(_,j)=>render(i+j,true)));await checkpoint('warm');const total=perScenario*2;for(let i=0;i<total;i+=4){await Promise.all(Array.from({length:Math.min(4,total-i)},(_,j)=>render(i+j)));if((i+4)%250<4)await checkpoint('interval');}await checkpoint('after-load');await new Promise(resolve=>setTimeout(resolve,500));await checkpoint('idle');const warm=report.checkpoints.find((x:any)=>x.stage==='warm'),end=report.checkpoints.at(-1);report.activeStreams=activeStreams;report.completedStreams=completedStreams;report.timedOutStreams=timedOutStreams;if(activeStreams||timedOutStreams)throw Error('Stream cleanup/timeout failure');report.retainedHeapDelta=end.forced.heapUsed-warm.forced.heapUsed;report.retainedHeapPercent=100*report.retainedHeapDelta/warm.forced.heapUsed;report.status=report.errors.length?'failed':'passed';}catch(error){report.status='failed';report.errors.push(String(error));process.exitCode=1;}finally{report.finishedAt=new Date().toISOString();report.elapsedMs=performance.now()-workerStarted;report.elapsedInterpretation='Bounded diagnostic execution duration, not controlled SSR latency or throughput benchmark';process.stdout.write(JSON.stringify(report)+'\n');}

}
void main();
