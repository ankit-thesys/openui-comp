import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {makeCell} from '../fixtures/payloads.mjs';
test('replay is deterministic and schedules cover exact UTF-8 bytes',()=>{
 for(const workload of ['chat','dashboard']) for(const load of ['paced','stress']){
  const a=makeCell(workload,load),b=makeCell(workload,load);
  assert.deepEqual(a,b);
  assert.equal(a.schedule.reduce((n,x)=>n+x.bytes,0),Buffer.byteLength(a.payload));
  assert.equal(a.tables,load==='paced'?2:6);
  assert.equal(a.bars,workload==='dashboard'?a.size*3:0);
 }
});
test('HTTP replay completion and active cancellation clean session timers',async()=>{
 const child=spawn(process.execPath,['validation/beta17/fixtures/server.mjs'],{env:{...process.env,BETA17_DIST:'/private/tmp',BETA17_PORT:'4198'},stdio:['ignore','pipe','pipe']});
 try{
  await once(child.stdout,'data');
  const base='http://127.0.0.1:4198';
  const expected=makeCell('chat','stress');
  assert.equal(await (await fetch(base+'/stream?workload=chat&load=stress&session=complete')).text(),expected.payload);
  const abort=new AbortController();
  const result=await fetch(base+'/stream?workload=chat&load=paced&session=cancel',{signal:abort.signal});
  const reader=result.body.getReader();assert.equal((await reader.read()).done,false);abort.abort();
  await new Promise(r=>setTimeout(r,100));
  const complete=await (await fetch(base+'/stats?session=complete')).json();
  const cancelled=await (await fetch(base+'/stats?session=cancel')).json();
  assert.deepEqual(complete,{started:1,completed:1,cancelled:0,active:0,activeTimers:0});
  assert.deepEqual(cancelled,{started:1,completed:0,cancelled:1,active:0,activeTimers:0});
 }finally{child.kill();await once(child,'exit');}
});
