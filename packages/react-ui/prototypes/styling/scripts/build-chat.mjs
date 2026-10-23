import fs from 'node:fs/promises';import path from 'node:path';import {build} from 'esbuild';
const root=process.cwd(),repo=path.resolve(root,'../../../..');await fs.mkdir('.chat-dist',{recursive:true});
const alias=Object.fromEntries(['react-lang','react-headless','lang-core','observability','devtools'].map(p=>['@openuidev/'+p,path.join(repo,'packages',p,'src/index.ts')]));Object.assign(alias,{react:path.join(root,'node_modules/react'),'react-dom':path.join(root,'node_modules/react-dom')});
const options={bundle:true,minify:true,sourcemap:true,alias,nodePaths:[path.join(root,'real/node_modules'),path.join(root,'node_modules')],define:{'process.env.NODE_ENV':'"production"'},jsx:'automatic',logLevel:'warning'};
await build({...options,entryPoints:['real/chat-client.tsx'],outfile:'.chat-dist/client.js',format:'esm',platform:'browser'});
await build({...options,entryPoints:['real/chat-server.ts'],outfile:'.chat-dist/server.cjs',format:'cjs',platform:'node'});
