import {build,buildOptions} from '/private/tmp/openui-runtime-expanded-components/build-shared.mjs';
import {spawnSync} from 'node:child_process';import fs from 'node:fs/promises';
const root=new URL('.',import.meta.url).pathname;
await build({...buildOptions,entryPoints:[root+'cache-control.tsx'],outfile:root+'cache-control.cjs',platform:'node',format:'cjs',minify:true,sourcemap:false});
const r=spawnSync(process.execPath,[root+'cache-control.cjs'],{encoding:'utf8'});await fs.writeFile(root+'cache-control.json',r.stdout);process.stderr.write(r.stderr);process.exitCode=r.status;
if(!r.status){const d=JSON.parse(r.stdout);for(const arm of ['original','cached']){const v=d.rows.filter(x=>!x.warmup&&x.arm===arm).map(x=>x.elapsed).sort((a,b)=>a-b);console.log(arm,'median ms',(v[5]+v[6])/2,'HTML bytes',d.rows[0].htmlBytes)}console.log(d.checks)}
