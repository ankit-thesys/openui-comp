import {createServer} from 'node:http';
import {readFileSync,writeFileSync} from 'node:fs';
import {launch,waitFor,chromeVersion} from '/Users/ankitdas/.codex/worktrees/component-comparison/openui/validation/friend-chart-baseline/browser/cdp.mjs';
const root='/private/tmp/openui-styles60-evidence';
const frameworks=Object.fromEntries(['plain','tailwind3','tailwind4'].map(k=>[k,readFileSync('/private/tmp/openui-public-gate-consumer/frameworks/'+k+'.css','utf8')]));
const server=createServer((req,res)=>{
 const u=new URL(req.url,'http://localhost');const p=u.searchParams;
 const m=u.pathname.match(/^\/(baseline|candidate)\/(.+)$/);
 if(m){try{res.setHeader('Content-Type',m[2].endsWith('.js')?'application/javascript':'text/css');res.end(readFileSync(root+'/'+m[1]+'-browser/'+m[2]));}catch{res.statusCode=404;res.end('missing')}return;}
 const artifact=p.get('artifact')||'candidate';const order=p.get('order')||'before';const scope=p.get('override')||'none';
 let hostCss=frameworks[p.get('framework')||'plain'];
 const rule=(scope==='container'?'#app':':where(:root)')+'{--openui-interactive-accent-default:rgb(1, 2, 3);}';
 if(scope==='root')hostCss+='@layer host-custom {'+rule+'}';
 if(scope==='plain-root'||scope==='container')hostCss+=rule;
 if(scope==='important-root')hostCss+=':root{--openui-interactive-accent-default:rgb(1, 2, 3)!important;}';
 const initial=order==='before'?'<style>'+hostCss+'</style>':'';
 res.setHeader('Content-Type','text/html');res.end('<!doctype html><html class="host-existing"><head><meta charset="utf-8">'+initial+'</head><body><div id="host"><button>Host button</button><input aria-label="host input"><label>Host label</label><a href="#">Host link</a><h2>Host heading</h2><p>Host paragraph</p><svg width="10" height="10"></svg><div style="box-sizing:content-box;width:23px;padding:5px">Host box</div></div><p class="host-sentinel">Global sentinel</p><div id="app"></div><script>window.addHost=async()=>{const style=document.createElement("style");style.textContent='+JSON.stringify(hostCss)+';document.head.append(style);};</script><script type="module" src="/'+artifact+'/stdin.js"></script></body></html>');
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
let browser;const observations=[];const checks=[];let errors=[];
const pause=()=>browser.evaluate('new Promise(r=>setTimeout(r,250))');
async function visit(artifact,params){
 const q=new URLSearchParams({artifact,...params});await browser.goto(base+'/?'+q);
 await waitFor(()=>browser.evaluate('window.ready===true && window.getSnapshot().loaded'),{what:'public package mount'});await pause();
 return await browser.evaluate('window.getSnapshot()');
}
function visual(value){if(Array.isArray(value))return value.map(visual);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([k])=>k!=='token').map(([k,v])=>[k,visual(v)]));return value;}
function equal(a,b){return JSON.stringify(visual(a))===JSON.stringify(visual(b))}
function check(name,pass,detail){checks.push({name,pass,detail});}
try{
 browser=await launch({width:1280,height:900});
 await browser.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'dark'}]});
 for(const framework of ['plain','tailwind3','tailwind4'])for(const order of ['before','after'])for(const override of ['none','root','container'])for(const globOrder of ['before']){
  const config={framework,order,override,globOrder};const pair={};
  for(const artifact of ['baseline','candidate']){pair[artifact]=await visit(artifact,config);
   check('shared-three-root-positive:'+JSON.stringify({artifact,...config}),pair[artifact].controls.slice(0,3).every(s=>s.styles.boxSizing==='border-box'&&s.rect.width===173));
   const hostBefore=await browser.evaluate('window.hostBefore');const hostAfterImport=await browser.evaluate('window.hostAfterImport');
   // Late host frameworks intentionally restyle host controls; compare package isolation only when framework preceded import.
   if(order==='before')check('host-before-after:'+JSON.stringify({artifact,...config}),equal(hostBefore,hostAfterImport));
   check('initial-hostglob:'+JSON.stringify({artifact,...config}),pair[artifact].hostSentinel==='rgb(4, 5, 6)');
   await browser.evaluate('window.hostUpdate()');await pause();const updated=await browser.evaluate('window.getSnapshot()');
   check('updated-hostglob:'+JSON.stringify({artifact,...config}),updated.hostSentinel==='rgb(7, 8, 9)');
   if(artifact==='candidate')check('defaults-survive-host-update:'+JSON.stringify(config),updated.rootToken===pair[artifact].rootToken);
   check('root-marker-preserves-host:'+JSON.stringify({artifact,...config}),pair[artifact].rootClass.split(' ').includes('host-existing'));
   if(artifact==='candidate'){
    check('image-is-not-theme-token:'+JSON.stringify(config),pair[artifact].imageToken==='');
    if(override==='root')check('earlier-or-later-layer-root:'+JSON.stringify(config),pair[artifact].rootToken==='rgb(1, 2, 3)');
    if(override==='none')check('provider-free-light-system-dark:'+JSON.stringify(config),pair[artifact].rootToken==='oklch(0.546 0.215 262.881 / 1)');
    if(override==='container')check('inherited-container:'+JSON.stringify(config),pair[artifact].controls[0]?.token==='rgb(1, 2, 3)');
   }
  }
  check('control-visual-geometry-parity:'+JSON.stringify(config),equal(pair.baseline.controls,pair.candidate.controls),{baseline:pair.baseline.controls,candidate:pair.candidate.controls});
  check('host-parity:'+JSON.stringify(config),equal(pair.baseline.hosts,pair.candidate.hosts));observations.push({config,pair});writeFileSync(root+'/integration-progress.json',JSON.stringify({completed:observations.length,checks:checks.length,failures:checks.filter(c=>!c.pass).map(c=>c.name)}));
 }
 for(const theme of ['light','dark','nested','root','portal','select','calendar','tooltip','code']){
  const pair={};for(const artifact of ['baseline','candidate']){
   pair[artifact]=await visit(artifact,{theme,framework:'plain',order:'before'});
   if(theme==='tooltip'){await browser.mouseMove(...Object.values(await browser.centreOf('#tooltip-trigger')).slice(0,2));await pause();pair[artifact]=await browser.evaluate('window.getSnapshot()');}
   if(theme==='code')check('bundled-syntax-theme-import-smoke:'+artifact,await browser.evaluate("document.querySelector('#code-smoke')?.textContent.includes('const result = 42;') && !!document.querySelector('#code-smoke strong')"));
   if(theme==='nested')check('nested-theme:'+artifact,equal(pair[artifact].named.map(s=>s.token),['rgb(11, 12, 13)','rgb(21, 22, 23)','rgb(31, 32, 33)']));
   if(['portal','select','calendar','tooltip'].includes(theme))check('portal-theme:'+artifact+':'+theme,pair[artifact].portals.length>0&&pair[artifact].portals.every(s=>s.token==='rgb(51, 52, 53)'),pair[artifact].portals);
   if(theme==='root')check('explicit-root-selector:'+artifact,pair[artifact].rootToken==='rgb(41, 42, 43)');
   if(artifact==='candidate'){
    await browser.evaluate("window.render('none')");await waitFor(()=>browser.evaluate("!!document.querySelector('#probe')"));await pause();
    const restored=await browser.evaluate('window.getSnapshot()');check('provider-unmount-restores-light:'+theme,restored.rootToken==='oklch(0.546 0.215 262.881 / 1)'&&restored.controls[0].token==='oklch(0.546 0.215 262.881 / 1)');
   }
  }
  // Portal class IDs may differ, but snapshot contains only computed values/geometry.
  check('theme-controls-parity:'+theme,equal(pair.baseline.controls,pair.candidate.controls),pair);
  check('theme-portals-parity:'+theme,equal(pair.baseline.portals,pair.candidate.portals),pair);
  observations.push({config:{theme},pair});
 }
 for(const override of ['plain-root','important-root'])for(const order of ['before','after']){
  const snap=await visit('candidate',{override,order,framework:'tailwind4'});check('root-boundary:'+override+':'+order,snap.rootToken==='rgb(1, 2, 3)');
 }
 for(const framework of ['plain','tailwind3','tailwind4']){
  const pair={};for(const artifact of ['baseline','candidate']){
   await visit(artifact,{framework});await browser.clickSelector('#probe');await pause();const focus=await browser.evaluate('window.getSnapshot()');
   await browser.mouseMove(1250,880);await pause();const blurred=await browser.evaluate('window.getSnapshot()');
   pair[artifact]={focus:focus.controls,blurred:blurred.controls};
  }check('focus-hover-disabled-error-parity:'+framework,equal(pair.baseline,pair.candidate),pair);
 }
 writeFileSync(root+'/integration-results.json',JSON.stringify({chrome:await chromeVersion(),checks,observations},null,2));
 console.log(JSON.stringify({checks:checks.length,pass:checks.filter(c=>c.pass).length,failures:checks.filter(c=>!c.pass).map(({name,detail})=>({name,detail}))},null,2));
}catch(error){writeFileSync(root+'/integration-error.json',JSON.stringify({error:String(error),checks,observations},null,2));throw error;}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
