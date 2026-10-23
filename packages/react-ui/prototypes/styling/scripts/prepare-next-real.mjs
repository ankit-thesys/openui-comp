import fs from 'node:fs/promises';import path from 'node:path';import {build} from 'esbuild';
const root=process.cwd(),repo=path.resolve(root,'../../../..');
await fs.mkdir('next-real-fixture/public/frameworks',{recursive:true});
for(const arm of ['baseline','generated'])await fs.copyFile('.real-dist/'+arm+'.css','next-real-fixture/public/'+arm+'.css');
for(const arm of ['baseline','generated'])await fs.writeFile('next-real-fixture/public/'+arm+'-layered.css','@layer theme,base,components,utilities;@layer components{'+await fs.readFile('.real-dist/'+arm+'.css','utf8')+'}');
for(const name of ['none','plain','tailwind3','tailwind4'])await fs.copyFile('public/frameworks/'+name+'.css','next-real-fixture/public/frameworks/'+name+'.css');
try{await fs.symlink('../next-fixture/node_modules','next-real-fixture/node_modules','dir')}catch(e){if(e.code!=='EEXIST')throw e}
const alias=Object.fromEntries(['react-lang','react-headless','lang-core','observability','devtools'].map(p=>['@openuidev/'+p,path.join(repo,'packages',p,'src/index.ts')]));
alias['decode-named-character-reference']=path.join(root,'real/node_modules/decode-named-character-reference/index.js');
await build({entryPoints:['next-real-fixture/entry.tsx'],outfile:'next-real-fixture/generated.jsx',bundle:true,format:'esm',platform:'browser',jsx:'automatic',external:['react','react/*','react-dom','react-dom/*','next/link'],alias,nodePaths:[path.join(root,'real/node_modules'),path.join(root,'node_modules')],banner:{js:'"use client";'},define:{'process.env.NODE_ENV':'"production"'},logLevel:'warning'});
const bundled=await fs.readFile('next-real-fixture/generated.jsx','utf8');await fs.writeFile('next-real-fixture/generated.jsx','\"use client\";\nimport * as __sharedReact from \"react\";\n'+bundled.replaceAll('\"use client\";','').replaceAll('__require(\"react\")','__sharedReact'));
console.log('Prepared real OpenUI Next fixture, with React and Next shared at runtime.');
