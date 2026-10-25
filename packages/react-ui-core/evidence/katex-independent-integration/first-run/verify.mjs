import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const consumer='/private/tmp/core-math-final-consumer';
const artifact='/private/tmp/core-math-final-artifact/openuidev-react-ui-core-0.0.0-beta.0.tgz';
const revision='a288334807643bdc63acb75c08af3e7aef7d759e';
const expectedHash='8709be66bc8b6b5ffd859b3df4fda1507ee63f9b7a75506c149a2aaf56012537';
const out=process.env.CORE_REVIEW_OUT || '/private/tmp/core-math-independent';
const hash=b=>createHash('sha256').update(b).digest('hex');
const req=createRequire(consumer+'/package.json');
const tools=createRequire('/Users/ankitdas/.codex/worktrees/2d0f/openui/packages/react-ui-core/package.json');
const {build}=await import(req.resolve('vite'));
const {chromium}=await import(tools.resolve('playwright'));
const installed=consumer+'/node_modules/@openuidev/react-ui-core';
assert(!(await fs.lstat(installed)).isSymbolicLink());
assert.equal(hash(await fs.readFile(artifact)),expectedHash);
assert.equal((await fs.stat(artifact)).size,401873);
await fs.mkdir(out,{recursive:true});
async function manifest(dir){const entries={};async function walk(d){for(const name of (await fs.readdir(d)).sort()){const p=path.join(d,name);if((await fs.stat(p)).isDirectory())await walk(p);else entries[path.relative(dir,p)]={bytes:(await fs.stat(p)).size,sha256:hash(await fs.readFile(p))};}}await walk(dir);return entries;}
const before={lock:hash(await fs.readFile(consumer+'/package-lock.json')),package:await manifest(installed)};
const coreReq=createRequire(installed+'/package.json');
const rendererReq=createRequire(coreReq.resolve('rehype-katex'));
const cssVersion=JSON.parse(await fs.readFile(coreReq.resolve('katex/package.json'))).version;
const rendererVersion=JSON.parse(await fs.readFile(rendererReq.resolve('katex/package.json'))).version;
assert.equal(cssVersion,'0.16.47');assert.equal(rendererVersion,cssVersion);
assert.deepEqual(await fs.readFile(coreReq.resolve('katex/dist/katex.min.css')),await fs.readFile(rendererReq.resolve('katex/dist/katex.min.css')));
const native={};
for(const mode of ['esm','cjs'])native[mode]=execFileSync(process.execPath,mode==='esm'?['--input-type=module','-e',`import {TextContentWrapper,ThemeProvider} from '@openuidev/react-ui-core';if(!TextContentWrapper||!ThemeProvider)throw Error('missing exports');console.log('ESM root OK')`]:['-e',`const c=require('@openuidev/react-ui-core');if(!c.TextContentWrapper||!c.ThemeProvider)throw Error('missing exports');console.log('CJS root OK')`],{cwd:consumer,encoding:'utf8'}).trim();
const report={status:'preparing',revision,tarballSha256:expectedHash,tarballBytes:401873,runnerSha256:hash(await fs.readFile(fileURLToPath(import.meta.url))),consumerLockSha256:before.lock,installedManifest:before.package,versions:{katex:cssVersion,rendererKatex:rendererVersion,vite:'6.4.2'},native,cases:[],snapshots:0};
const scratch=await fs.mkdtemp('/private/tmp/core-math-independent-fixture-');
await fs.symlink(consumer+'/node_modules',scratch+'/node_modules','dir');
const formula='## Formula\n\nBefore math.\n\n$$\n\\frac{1}{2}+x^2+\\sqrt{y}\n$$\n\nAfter math.';
const updated='Updated formula\n\n$$\n\\frac{3}{4}+z^3\n$$';
const source=`import React,{useState} from 'react';import{createRoot}from'react-dom/client';import{TextContentWrapper,ThemeProvider}from'@openuidev/react-ui-core';const h=React.createElement;function App(){const[state,setState]=useState({mode:'light',custom:false,text:${JSON.stringify(formula)}});window.configure=setState;return h(React.Fragment,null,h('div',{id:'unrelated',style:{color:'rgb(11, 22, 33)',font:'17px/23px serif'}},'Host unchanged'),h(ThemeProvider,{mode:state.mode,lightTheme:state.custom?{textNeutralPrimary:'#234567'}:undefined},h('div',{id:'zone','data-ready':JSON.stringify(state),style:{maxWidth:760,padding:16}},h(TextContentWrapper,{textMarkdown:state.text,header:{heading:'Actual component'},variant:'card'}),h(ThemeProvider,{mode:'dark'},h('section',{id:'nested'},h(TextContentWrapper,{textMarkdown:state.text}))))));}createRoot(document.getElementById('app')).render(h(App));`;
await fs.writeFile(scratch+'/package.json',JSON.stringify({private:true,type:'module'}));
await fs.writeFile(scratch+'/index.html','<!doctype html><html><head><link id="host-style" rel="stylesheet" href="/host/plain.css"></head><body><div id="app"></div><script type="module" src="/main.js"></script></body></html>');
await fs.writeFile(scratch+'/main.js',source);
await build({root:scratch,configFile:false,base:'/review/',logLevel:'silent',build:{outDir:out+'/used',emptyOutDir:true}});
await fs.writeFile(scratch+'/main.js',`import React from 'react';import{createRoot}from'react-dom/client';import{Button}from'@openuidev/react-ui-core';createRoot(document.getElementById('app')).render(React.createElement(Button,null,'Unused math'));`);
await build({root:scratch,configFile:false,base:'/unused/',logLevel:'silent',build:{outDir:out+'/unused',emptyOutDir:true}});
report.builds={used:await manifest(out+'/used'),unused:await manifest(out+'/unused')};
assert(!Object.keys(report.builds.unused).some(n=>/mathRenderer|\.css$/.test(n)));
const fonts=Object.entries(report.builds.unused).filter(([n])=>/\.(woff2?|ttf)$/.test(n));
report.unusedEmittedFonts={files:fonts.length,bytes:fonts.reduce((n,[,v])=>n+v.bytes,0)};
assert.equal(fonts.length,59);assert.equal(report.unusedEmittedFonts.bytes,1072948);
report.fixtureSourceSha256=hash(source);report.hosts={};
const vendor=path.dirname(coreReq.resolve('katex/package.json'))+'/dist';
for(const f of ['plain','tailwind3','tailwind4'])report.hosts[f]=hash(await fs.readFile('/private/tmp/core-forms-host/frameworks/'+f+'.css'));
const server=http.createServer(async(request,response)=>{try{const url=new URL(request.url,'http://localhost');let file;if(url.pathname.startsWith('/__reference/'))file=path.join(vendor,url.pathname.slice('/__reference/'.length));else if(url.pathname.startsWith('/host/'))file=path.join('/private/tmp/core-forms-host/frameworks',url.pathname.slice('/host/'.length));else if(url.pathname==='/review/'||url.pathname==='/unused/'){const dir=url.pathname==='/review/'?'used':'unused';let html=await fs.readFile(out+'/'+dir+'/index.html','utf8');html=html.replace('/host/plain.css','/host/'+(url.searchParams.get('framework')||'plain')+'.css');if(url.searchParams.get('reference')==='true')html=html.replace('</head>','<link rel="stylesheet" href="/__reference/katex.min.css"></head>');response.setHeader('content-type','text/html');response.end(html);return;}else if(url.pathname.startsWith('/review/'))file=path.join(out,'used',url.pathname.slice('/review/'.length));else if(url.pathname.startsWith('/unused/'))file=path.join(out,'unused',url.pathname.slice('/unused/'.length));else throw Error('Unexpected asset path '+url.pathname);response.setHeader('content-type',({'.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf'})[path.extname(file)]||'application/octet-stream');response.end(await fs.readFile(file));}catch(e){response.writeHead(404);response.end(String(e));}});
const props=['fontFamily','fontSize','fontWeight','lineHeight','color','display','position','verticalAlign','padding','margin','width','height','top','bottom','left','right','borderTopWidth','boxSizing'];
const snapshot=p=>p.locator('#zone .katex,#zone .katex *').evaluateAll((nodes,keys)=>nodes.map(n=>{const s=getComputedStyle(n),r=n.getBoundingClientRect();return{tag:n.tagName,text:n.children.length?null:n.textContent,style:Object.fromEntries(keys.map(k=>[k,s[k]])),rect:Object.fromEntries(['x','y','width','height'].map(k=>[k,Math.round(r[k]*100)/100]))};}),props);
const settle=async p=>{await p.waitForFunction(()=>document.querySelectorAll('#zone .katex').length===2);await p.evaluate(async()=>{await document.fonts.ready;document.querySelectorAll('#zone *').forEach(n=>getComputedStyle(n).color);for(const a of document.getAnimations())if(Number.isFinite(a.effect.getComputedTiming().iterations))a.finish();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});};
let browser;
try{await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});browser=await chromium.launch({channel:'chrome',headless:true});report.browser=browser.version();report.status='running';
for(const framework of ['plain','tailwind3','tailwind4'])for(const order of ['before','after']){
const pages=[],resources=[],errors=[];
for(const reference of [true,false]){const page=await browser.newPage({viewport:{width:850,height:1000}});page.setDefaultTimeout(12000);const requests=[];page.on('pageerror',e=>errors.push({reference,error:e.message}));page.on('requestfailed',r=>errors.push({reference,url:r.url(),failure:r.failure()}));page.on('response',r=>{requests.push({url:r.url(),status:r.status()});if(r.status()>=400)errors.push({reference,url:r.url(),status:r.status()});});await page.goto(`http://127.0.0.1:${server.address().port}/review/?framework=${framework}&reference=${reference}`);await settle(page);await page.evaluate(order=>{const host=document.getElementById('host-style');const css=[...document.querySelectorAll('link[rel=stylesheet]')].find(n=>n.href.includes('mathRenderer'));if(!css)throw Error('Automatic CSS missing');if(order==='after')document.head.append(host);else document.head.insertBefore(host,css);},order);pages.push(page);resources.push({reference,requests});}
for(const mode of ['light','dark','custom']){for(const page of pages){await page.evaluate(mode=>{const old=JSON.parse(document.querySelector('[data-ready]').dataset.ready);window.configure({...old,mode:mode==='dark'?'dark':'light',custom:mode==='custom'});},mode);await page.waitForFunction(mode=>{const s=JSON.parse(document.querySelector('[data-ready]').dataset.ready);return s.mode===(mode==='dark'?'dark':'light')&&s.custom===(mode==='custom');},mode);await settle(page);assert.equal(await page.locator('#unrelated').evaluate(n=>getComputedStyle(n).color),'rgb(11, 22, 33)');assert((await page.locator('.katex').first().evaluate(n=>getComputedStyle(n).fontFamily)).includes('KaTeX_Main'));}
const values=await Promise.all(pages.map(snapshot));try{assert.deepEqual(values[1],values[0]);}catch(e){report.firstFailure={framework,order,mode,reference:values[0],automatic:values[1]};throw e;}report.snapshots+=values[0].length;}
for(const p of pages){await p.evaluate(()=>{const old=JSON.parse(document.querySelector('[data-ready]').dataset.ready);window.configure({...old,text:'Late plain content'});});await p.waitForFunction(()=>document.querySelectorAll('.katex').length===0&&document.getElementById('zone').textContent.includes('Late plain content'));await p.evaluate(text=>{const old=JSON.parse(document.querySelector('[data-ready]').dataset.ready);window.configure({...old,text});},updated);await settle(p);assert((await p.locator('#zone').textContent()).includes('Updated formula'));}
const late=await Promise.all(pages.map(snapshot));assert.deepEqual(late[1],late[0]);report.snapshots+=late[0].length;
const automatic=pages[1];assert.equal(await automatic.locator('link[rel="stylesheet"][href*="mathRenderer"]').count(),1);
assert(resources[1].requests.some(r=>r.url.endsWith('.css')&&r.url.includes('/review/assets/mathRenderer')));assert(resources[1].requests.some(r=>r.url.endsWith('.woff2')));assert(!resources[1].requests.some(r=>r.url.includes('__reference')));assert.deepEqual(errors,[]);
report.cases.push({framework,order,status:'passed',lateUpdate:true,resources,loadedFonts:await automatic.evaluate(()=>[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family))});for(const p of pages)await p.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2)+'\n');
}
const page=await browser.newPage(),downloads=[];page.on('response',r=>downloads.push(r.url()));await page.goto(`http://127.0.0.1:${server.address().port}/unused/`);await page.getByRole('button',{name:'Unused math'}).waitFor();await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));assert(!downloads.some(n=>/katex|mathRenderer|\.woff|\.ttf|\.css(?:\?|$)/.test(n)&&!n.includes('/host/')));report.unused={status:'passed',downloads};await page.close();report.status='passed';
}catch(e){report.status='failed';report.error=String(e);throw e;}finally{if(browser)await browser.close();if(server.listening)await new Promise(r=>server.close(r));report.consumerUnchanged={lock:before.lock===hash(await fs.readFile(consumer+'/package-lock.json')),package:JSON.stringify(before.package)===JSON.stringify(await manifest(installed))};await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2)+'\n');await fs.rm(scratch,{recursive:true,force:true});assert(report.consumerUnchanged.lock&&report.consumerUnchanged.package);}
console.log(JSON.stringify({status:report.status,cases:report.cases.length,snapshots:report.snapshots,unused:report.unusedEmittedFonts,consumerUnchanged:report.consumerUnchanged}));
