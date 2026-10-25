import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import {createRequire} from 'node:module';
const tools=createRequire('/Users/ankitdas/.codex/worktrees/2d0f/openui/packages/react-ui-core/package.json');const{build,preview}=await import(tools.resolve('vite'));const{chromium}=tools('playwright');const root=path.resolve('border-app');
await build({root,configFile:false,esbuild:{jsx:'automatic'},logLevel:'error',build:{outDir:'dist'}});const server=await preview({root,configFile:false,preview:{host:'127.0.0.1',port:4298,strictPort:true}});let browser;const results=[];
try{browser=await chromium.launch({channel:'chrome',headless:true});for(const framework of ['plain','tailwind3','tailwind4'])for(const order of ['before','after']){const page=await browser.newPage({viewport:{width:1000,height:900}});page.setDefaultTimeout(15000);const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));await page.route('**/*',r=>new URL(r.request().url()).origin==='http://127.0.0.1:4298'?r.continue():r.abort('blockedbyclient'));await page.goto(`http://127.0.0.1:4298/?framework=${framework}&order=${order}`);await page.locator('#inner-arm [role=combobox]').waitFor();await page.waitForFunction(()=>document.querySelector('#host')?.sheet?.cssRules.length>0&&document.getElementById('_goober'));
const actualOrder=await page.evaluate(()=>document.getElementById('host').compareDocumentPosition(document.getElementById('_goober'))&Node.DOCUMENT_POSITION_FOLLOWING?'before':'after');assert.equal(actualOrder,order);
const observations=[];
for(const mode of ['light','dark']){
 if(mode==='dark')await page.getByRole('button',{name:'Toggle mode',exact:true}).click();
 await page.waitForFunction(mode=>document.getElementById('mode').textContent===mode,mode);
 for(const [id,label] of [['unthemed','U'],['outer-arm','O'],['inner-arm','I']]){
  const expected=id==='unthemed'?label+'L':label+(mode==='dark'?'D':'L');const trigger=page.locator(`#${id} [role=combobox]`);
  await page.waitForFunction(({id,expected})=>document.querySelector(`#${id} [role=combobox]`).textContent.includes(expected),{id,expected});
  const logo=await trigger.textContent();assert.ok(logo.includes(expected),`${framework}/${order}/${id}/${mode}: logo expected ${expected}, actual ${logo}`);observations.push({id,mode,state:'logo',expected,actual:logo});
 }
 for(const variant of ['normal','exposed','override']){
  await page.getByRole('button',{name:variant,exact:true}).click();
  for(const id of ['unthemed','outer-arm','inner-arm']){
   const trigger=page.locator(`#${id} [role=combobox]`);await trigger.hover();await page.waitForTimeout(150);let snapshot=await sample(trigger);check(snapshot,variant,`${id}/${mode}/hover`);observations.push({id,mode,variant,state:'hover',...snapshot});
   await trigger.click();await page.waitForFunction(id=>document.querySelector(`#${id} [role=combobox]`).getAttribute('data-state')==='open',id);await page.getByRole('listbox').waitFor();snapshot=await sample(trigger);check(snapshot,variant,`${id}/${mode}/open`);observations.push({id,mode,variant,state:'open',...snapshot});
   await page.keyboard.press('Escape');await page.waitForFunction(id=>document.querySelector(`#${id} [role=combobox]`).getAttribute('data-state')==='closed',id);
   snapshot=await sample(trigger);check(snapshot,variant,`${id}/${mode}/after-close`);observations.push({id,mode,variant,state:'after-close',...snapshot});
  }
 }
}
assert.deepEqual(pageErrors,[]);results.push({framework,order,actualOrder,observations,pageErrors});await fs.writeFile('../border-browser-progress.json',JSON.stringify({browser:browser.version(),results},null,2)+'\n');await page.close();console.log('BORDER_PASS',framework,order,observations.length);
}await fs.writeFile('../border-browser-results.json',JSON.stringify({browser:browser.version(),results},null,2)+'\n');}
finally{await browser?.close();server.httpServer.closeAllConnections();await new Promise(r=>server.httpServer.close(r));console.log('BORDER_BROWSER_RELEASED');}
async function sample(trigger){return trigger.evaluate(e=>{const s=getComputedStyle(e);return{color:s.color,borderColor:s.borderTopColor,borderWidth:s.borderTopWidth,borderStyle:s.borderTopStyle,state:e.getAttribute('data-state')}})}
function check(s,variant,label){assert.equal(s.borderColor,variant==='override'?'rgb(1, 99, 180)':s.color,`${label}/${variant}: color`);assert.equal(s.borderWidth,variant==='normal'?'0px':'1px',`${label}/${variant}: width`);assert.equal(s.borderStyle,variant==='normal'?'none':'solid',`${label}/${variant}: style`)}
