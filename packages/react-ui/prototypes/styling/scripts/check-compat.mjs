import {chromium,firefox,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
const frameworks=['none','tailwind3','tailwind4','bootstrap','plain'];
const children=[];const results=[];const streaming={};const executionErrors=[];
const fields=el=>{const s=getComputedStyle(el);return {background:s.backgroundColor,padding:s.padding,borderRadius:s.borderRadius,color:s.color};};
const same=(a,b)=>['background','padding','borderRadius'].every(k=>a[k]===b[k]);
try{
 for(const [i,framework] of frameworks.entries()){
  const port=4210+i;const url='http://127.0.0.1:'+port;
  try{await fetch(url);throw Error('Port already occupied: '+port);}catch(e){if(e.message.startsWith('Port already'))throw e;}
  const p=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{cwd:path.resolve('.compat',framework),stdio:'pipe'});children.push(p);let logs='';p.stderr.on('data',d=>logs+=d);p.stdout.on('data',d=>logs+=d);
  let ready=false;for(let j=0;j<80;j++){if(p.exitCode!==null)throw Error(logs);try{if((await fetch(url)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,250));}if(!ready)throw Error('Server not ready: '+logs);
 }
 for(const [i,framework]of frameworks.entries()){
  const url='http://127.0.0.1:'+(4210+i);const response=await fetch(url);const reader=response.body.getReader();const decoder=new TextDecoder();const chunks=[];
  while(true){const {value,done}=await reader.read();if(done)break;chunks.push(decoder.decode(value,{stream:true}));}
  const html=chunks.join('');const tags=[...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)];
  let css='';for(const match of tags){const href=match[0].match(/href="([^"]+)"/)[1];css+=await(await fetch(new URL(href,url))).text();}
  const module=await import(new URL('../.compat/'+framework+'/node_modules/@openui/goober-compat-prototype/generated-styles.js',import.meta.url));
  const mode=framework==='tailwind4'?'layered':'unlayered';const artifact=module.artifacts[mode];
  const shellChunk=chunks.findIndex(x=>x.includes('data-testid="base"'));const lateChunk=chunks.findIndex(x=>x.includes('data-testid="late"'));
  streaming[framework]={shellChunk,lateChunk,distinctChunks:lateChunk>shellChunk&&shellChunk>=0,stylesheetBeforeContent:tags.length>0&&tags[0].index<html.indexOf('data-testid="base"'),lateRulesInInitialStylesheet:css.includes('.'+artifact.late.className),cssBytes:css.length};
 }
 for(const [name,engine] of Object.entries({chromium,firefox,webkit})){
  let browser;try{browser=await engine.launch(name==='chromium'?{channel:'chrome',headless:true}:{headless:true});}catch(e){executionErrors.push({browser:name,stage:'launch',error:e.message.slice(0,1400)});continue;}
  for(const [i,framework] of frameworks.entries()){
   const url='http://127.0.0.1:'+(4210+i);const data={browser:name,version:browser.version(),framework};
   const noJS=await browser.newContext({javaScriptEnabled:false});const page=await noJS.newPage();
   try{
    await page.goto(url,{waitUntil:'networkidle'});
    const pre={base:await page.locator('[data-testid=base]').evaluate(fields),override:await page.locator('[data-testid=override]').evaluate(fields),reference:await page.locator('[data-testid=reference]').evaluate(fields)};
    await noJS.close();
    const client=await browser.newPage();const errors=[];
    await client.addInitScript(()=>{window.__streamObservations=[];new MutationObserver(()=>{const el=document.querySelector('[data-testid=late]');if(el?.getClientRects().length){const st=getComputedStyle(el);window.__streamObservations.push({background:st.backgroundColor,padding:st.padding,borderRadius:st.borderRadius});}}).observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:['style','hidden']});});client.on('pageerror',e=>errors.push(e.message));client.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
    await client.goto(url);await client.waitForFunction(()=>document.documentElement.dataset.hydrated==='true');await client.locator('[data-testid=late]').waitFor({state:'visible'});
    const firstVisibleStream=await client.evaluate(()=>window.__streamObservations.slice());
    const post={base:await client.locator('[data-testid=base]').evaluate(fields),override:await client.locator('[data-testid=override]').evaluate(fields),reference:await client.locator('[data-testid=reference]').evaluate(fields),late:await client.locator('[data-testid=late]').evaluate(fields)};
    await client.locator('[data-testid=override]').hover();await client.waitForTimeout(200);const hover=await client.locator('[data-testid=override]').evaluate(fields);
    await client.locator('[data-testid=reference]').hover();await client.waitForTimeout(200);const referenceHover=await client.locator('[data-testid=reference]').evaluate(fields);
    const sheetCountBefore=await client.evaluate(()=>document.styleSheets.length);
    const hostBefore=await client.locator('[data-testid=host-goober]').evaluate(fields);const sheetBefore=await client.locator('#_goober').textContent();const countBefore=await client.locator('style[data-href^="openui-prototype-"]').count();
    for(let j=0;j<6;j++)await client.locator('[data-testid=host-goober]').click();
    const sheetCountAfter=await client.evaluate(()=>document.styleSheets.length);
    const hostAfter=await client.locator('[data-testid=host-goober]').evaluate(fields);const sheetAfter=await client.locator('#_goober').textContent();const countAfter=await client.locator('style[data-href^="openui-prototype-"]').count();
    await client.locator('[data-testid=base]').click();await client.waitForFunction(()=>document.querySelector('[data-testid=base]').textContent.endsWith('1'));
    await client.getByRole('link',{name:'Navigate'}).click();await client.waitForURL('**/?theme=red');
    await client.waitForFunction(()=>getComputedStyle(document.querySelector('[data-testid=base]')).backgroundColor==='rgb(176, 48, 48)');
    data.checks={streamTransport:streaming[framework].distinctChunks&&streaming[framework].stylesheetBeforeContent&&streaming[framework].lateRulesInInitialStylesheet,baseSSR:pre.base.background==='rgb(51, 71, 176)'&&pre.base.padding==='12px 18px',overrideSSR:framework==='none'||same(pre.override,pre.reference),hydration:same(pre.base,post.base)&&same(pre.override,post.override),overrideClient:framework==='none'||same(post.override,post.reference),hover:framework==='none'?hover.background==='rgb(37, 53, 140)':same(hover,referenceHover),streaming:framework==='none'?post.late.background==='rgb(18, 108, 72)':same(post.late,post.reference),hostPreserved:same(hostBefore,hostAfter)&&sheetBefore===sheetAfter,styleDeduplication:countBefore===0&&countAfter===0&&sheetCountBefore===sheetCountAfter,styledAtStreamReveal:firstVisibleStream.length>0&&firstVisibleStream.every(s=>framework==='none'?s.background==='rgb(18, 108, 72)'&&s.padding==='12px 18px':same(s,post.reference)),interaction:true,navigation:true,noBrowserErrors:errors.length===0};
    data.observed={pre,post,firstVisibleStream,sheetCountBefore,sheetCountAfter,hover,referenceHover,hostBefore,hostAfter,countBefore,countAfter,errors};results.push(data);await client.close();
    console.log(name+' / '+framework+': '+Object.entries(data.checks).filter(([,pass])=>!pass).map(([key])=>key).join(', ')+(Object.values(data.checks).every(Boolean)?'PASS':''));
   }catch(e){executionErrors.push({...data,error:e.message});await noJS.close();}
  }
  await browser.close();
 }
}finally{for(const p of children)p.kill();}
const setup=JSON.parse(await fs.readFile('results/compat-setup.json','utf8'));
const report={generatedAt:new Date().toISOString(),mode:'Installed npm tarball in five standalone production Next.js apps; host CSS imported in root layout; automatic setup from installed direct dependencies',setup,streaming,results,executionErrors,passed:results.filter(r=>Object.values(r.checks).every(Boolean)).length,total:results.length,planned:15,unavailable:15-results.length,limitations:['Representative Button only; full OpenUI component parity not certified','WebKit is Playwright WebKit, not a Safari release certification','Conventional directly declared framework dependencies; CDN-loaded CSS and unusual monorepo layouts need separate handling','Framework CSS compiled by fixture preparation from pinned real packages; no custom Tailwind config variants yet','Installer adds generated stylesheet as the first root-layout import; no hand editing is needed','Static styles for all installed prototype variants are loaded initially; arbitrary runtime-generated rules are outside this path']};
await fs.writeFile('results/compatibility.json',JSON.stringify(report,null,2));
await fs.writeFile('results/COMPATIBILITY.md','# Installed package + automatic framework setup — generated results\n\n'+report.mode+'\n\n| Browser | Framework | Result | Failed checks |\n| --- | --- | --- | --- |\n'+results.map(r=>`| ${r.browser} ${r.version} | ${r.framework} | ${Object.values(r.checks).every(Boolean)?'PASS':'FAIL'} | ${Object.entries(r.checks).filter(([,v])=>!v).map(([k])=>k).join(', ')} |`).join('\n')+'\n\n## Unavailable checks\n\n'+executionErrors.map(x=>'- '+x.browser+': '+x.stage+' failed: '+x.error.split('\n')[0]).join('\n')+'\n\n'+report.limitations.map(x=>'- '+x).join('\n')+'\n');
if(executionErrors.length||report.passed!==15)process.exitCode=1;
