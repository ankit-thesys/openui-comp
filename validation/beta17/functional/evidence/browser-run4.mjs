import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {makeCell} from '../fixtures/payloads.mjs';
const consumer=path.resolve(process.env.BETA17_CONSUMER ?? '/private/tmp/beta17-consumer');
const manifest=JSON.parse(await fs.readFile(path.join(consumer,'handoff.json'),'utf8'));
const require=createRequire(path.resolve('packages/react-ui-core/package.json'));
const {chromium}=require('playwright');
const server=spawn(process.execPath,['validation/beta17/fixtures/server.mjs'],{env:{...process.env,BETA17_DIST:manifest.dist},stdio:['ignore','pipe','pipe']});
const results=[];let browser;
try{
 await Promise.race([once(server.stdout,'data'),once(server,'exit').then(()=>{throw Error('Fixture server exited');})]);
 browser=await chromium.launch({channel:"chrome",headless:true});
 for(const framework of ['plain','tailwind3','tailwind4'])for(const order of ['before','after'])for(const workload of ['chat','dashboard'])for(const load of ['paced','stress'])for(const arm of ['baseline','runtime']){
  const session=`functional-${framework}-${order}-${workload}-${load}-${arm}`,cell=makeCell(workload,load);
  console.error('CASE',framework,order,workload,load,arm);
  const page=await browser.newPage({viewport:{width:1280,height:900}});page.setDefaultTimeout(10000);const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(`${manifest.origin}/${arm}/?workload=${workload}&load=${load}&framework=${framework}&order=${order}&session=${session}`);
  await page.locator('#ready').waitFor();
  await page.waitForFunction(()=>[...document.styleSheets].some(s=>s.href?.includes('/host/')));
  const actualOrder=await page.evaluate(arm=>{
    const host=document.querySelector('link[href*="/host/"]');
    const product=arm==='runtime'?document.getElementById('_goober'):document.querySelector('link[href*="/baseline/assets/"]');
    if(!host||!product)throw Error('Missing host or product stylesheet');
    return host.compareDocumentPosition(product)&Node.DOCUMENT_POSITION_FOLLOWING?'before':'after';
  },arm);
  assert.equal(actualOrder,order,'Actual stylesheet order must match the cell');
  if(load==='paced'){
    await page.locator('#start-stream').click();
    await page.waitForFunction(()=>document.querySelector('#status').textContent==='streaming'&&document.querySelector('#message-source').textContent.length>0);
    await page.waitForFunction(workload=>document.querySelector('#status').textContent==='streaming'&&document.querySelector('main').innerText.includes(`${workload} section 0`),workload);
    const partial=await page.locator('#message-source').textContent();
    assert(partial.length>0&&partial.length<cell.payload.length&&cell.payload.startsWith(partial));
    const active=await (await fetch(`${manifest.origin}/stats?session=${session}`)).json();
    assert.equal(active.active,1,'Cancellation starts during a live HTTP stream');
    await page.locator('#cancel-stream').click();
    await page.waitForFunction(()=>document.querySelector('#status').textContent==='idle');
    await new Promise(r=>setTimeout(r,100));
    const cancelled=await (await fetch(`${manifest.origin}/stats?session=${session}`)).json();
    assert.equal(cancelled.cancelled,1,'Must cancel a live request, not a completed response');
    assert.equal(cancelled.active,0);assert.equal(cancelled.activeTimers,0);
  }
  await page.locator('#start-stream').click();
  await page.waitForFunction(expected=>document.querySelector('#status').textContent==='idle'&&document.querySelector('#message-source').textContent===expected,cell.payload,{timeout:30000});
  assert.equal(await page.locator('main table').count(),cell.tables);
  const text=await page.locator('main').innerText();assert(text.includes(`${workload} section 0`));
  assert(!text.includes('Unknown component'));assert(text.includes('Show the next quarter'));
  if(workload==='dashboard'){
   await page.waitForFunction(expected=>[...document.querySelectorAll('main .openui-bar-chart-bar')].filter(r=>{const b=r.getBoundingClientRect();return b.width>0&&b.height>0;}).length===expected,cell.bars);
  }
  await page.getByPlaceholder('Your name').fill('Ada');
  await page.getByText('Send details',{exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('#action').textContent.includes('Send details'));
  assert((await page.locator('#action').textContent()).includes('Ada'));
  await page.getByText('Show the next quarter',{exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('#action').textContent.includes('Show the next quarter'));
  await page.locator('#theme-hue').fill('#a020f0');
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('main')).getPropertyValue('--openui-interactive-accent-default').trim()==='#a020f0');
  await page.locator('#prompt').fill('Next question');
  assert.equal(await page.locator('#prompt').inputValue(),'Next question');
  await page.locator('#clear').click();await page.waitForFunction(()=>document.querySelector('#message-source').textContent==='');
  await page.locator('#history').click();await page.waitForFunction(expected=>document.querySelector('#message-source').textContent===expected,cell.payload);
  if(load==='paced'){
    await page.locator('#start-stream').click();
    await page.waitForFunction(()=>document.querySelector('#status').textContent==='streaming'&&document.querySelector('#message-source').textContent.length>0);
    const live=await (await fetch(`${manifest.origin}/stats?session=${session}`)).json();assert.equal(live.active,1);
  }
  await page.locator('#unmount').click();assert.equal(await page.locator('main').innerHTML(),'');
  await new Promise(r=>setTimeout(r,100));
  const stats=await page.evaluate(async session=>fetch('/stats?session='+session).then(r=>r.json()),session);
  assert.equal(stats.cancelled,load==='paced'?2:0);assert.equal(stats.completed,1);assert.equal(stats.active,0);assert.equal(stats.activeTimers,0);assert.deepEqual(errors,[]);
  results.push({framework,order,actualOrder,workload,load,arm,stats,tables:cell.tables,errors});
  await page.close();
 }
 console.log(JSON.stringify({status:'pass',browser:browser.version(),cases:results.length,results},null,2));
}catch(error){console.error(JSON.stringify({status:'failed',completed:results,error:String(error)},null,2));process.exitCode=1;}
finally{await browser?.close();server.kill();if(server.exitCode===null)await once(server,'exit');}
