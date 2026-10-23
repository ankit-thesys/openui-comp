import './generate-styles.mjs';
import {build} from 'esbuild';import fs from 'node:fs/promises';
await fs.rm('lib-dist',{recursive:true,force:true});await fs.mkdir('lib-dist');
await fs.rm('ssr-dist',{recursive:true,force:true});await fs.mkdir('ssr-dist');
await build({entryPoints:['lib/goober.js'],outfile:'lib-dist/goober.js',bundle:true,format:'esm',packages:'external',sourcemap:true});
await build({entryPoints:['lib-dist/goober.js'],outfile:'ssr-dist/goober.js',bundle:true,format:'esm',platform:'node',packages:'external',sourcemap:true});
console.log('Built Goober prototype adapter.');
