import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const cases=[];const errors=[];const page=await browser.newPage({viewport:{width:1440,height:1000}});
page.on('pageerror',e=>errors.push(e.message));
try{
 for(const test of [{framework:'plain',count:'25',rate:'60'},{framework:'tailwind3',count:'100',rate:'60'},{framework:'tailwind4',count:'500',rate:'120'}]){
  await page.goto((process.env.PROTOTYPE_URL||'http://127.0.0.1:4177')+'/performance.html');
  for(const [key,value]of Object.entries({...test,seconds:'5',scenario:'both',pairs:'1'}))await page.locator('#'+key).selectOption(value);
  await page.locator('#start').click();
  let lastURL='',checks=[];const deadline=Date.now()+90000;
  while(!(await page.locator('#start').isEnabled())){
   if(Date.now()>deadline)throw Error('Comparison timed out');
   const frame=page.frames().find(f=>f.url().includes('performance-fixture.html?'));
   if(frame&&frame.url()!==lastURL){try{await frame.waitForFunction(()=>document.querySelector('#progress')?.textContent.includes('chunks'));await frame.locator('#typing').fill('Testing responsiveness');await frame.locator('#ping').click();const button=frame.locator('[data-testid=next-button]').first();await button.waitFor();const style=await button.evaluate(el=>{const s=getComputedStyle(el);return {background:s.backgroundColor,padding:s.padding};});checks.push({url:frame.url(),style});lastURL=frame.url();}catch(e){if(!/detached|destroyed/.test(e.message))throw e;}}
   await page.waitForTimeout(150);
  }
  const results=await page.evaluate(()=>window.__performanceResults);
  const pass=results.length===4&&results.every(r=>r.status==='complete'&&r.finalContentMatches&&r.receivedChunks===r.scheduledChunks&&r.rulesBefore===r.rulesAfter&&r.sheetsBefore===r.sheetsAfter&&r.updateOpportunityP95Ms!==null&&r.inputSamples>=1)&&checks.length===4&&checks.every(c=>c.style.background==='rgb(51, 71, 176)'&&c.style.padding==='12px 18px');
  cases.push({test,pass,styleChecks:checks,results:results.map(({samples,...summary})=>summary)});console.log(test.framework+': '+(pass?'PASS':'FAIL'));
 }
 await page.locator('#scenario').selectOption('chat');await page.locator('#seconds').selectOption('30');await page.locator('#start').click();await page.waitForTimeout(1200);await page.locator('#stop').click();await page.waitForFunction(()=>!document.querySelector('#start').disabled);const stopped=await page.evaluate(()=>window.__performanceResults);const stopPass=stopped.length===1&&stopped[0].status==='stopped';
 const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadPromise;const file=await download.path();const exported=JSON.parse(await fs.readFile(file,'utf8'));const exportPass=exported.results.length===stopped.length&&exported.scope.includes('Synthetic');
 const report={generatedAt:new Date().toISOString(),scope:'Smoke validation of runnable synthetic lab, not a statistical performance/adoption benchmark',browser:browser.version(),cases,stopPass,exportPass,errors};await fs.writeFile('results/performance-smoke.json',JSON.stringify(report,null,2));await page.screenshot({path:'results/performance-lab.png',fullPage:true});if(cases.some(c=>!c.pass)||!stopPass||!exportPass||errors.length)process.exitCode=1;
 console.log(JSON.stringify({stopPass,exportPass,errors}));
}finally{await browser.close();}
