import {chromium,webkit} from 'playwright';import fs from 'node:fs/promises';import {createHash} from 'node:crypto';
const origin=process.env.REAL_URL||'http://127.0.0.1:4180';const results=[],failures=[];
const browser=await chromium.launch({channel:'chrome',headless:true});
const tests=process.env.REAL_BROWSER_QUICK==='1'?[{size:2,rate:60,chunkBytes:64,pairs:1,cpu:1}]:[{size:5,rate:60,chunkBytes:64,pairs:10,cpu:1},{size:20,rate:120,chunkBytes:128,pairs:5,cpu:1},{size:5,rate:60,chunkBytes:64,pairs:3,cpu:4}];
try{
 const page=await browser.newPage({viewport:{width:1400,height:950}});const cdp=await page.context().newCDPSession(page);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const test of tests){await cdp.send('Emulation.setCPUThrottlingRate',{rate:test.cpu});for(const scenario of ['chat','dashboard']){
  // Two warmup runs are excluded; measured pairs alternate order.
  for(let pair=-1;pair<test.pairs;pair++){const rows=[];
   for(const arm of pair%2===0?['baseline','generated']:['generated','baseline']){
    await page.goto(origin);await page.locator('#stage').evaluate((el,url)=>{const f=document.createElement('iframe');f.src=url;f.className='bench-frame';el.replaceChildren(f);},'/replay?'+new URLSearchParams({fixture:'1',scenario,arm,size:test.size,rate:test.rate,chunkBytes:test.chunkBytes,runId:'automated'}));
    const frame=page.frames().find(f=>f.url().includes('/replay?'))||await new Promise(resolve=>page.once('framenavigated',resolve));
    await frame.waitForFunction(()=>window.__realReady&&document.querySelector('input'),{},{timeout:30000});await page.waitForTimeout(500);
    await frame.evaluate(()=>window.postMessage({marker:'real-openui-perf',type:'unused'},location.origin));
    await page.evaluate(()=>document.querySelector('iframe').contentWindow.postMessage({marker:'real-openui-perf',type:'start'},location.origin));
    // Fixed typing activity in every measured arm; it is a responsiveness probe, not field INP.
    await page.waitForTimeout(150);await frame.locator('#typing').pressSequentially('performance check',{delay:20});
    await frame.waitForFunction(()=>window.__realResult,{},{timeout:180000});const r=await frame.evaluate(()=>window.__realResult);
    r.test={...test,scenario,pair};r.browser={engine:'chromium',version:browser.version()};
    const expected={inputs:test.size,buttons:test.size*2,tables:scenario==='dashboard'?test.size:0};
    const valid=r.status==='complete'&&r.finalContentMatches&&r.parserCalls>0&&r.errors.length===0&&r.rulesBefore===r.rulesAfter&&Object.entries(expected).every(([k,v])=>r.rendered[k]===v)&&(scenario!=='dashboard'||r.rendered.svgs>=test.size);
    if(!valid)failures.push({scenario,arm,test,pair,reason:'runtime/content/stylesheet invariant',result:r});
    r.rendered.textHash=createHash('sha256').update(r.rendered.text).digest('hex');delete r.rendered.text;
    rows.push(r);if(pair>=0)results.push(r);
   }
   if(rows[0].rendered.textHash!==rows[1].rendered.textHash||JSON.stringify(rows[0].styleFingerprint)!==JSON.stringify(rows[1].styleFingerprint))failures.push({scenario,test,pair,reason:'baseline/candidate DOM text or sampled computed-style mismatch'});
   console.log(`${scenario} size=${test.size} CPU=${test.cpu} pair=${pair}: ${rows.map(r=>r.config.arm+' '+r.durationMs.toFixed(0)+'ms').join(' / ')}`);
  }
 }}
 if(errors.length)failures.push({reason:'page errors',errors});
 await fs.writeFile('results/real-browser.json',JSON.stringify({generatedAt:new Date().toISOString(),scope:'Actual OpenUI library/headless stream adapter/parser/Renderer; same source components and client bundle; only build-time CSS generation differs. Local production bundle, instrumented parser timing. Fixed typing activity, not field INP. CPU slowdown is simulation. No complete ChatProvider/store integration or arbitrary runtime styling.',tests,results,failures},null,2));
}finally{await browser.close();}
if(failures.length)process.exitCode=1;
