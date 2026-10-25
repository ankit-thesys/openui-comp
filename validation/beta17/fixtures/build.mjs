import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {makeCell} from './payloads.mjs';
const consumer=path.resolve(process.env.BETA17_CONSUMER ?? '/private/tmp/beta17-consumer');
const tools=createRequire(path.resolve('packages/react-ui-core/package.json'));
const {build}=await import(tools.resolve('vite'));
const here=path.dirname(fileURLToPath(import.meta.url));
const out=path.join(consumer,'replay-dist');
const origins={};
for(const arm of ['baseline','runtime']){
 const root=path.join(consumer,'replay-apps',arm);await fs.mkdir(root,{recursive:true});
 await fs.writeFile(path.join(root,'package.json'),JSON.stringify({private:true,type:'module',name:`beta17-${arm}`}));
 await fs.copyFile(path.join(here,'client.tsx'),path.join(root,'client.tsx'));
 await fs.writeFile(path.join(root,'arm.ts'),arm==='runtime'?`export {ThemeProvider} from '@openuidev/react-ui-core';\nexport {openuiChatLibrary} from '@openuidev/kits/react/chat/libs';\n`:`import '@openuidev/react-ui/styles/index.css';\nexport {ThemeProvider,openuiChatLibrary} from '@openuidev/react-ui';\n`);
 await fs.writeFile(path.join(root,'index.html'),`<!doctype html><html><head><script>
const q=new URLSearchParams(location.search),link=document.createElement('link');link.rel='stylesheet';link.href='/host/'+(q.get('framework')||'plain')+'.css';
if(q.get('order')==='after')window.addEventListener('load',()=>document.head.append(link));else document.head.append(link);
</script></head><body><div id="root"></div><script type="module" src="/client.tsx"></script></body></html>`);
 await build({root,base:`/${arm}/`,configFile:false,esbuild:{jsx:'automatic',target:'es2022'},build:{target:'es2022',outDir:path.join(out,arm),emptyOutDir:true,sourcemap:true},plugins:[{name:'record-installed-product-origins',generateBundle(_,bundle){
  const ids=[...new Set(Object.values(bundle).filter(x=>x.type==='chunk').flatMap(x=>Object.keys(x.modules)))];
  const product=ids.filter(x=>/\/@openuidev\/(kits|react-ui-core|react-ui|react-lang)\//.test(x));
  if(!product.length)throw Error(`No actual product modules for ${arm}`);
  for(const id of product)if(!id.startsWith(path.join(consumer,'node_modules')+path.sep))throw Error(`Non-installed product ${id}`);
  if(arm==='runtime'&&product.some(x=>x.includes('/@openuidev/react-ui/')))throw Error('Legacy leaked into runtime');
  if(arm==='baseline'&&product.some(x=>x.includes('/@openuidev/react-ui-core/')||x.includes('/@openuidev/kits/')))throw Error('Candidate leaked into baseline');
  origins[arm]=product;
 }}]});
}
await fs.mkdir(path.join(out,'host'),{recursive:true});
for(const framework of ['plain','tailwind3','tailwind4'])await fs.copyFile(path.resolve('packages/kits/evidence/chat-library/host/frameworks',framework+'.css'),path.join(out,'host',framework+'.css'));
const cells={};for(const workload of ['chat','dashboard'])for(const load of ['paced','stress']){
 const c=makeCell(workload,load);cells[`${workload}/${load}`]={urls:Object.fromEntries(['baseline','runtime'].map(a=>[a,`/${a}/?workload=${workload}&load=${load}&framework=plain&order=before`])),expectedText:c.payload,requiredText:[`${workload} section 0`,'Show the next quarter'],renderedRoot:'main',expectedDom:{tables:{selector:'main table',count:c.tables},forms:{selector:'main form',count:1},...(workload==='dashboard'?{bars:{selector:'main .openui-bar-chart-bar',count:c.bars}}:{})},payloadSha256:c.payloadSha256,scheduleSha256:c.scheduleSha256};
}
const hash=async p=>createHash('sha256').update(await fs.readFile(p)).digest('hex');
const inputs={};
for(const p of ['client.tsx','server.mjs','build.mjs','payloads.mjs'])inputs[path.join(here,p)]=await hash(path.join(here,p));
for(const p of ['package.json','package-lock.json'])inputs[path.join(consumer,p)]=await hash(path.join(consumer,p));
async function inventory(dir){for(const entry of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())await inventory(p);else inputs[p]=await hash(p);}}
await inventory(out);await inventory(path.join(consumer,'replay-apps'));
const manifest={schemaVersion:1,productCommit:'9ee0576133fbb1c444d03c169a81893ebf7631fd',origin:'http://127.0.0.1:4197',consumer,dist:out,inputs,runtimeModules:origins.runtime,moduleOrigins:origins,streamPath:'/stream',statsPath:'/stats',selectors:{ready:'#ready',mounted:'#mounted',mount:'#mount',unmount:'#unmount',start:'#start-stream',cancel:'#cancel-stream',status:'#status',message:'#message-source',input:'#prompt',theme:'#theme-hue'},cells};
await fs.writeFile(path.join(consumer,'handoff.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('Built fixture; not yet functionally validated:',path.join(consumer,'handoff.json'));
