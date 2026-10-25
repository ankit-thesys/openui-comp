import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {makeCell} from '../fixtures/payloads.mjs';
const [manifestPath,out]=process.argv.slice(2);
assert.equal(process.env.BETA17_QUIET_WINDOW_RELEASED,'yes');
assert(path.isAbsolute(manifestPath)&&path.isAbsolute(out));
const worker=path.resolve(process.env.BETA17_PERFORMANCE_ROOT??'/Users/ankitdas/.codex/worktrees/63b2/openui/validation/beta17/performance');
const {installedInventory}=await import(pathToFileURL(path.join(worker,'provenance.mjs')));
const {browserLaunchOptions}=await import(pathToFileURL(path.join(worker,'browser-config.mjs')));
const bytes=await fs.readFile(manifestPath),m=JSON.parse(bytes);
const hash=b=>createHash('sha256').update(b).digest('hex');
assert.equal(m.schemaVersion,1);assert(path.isAbsolute(m.consumer));assert(m.productCommit);
assert(Object.keys(m.inputs).length>0);assert(m.runtimeModules.length>0);
for(const module of m.runtimeModules)assert(Object.hasOwn(m.inputs,module),`Missing exact module key: ${module}`);
async function inventory(){
 const actual={};for(const [file,expected]of Object.entries(m.inputs)){
  assert(path.isAbsolute(file));assert.match(expected,/^[a-f0-9]{64}$/);
  actual[file]=hash(await fs.readFile(file));assert.equal(actual[file],expected,`Changed input: ${file}`);
 }return actual;
}
for(const workload of ['chat','dashboard'])for(const load of ['paced','stress']){
 const c=m.cells[`${workload}/${load}`],expected=makeCell(workload,load);
 assert(c.expectedText&&c.expectedDom&&c.renderedRoot&&c.requiredText.length);
 assert.equal(c.expectedText,expected.payload);assert.equal(c.payloadSha256,expected.payloadSha256);assert.equal(c.scheduleSha256,expected.scheduleSha256);
 for(const arm of ['baseline','runtime'])assert(new URL(c.urls[arm],m.origin));
 for(const p of Object.values(c.expectedDom)){assert(p.selector);assert(Number.isInteger(p.count)&&p.count>=0);}
}
for(const key of ['ready','mounted','mount','unmount','start','cancel','status','message','input','theme'])assert(m.selectors[key]);
const before=await inventory(),installedBefore=await installedInventory(m.consumer);
await browserLaunchOptions(m);
const require=createRequire(path.join(m.consumer,'package.json'));
assert(path.isAbsolute(process.env.BETA17_PLAYWRIGHT_MODULE));assert(require(process.env.BETA17_PLAYWRIGHT_MODULE).chromium);
assert(import.meta.dirname);await fs.mkdir(out); // Existing evidence must never be overwritten.
await fs.copyFile(manifestPath,path.join(out,'manifest.json'));
await fs.mkdir(path.join(out,'runner'));
for(const file of await fs.readdir(worker))if(file.endsWith('.mjs'))await fs.copyFile(path.join(worker,file),path.join(out,'runner',file));
const child=spawn(process.execPath,[path.join(worker,'preflight.mjs'),manifestPath,path.join(out,'browser-preflight.json')],{env:process.env,stdio:['ignore','pipe','pipe']});
let log='';child.stdout.on('data',b=>log+=b);child.stderr.on('data',b=>log+=b);
const [exit]=await once(child,'exit');await fs.writeFile(path.join(out,'browser-preflight.log'),log);assert.equal(exit,0,log);
const report=JSON.parse(await fs.readFile(path.join(out,'browser-preflight.json'),'utf8'));
assert.deepEqual(report.errors,[]);assert.equal(report.runs.length,8);
for(const run of report.runs){
 const c=m.cells[`${run.workload}/${run.load}`];
 assert.equal(run.actualText,c.expectedText);assert.equal(run.actualTextSha256,c.payloadSha256);
 assert.equal(run.status,'idle');assert.equal(run.activeAfter,0);assert.equal(run.timersAfter,0);
 for(const [name,probe]of Object.entries(c.expectedDom))assert.equal(run.domCounts[name],probe.count);
 if(c.expectedDom.bars)assert.equal(run.visibleBarCount,c.expectedDom.bars.count);
 assert(run.requiredTextFound.every(Boolean));
 assert.equal(run.memory.activeStreams,0);assert.equal(run.memory.activeTimers,0);
 assert(run.memory.rss.totalBytes>0);assert(run.memory.rss.processes.every(p=>p.bytes>0));
 if(run.load==='paced'){
  const i=run.inputObservation;assert.equal(i.activeBefore,1);assert.equal(i.activeAfter,1);
  assert.equal(i.statusBefore,'streaming');assert.equal(i.statusAfter,'streaming');assert.notEqual(i.valueBefore,i.valueAfter);
  assert.equal(run.cancellation.activeBefore,1);assert.equal(run.cancellation.activeAfter,0);assert.equal(run.cancellation.timersAfter,0);
 }
}
const after=await inventory(),installedAfter=await installedInventory(m.consumer);
await browserLaunchOptions(m);
assert.deepEqual(after,before);assert.deepEqual(installedAfter,installedBefore);
const result={kind:'complete-readiness-only',status:'pass',browser:m.browser,manifestSha256:hash(bytes),runtimeModuleCount:m.runtimeModules.length,inputCount:Object.keys(before).length,installedCount:Object.keys(installedBefore).length,browserCells:8,inventory:{before,after},installed:{before:installedBefore,after:installedAfter},node:process.version};
await fs.writeFile(path.join(out,'readiness.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:'pass',manifestSha256:result.manifestSha256,browserCells:8,inputs:result.inputCount,runtimeModules:m.runtimeModules.length}));
