import {build} from '/private/tmp/openui-common-styles/node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/lib/main.js';
import fs from 'node:fs/promises';
const root='/private/tmp/openui-styles59-evidence';
const origins=[];
for(const [arm,dir] of [['baseline','/private/tmp/openui-styles-independent-verification/runtime57/candidate'],['candidate',root+'/consumer']]){
 const result=await build({absWorkingDir:dir,stdin:{contents:await fs.readFile(root+'/fixture.tsx','utf8'),resolveDir:dir,sourcefile:'fixture.tsx',loader:'tsx'},bundle:true,minify:true,format:'esm',splitting:true,outdir:root+'/'+arm+'-browser',metafile:true,loader:{'.woff2':'file','.woff':'file','.ttf':'file'},define:{'process.env.NODE_ENV':'"production"'},logLevel:'warning'});
 await fs.writeFile(root+'/'+arm+'-browser/metafile.json',JSON.stringify(result.metafile));
 const entries=Object.keys(result.metafile.inputs);origins.push({arm,goober:entries.filter(p=>p.includes('/goober/')),components:entries.filter(p=>p.includes('/@openuidev/react-components/'))});
 for(const [name,imports,body] of [['buttons','Buttons,Button','<Buttons><Button>One</Button></Buttons>'],['form','FormControl,Hint','<FormControl><Hint>Hint</Hint></FormControl>'],['tags','TagBlock,Tag','<TagBlock><Tag text="Tag"/></TagBlock>'],['combined','Buttons,Button,FormControl,Hint,TagBlock,Tag','<><Buttons><Button>One</Button></Buttons><FormControl><Hint>Hint</Hint></FormControl><TagBlock><Tag text="Tag"/></TagBlock></>']]){
 const r=await build({absWorkingDir:dir,stdin:{contents:`import React from'react';import{createRoot}from'react-dom/client';import{${imports}}from'@openuidev/react-components';const root=createRoot(document.querySelector('#app'));window.again=()=>root.render(${body});window.again();window.ready=true;`,resolveDir:dir,sourcefile:'small.tsx',loader:'tsx'},bundle:true,minify:true,format:'esm',outdir:root+'/'+arm+'-small-'+name,metafile:true,loader:{'.woff2':'file','.woff':'file','.ttf':'file'},define:{'process.env.NODE_ENV':'"production"'},logLevel:'warning'});
 await fs.writeFile(root+'/'+arm+'-small-'+name+'/metafile.json',JSON.stringify(r.metafile));
 }
}
await fs.writeFile(root+'/build-origins.json',JSON.stringify(origins,null,2));console.log('Built matched installed public imports and eight optimized small consumers.');
