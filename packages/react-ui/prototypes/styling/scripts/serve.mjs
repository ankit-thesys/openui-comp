import {Button} from '../lib/auto-button.js';
import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import React from 'react';import {renderToString} from 'react-dom/server';import {Sample} from '../src/sample.js';
const port=Number(process.env.PORT||4177);const adapters={};for(const e of ['goober'])adapters[e]=await import(`../ssr-dist/${e}.js`);
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.map':'application/json','.svg':'image/svg+xml','.png':'image/png'};
http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');let file;
 if(url.pathname==='/automatic'){
  let html=await fs.readFile('dist/automatic.html','utf8');
  const ssr=url.searchParams.get('ssr')!=='0';
  // Ordinary React SSR only. No adapter extraction, style registry or CSS import.
  html=html.replace('<!--AUTO_HTML-->',ssr?renderToString(React.createElement(Button)):'').replace('<!--AUTO_STATE-->',ssr?'<script>window.__AUTO_SSR=true</script>':'');
  res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});res.end(html);return;
 }
 if(url.pathname==='/fixture'){
  const engine=url.searchParams.get('engine')||'goober', framework=url.searchParams.get('framework')||'none',policy=url.searchParams.get('policy')||'default',theme=url.searchParams.get('theme')||'light';
  let html=await fs.readFile('dist/fixture.html','utf8');
  html=html.replace('<!--FRAMEWORK-->',url.searchParams.get('order')==='late'?'':`<link id="framework-styles" rel="stylesheet" href="/frameworks/${framework}.css">`);
  if(url.searchParams.get('ssr')==='1'){
   const adapter=adapters[engine];adapter.extract();
   const body=renderToString(React.createElement(Sample,{adapter,framework,policy,theme}));const extracted=adapter.extract();
   const styles=`<style id="_goober">${extracted.css}</style>`;
   html=html.replace('<!--SSR_HTML-->',body).replace('<!--SSR_STYLES-->',styles+`<script>window.__SSR=${JSON.stringify({ids:extracted.ids})}</script>`);
  }
  res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});res.end(html);return;
 }
 if(url.pathname.startsWith('/results/'))file='.'+url.pathname;else file='dist'+(url.pathname==='/'?'/index.html':url.pathname);
 const resolved=path.resolve(file);if(!resolved.startsWith(process.cwd()+path.sep))throw Error('invalid path');
 const content=await fs.readFile(resolved);res.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});res.end(content);
}catch(e){res.writeHead(404);res.end('Not found');}}).listen(port,'127.0.0.1',()=>console.log(`Styling prototype: http://127.0.0.1:${port}`));
