// Bounded correctness smoke: no benchmark samples are retained for acceptance.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const [manifestPath,output]=process.argv.slice(2);
assert.equal(process.env.BETA17_QUIET_WINDOW_RELEASED,'yes');
const m=JSON.parse(await fs.readFile(manifestPath,'utf8'));
const worker=path.resolve(process.env.BETA17_PERFORMANCE_ROOT??'/Users/ankitdas/.codex/worktrees/63b2/openui/validation/beta17/performance');
const {openArm,mount,measureStream,unmount,closeArm}=await import(pathToFileURL(path.join(worker,'browser.mjs')));
const require=createRequire(path.join(m.consumer,'package.json'));
const {chromium}=require(process.env.BETA17_PLAYWRIGHT_MODULE);
const result={kind:'cell-transition-correctness-only',cells:[],errors:[]};
for(const [workload,load]of [['chat','paced'],['dashboard','stress']]){
 const hosts=[];let error;
 try{
  for(const arm of ['baseline','runtime']){
   const host=await openArm(chromium,m,workload,load,arm);hosts.push(host);
   await mount(host,m,220);const observation=await measureStream(host,m);
   assert.equal(observation.actualText,m.cells[`${workload}/${load}`].expectedText);
   await unmount(host,m);
  }
 }catch(cause){error=cause;}
 finally{
  const closed=await Promise.allSettled(hosts.map(closeArm));
  const failures=closed.filter(x=>x.status==='rejected');
  result.cells.push({workload,load,opened:hosts.length,closed:closed.filter(x=>x.status==='fulfilled').length,errors:failures.map(x=>String(x.reason))});
  if(error||failures.length){result.errors.push(String(error??failures[0].reason));break;}
 }
}
await fs.writeFile(output,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
assert.deepEqual(result.errors,[]);assert.equal(result.cells.length,2);assert(result.cells.every(c=>c.opened===2&&c.closed===2));
console.log(JSON.stringify({status:'pass',opened:4,closed:4,nextCellReached:true}));
