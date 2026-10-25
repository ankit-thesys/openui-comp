import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from '/private/tmp/claude-501/-Users-ankitdas-thesys-composition/f7cd0fa2-b747-4784-9f8b-62c79464ba26/scratchpad/pr1744/node_modules/playwright/index.mjs';
const root='/private/tmp/core-katex-css-consumer';
let activeMode='used';
const server=http.createServer(async(req,res)=>{try{const file=path.join(root,'dist-'+activeMode,new URL(req.url,'http://localhost').pathname);const data=await fs.readFile(file);res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.woff2')?'font/woff2':'text/html');res.end(data);}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const results=[];
 for(const mode of ['used','unused']){
 activeMode=mode;const page=await browser.newPage();const responses=[];const failures=[];
 page.on('response',r=>responses.push({url:r.url(),status:r.status()}));page.on('requestfailed',r=>failures.push({url:r.url(),failure:r.failure()}));
 await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
 if(mode==='used')await page.waitForFunction(()=>window.ready===true);else await page.waitForFunction(()=>document.querySelector('#math').textContent==='true');
 const computed=await page.evaluate(()=>({math:!!document.querySelector('.katex'),font:document.querySelector('.katex')?getComputedStyle(document.querySelector('.katex')).fontFamily:null,fonts:[...document.fonts].filter(x=>x.status==='loaded').map(x=>x.family),resources:performance.getEntriesByType('resource').map(x=>({name:x.name,bytes:x.transferSize}))}));
 results.push({mode,computed,responses,failures});await page.close();
 }
 console.log(JSON.stringify({browser:browser.version(),results},null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
