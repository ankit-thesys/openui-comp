import {build,buildOptions,previous} from './build-shared.mjs';
import fs from 'node:fs/promises';import {gzipSync} from 'node:zlib';
const result=await build({...buildOptions,entryPoints:['browser-client.tsx'],outfile:'browser.js',platform:'browser',format:'esm',minify:true,metafile:true});const js=await fs.readFile('browser.js');await fs.writeFile('results/browser-build.json',JSON.stringify({scope:'Shared workload harness bundle, baseline and runtime arms differ by rendering flag; bundle size is not per-arm payload comparison. Standalone Button audit measures separate payloads.',raw:js.length,gzip:gzipSync(js).length,gooberRuntimeBundled:Object.keys(result.metafile.inputs).some(x=>x.includes('/goober/')),inputs:Object.keys(result.metafile.inputs)},null,2));

await build({...buildOptions,entryPoints:["standalone-client.tsx"],outfile:"standalone.js",platform:"browser",format:"esm",minify:true});
await build({...buildOptions,entryPoints:["standalone-server.tsx"],outfile:"standalone-server.cjs",platform:"node",format:"cjs",minify:true});
