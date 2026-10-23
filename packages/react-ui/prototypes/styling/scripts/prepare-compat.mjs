import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
const run=(cmd,args,cwd)=>new Promise((resolve,reject)=>{const child=spawn(cmd,args,{cwd,stdio:'inherit'});child.on('exit',code=>code===0?resolve():reject(Error(cmd+' exited '+code)));child.on('error',reject);});
const versions=JSON.parse(await fs.readFile('results/versions.json','utf8'));
const packed=JSON.parse(await fs.readFile('results/package-artifact.json','utf8'))[0];
const setups=[];
for(const framework of ['none','tailwind3','tailwind4','bootstrap','plain']){
 const root=path.resolve('.compat',framework);await fs.mkdir(path.join(root,'app'),{recursive:true});
 const dependencies={next:'16.4.2',react:versions.react,'react-dom':versions['react-dom'],goober:versions.goober,'@openui/goober-compat-prototype':'file:../'+packed.filename};
 if(framework.startsWith('tailwind'))dependencies.tailwindcss=framework==='tailwind3'?versions['tailwindcss-v3']:versions.tailwindcss;
 if(framework==='bootstrap')dependencies.bootstrap=versions.bootstrap;
 await fs.writeFile(path.join(root,'package.json'),JSON.stringify({name:'consumer-'+framework,private:true,type:'module',dependencies},null,2));
 // Reset only generated artifacts in these explicitly throwaway, script-owned fixtures.
 for(const file of ['openui.generated.js','app/openui.generated.css'])await fs.rm(path.join(root,file),{force:true});
 await fs.writeFile(path.join(root,'next.config.mjs'),"export default {};\n");
 await fs.copyFile('public/frameworks/'+framework+'.css',path.join(root,'app/globals.css'));
 await fs.appendFile(path.join(root,'app/globals.css'),'\n.host-override{background-color:rgb(239,68,68)}\n');
 await fs.writeFile(path.join(root,'app/layout.js'),`import './globals.css';\nexport default function Layout({children}){return <html><body>{children}</body></html>}\n`);
 const override=framework.startsWith('tailwind')?'bg-red-500 text-white p-8 rounded-none border-0 hover:bg-green-500':framework==='bootstrap'?'btn btn-warning':framework==='plain'?'consumer-override':'';
 await fs.writeFile(path.join(root,'app/controls.js'),`'use client';
import {useState,useEffect} from 'react';import {css} from 'goober';import {Button} from '../openui.generated';
export default function Controls(){const [show,setShow]=useState(false);const cls=css({backgroundColor:'rgb(12,130,120)'});useEffect(()=>{document.documentElement.dataset.hydrated='true'},[]);return <section><button data-testid="host-goober" className={cls+' host-override'} onClick={()=>setShow(x=>!x)}>Toggle library</button>{show&&<Button late data-testid="mounted">Mounted</Button>}</section>}
`);
 await fs.writeFile(path.join(root,'app/page.js'),`import {Suspense} from 'react';import Link from 'next/link';import {Button} from '../openui.generated';import Controls from './controls';
async function Delayed(){await new Promise(r=>setTimeout(r,200));return <div data-testid="streamed"><Button late data-testid="late" className="${override}">Streamed override</Button></div>}
export default async function Page({searchParams}){const params=await searchParams;return <main><h1>${framework}: installed package + automatic configuration</h1><Button data-testid="base" accent={params.theme==='red'?'#b03030':undefined}/><Button data-testid="override" className="${override}">Override</Button><button data-testid="reference" className="${override}">Framework reference</button><Controls/><Suspense fallback={<p>Loading</p>}><Delayed/></Suspense><Link href="/?theme=red" prefetch={false}>Navigate</Link></main>}
`);
 await run('npm',['install','--ignore-scripts','--no-audit','--no-fund'],root);
 await run(process.execPath,['node_modules/@openui/goober-compat-prototype/configure.mjs'],root);
 const before=await fs.readFile(path.join(root,'openui.generated.js'),'utf8');
 const layoutBefore=await fs.readFile(path.join(root,'app/layout.js'),'utf8');
 const cssBefore=await fs.readFile(path.join(root,'app/openui.generated.css'),'utf8');
 await run(process.execPath,['node_modules/@openui/goober-compat-prototype/configure.mjs'],root);
 const after=await fs.readFile(path.join(root,'openui.generated.js'),'utf8');
 const layoutIdempotent=layoutBefore===await fs.readFile(path.join(root,'app/layout.js'),'utf8');
 const cssIdempotent=cssBefore===await fs.readFile(path.join(root,'app/openui.generated.css'),'utf8');
 const edited=after+'\n// Consumer customization: must be preserved.\n';
 await fs.writeFile(path.join(root,'openui.generated.js'),edited);
 const blocked=spawnSync(process.execPath,['node_modules/@openui/goober-compat-prototype/configure.mjs'],{cwd:root,encoding:'utf8'});
 const editsPreserved=blocked.status!==0&&(await fs.readFile(path.join(root,'openui.generated.js'),'utf8'))===edited;
 await fs.writeFile(path.join(root,'openui.generated.js'),after);
 if(!editsPreserved)throw Error('Installer overwrote customized component entry');
 const clientDirectivePreserved=(await fs.readFile(path.join(root,'node_modules/@openui/goober-compat-prototype/auto-button.js'),'utf8')).startsWith("'use client';");
 const installed=JSON.parse(await fs.readFile(path.join(root,'node_modules/@openui/goober-compat-prototype/package.json'),'utf8'));
 const setup=JSON.parse(await fs.readFile(path.join(root,'openui-setup.json'),'utf8'));
 setups.push({fixture:framework,...setup,idempotent:before===after&&layoutIdempotent&&cssIdempotent,layoutIdempotent,cssIdempotent,editsPreserved,clientDirectivePreserved,reactPeer:installed.peerDependencies.react,installedPackage:installed.name+'@'+installed.version});
 await run(process.execPath,['node_modules/next/dist/bin/next','build'],root);
}
await fs.writeFile('results/compat-setup.json',JSON.stringify(setups,null,2));
