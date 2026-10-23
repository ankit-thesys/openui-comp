// Production experiment. Unlike the reference policies, regressions here fail the command.
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome',headless:true});
const url=process.env.NEXT_URL||'http://127.0.0.1:4179';
const fields=el=>({background:getComputedStyle(el).backgroundColor,padding:getComputedStyle(el).padding,text:el.textContent});
const noJS=await browser.newContext({javaScriptEnabled:false});
const p=await noJS.newPage();await p.goto(url,{waitUntil:'networkidle'});
const pre=await p.locator('[data-testid=next-button]').first().evaluate(fields);
const serverStyleCount=await p.locator('style[data-href^="openui-prototype-"]').count();
await noJS.close();
const page=await browser.newPage();const consoleErrors=[];
page.on('pageerror',e=>consoleErrors.push(e.message));
page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
await page.addInitScript(()=>{
 window.__lateObservations=[];
 // Observe both insertion and React's streamed-boundary reveal; inspect only visible content.
 new MutationObserver(()=>{
  for(const el of document.querySelectorAll('[data-testid=next-late-button]')){
   if(el.getClientRects().length)window.__lateObservations.push({background:getComputedStyle(el).backgroundColor,padding:getComputedStyle(el).padding});
  }
 }).observe(document,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','style']});
});
await page.goto(url);await page.waitForFunction(()=>document.documentElement.dataset.hydrated==='true');
await page.locator('[data-testid=streamed] [data-testid=next-late-button]').waitFor({state:'visible'});
const lateObservations=await page.evaluate(()=>window.__lateObservations.slice());
const post=await page.locator('[data-testid=next-button]').first().evaluate(fields);
await page.locator('[data-testid=next-button]').first().click();
const interactive=(await page.locator('[data-testid=next-button]').first().textContent()).endsWith('1');
const late=await page.locator('[data-testid=streamed] [data-testid=next-late-button]').evaluate(fields);
const hostBefore=await page.locator('[data-testid=host-goober]').evaluate(fields);
const hostSheetBefore=await page.locator('#_goober').textContent();
const styleCountBefore=await page.locator('style[data-href^="openui-prototype-"]').count();
for(let i=0;i<6;i++)await page.locator('[data-testid=host-goober]').click();
const hostAfter=await page.locator('[data-testid=host-goober]').evaluate(fields);
const hostSheetAfter=await page.locator('#_goober').textContent();
const styleCountAfter=await page.locator('style[data-href^="openui-prototype-"]').count();
await page.getByRole('link',{name:'Change theme route'}).click();
await page.waitForURL('**/?theme=red');
await page.waitForFunction(()=>getComputedStyle(document.querySelector('[data-testid=next-button]')).backgroundColor==='rgb(176, 48, 48)');
const navigation=await page.locator('[data-testid=next-button]').first().evaluate(fields);

// Concurrent independent browser documents test initial styles with JavaScript disabled.
const concurrentContext=await browser.newContext({javaScriptEnabled:false});
const concurrent=await Promise.all(Array.from({length:8},async(_,i)=>{
 const theme=i%2?'red':'blue';const tab=await concurrentContext.newPage();await tab.goto(url+'/?theme='+theme,{waitUntil:'networkidle'});
 const observed=await tab.locator('[data-testid=next-button]').first().evaluate(fields);await tab.close();
 return {theme,...observed,pass:observed.background===(theme==='red'?'rgb(176, 48, 48)':'rgb(51, 71, 176)')};
}));await concurrentContext.close();
// Inspect real production streaming: initial shell and delayed boundary arrive separately.
const response=await fetch(url+'/?theme=blue');const reader=response.body.getReader();const decoder=new TextDecoder();const chunks=[];let html='';
while(true){const {value,done}=await reader.read();if(done)break;const text=decoder.decode(value,{stream:true});chunks.push(text);html+=text;}
const shellChunk=chunks.findIndex(x=>x.includes('data-testid="next-button"'));
const lateChunk=chunks.findIndex(x=>x.includes('data-testid="next-late-button"'));
const {artifacts}=await import('../lib/generated-styles.js');
const lateStyleIndex=html.indexOf('data-href="'+artifacts.unlayered.late.href+'"');
const revealIndex=html.indexOf('$RR("B:');
const checks={
 serverStyled:pre.background==='rgb(51, 71, 176)'&&pre.padding==='12px 18px',
 hydratedStyled:post.background===pre.background&&post.padding===pre.padding,
 interactive,
 streamedStyled:late.background==='rgb(18, 108, 72)'&&late.padding==='12px 18px',
 noVisibleUnstyledDelayedContent:lateObservations.length>0&&lateObservations.every(x=>x.background==='rgb(18, 108, 72)'&&x.padding==='12px 18px'),
 resourceDeduplicated:serverStyleCount===2&&styleCountBefore===2&&styleCountAfter===2,
 hostPreserved:hostBefore.background==='rgb(12, 130, 120)'&&hostBefore.background===hostAfter.background&&hostSheetBefore===hostSheetAfter,
 navigationStyled:navigation.background==='rgb(176, 48, 48)',
 concurrentRequestsIsolated:concurrent.every(x=>x.pass),
 streamObserved:shellChunk>=0&&lateChunk>shellChunk,
 streamedCSSBeforeReveal:lateStyleIndex>=0&&revealIndex>lateStyleIndex,
 noBrowserErrors:consoleErrors.length===0,
};
const nextVersion=JSON.parse(await fs.readFile('next-fixture/node_modules/next/package.json','utf8')).version;
const result={nextVersion,mode:process.env.NEXT_MODE||'next build + next start (production), React 19 component stylesheet resources',consumerSetup:'Import and render Button only: no component CSS import, registry, provider, extraction call or styling plugin',libraryWork:'Goober compilation in a library-only build process; generated immutable CSS; component-owned React 19 style resources',beforeJavaScript:pre,afterHydration:post,serverStyled:checks.serverStyled,clientStyled:checks.hydratedStyled,checks,serverStyleCount,styleCountBefore,styleCountAfter,late,lateObservations,hostBefore,hostAfter,navigation,concurrent,stream:{chunkCount:chunks.length,shellChunk,lateChunk,lateStyleIndex,revealIndex},consoleErrors,limitations:['React 19 required; React 18 not covered','Static Goober-generated rules and dynamic CSS variables; arbitrary runtime style creation not covered','Next.js fixture has no CSS framework: Tailwind matrix is tested separately with an explicit policy','Representative components, Chromium only','No strict CSP/nonce or cross-version validation']};
await fs.writeFile('results/next.json',JSON.stringify(result,null,2));
await fs.writeFile('results/NEXT.md','# Goober in Next.js App Router — generated production result\n\n```json\n'+JSON.stringify(result,null,2)+'\n```\n');
console.log(JSON.stringify(result,null,2));await browser.close();
if(!Object.values(checks).every(Boolean))process.exitCode=1;
