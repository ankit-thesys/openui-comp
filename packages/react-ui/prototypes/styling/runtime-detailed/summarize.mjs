import fs from 'node:fs/promises';
const read=async n=>JSON.parse(await fs.readFile(new URL('results/'+n,import.meta.url)));
const median=a=>{a=[...a].sort((a,b)=>a-b);return a.length%2?a[(a.length-1)/2]:(a[a.length/2-1]+a[a.length/2])/2};
const report={at:new Date().toISOString(),accepted:false,performance:[]};
const b=await read('browser.json');
for(const load of ['normal','pressure'])for(const scenario of ['chat','dashboard']){
 const rows=b.runs.filter(r=>r.load.name===load&&r.scenario===scenario);
 const base=rows.filter(r=>r.arm==='baseline'),runtime=rows.filter(r=>r.arm==='runtime');
 const pairs=base.map(a=>{const c=runtime.find(x=>x.pair===a.pair);return {pair:a.pair,baselineMs:a.durationMs,runtimeMs:c.durationMs,deltaMs:c.durationMs-a.durationMs,percent:100*(c.durationMs-a.durationMs)/a.durationMs}});
 const summary={load,scenario,pairs: pairs.length,baselineMedianMs:median(base.map(r=>r.durationMs)),runtimeMedianMs:median(runtime.map(r=>r.durationMs)),pairedMedianDeltaMs:median(pairs.map(x=>x.deltaMs)),pairedMedianPercent:median(pairs.map(x=>x.percent)),pairedRangePercent:[Math.min(...pairs.map(x=>x.percent)),Math.max(...pairs.map(x=>x.percent))],runtimeGooberMedianMs:median(runtime.map(r=>r.runtimeMetrics.compileMs)),baselineUpdateP95MedianMs:median(base.map(r=>r.updateP95Ms)),runtimeUpdateP95MedianMs:median(runtime.map(r=>r.updateP95Ms)),baselineInputP95MedianMs:median(base.map(r=>r.inputP95Ms)),runtimeInputP95MedianMs:median(runtime.map(r=>r.inputP95Ms)),baselineLongTasks:base.reduce((n,r)=>n+r.longTaskCount,0),runtimeLongTasks:runtime.reduce((n,r)=>n+r.longTaskCount,0),pairedObservations:pairs};
 report.performance.push(summary);
}
report.browser={status:b.status,measuredRuns:b.runs.length,failures:b.failures,standalone:b.standalone,activeStreams:b.activeStreams};
const n=await read('next-runtime.json');report.next={status:n.status,checks:Object.keys(n.checks).length,failed:Object.entries(n.checks).filter(([,v])=>!v).map(([k])=>k),errors:n.errors,pressureResponses:n.pressure.responses.length};
report.bundle=await read('bundle.json');
try{const s=await read('soak-server.json');report.soak={status:s.status,scope:s.scope,startedAt:s.startedAt,finishedAt:s.finishedAt,failures:s.failures,workers:s.workers.map(w=>({arm:w.arm,themeMode:w.themeMode,counts:w.counts,retainedHeapDelta:w.retainedHeapDelta,retainedHeapPercent:w.retainedHeapPercent,checkpoints:w.checkpoints,errors:w.errors})),cardinalityComparison:s.cardinalityComparison};}catch{report.soak={status:'not-yet-available'}}
await fs.writeFile(new URL('results/detailed-summary.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,bundle:report.bundle.results.map(({inputs,...r})=>r),soak:{status:report.soak.status,workers:report.soak.workers?.map(({checkpoints,...r})=>r)}},null,2));
