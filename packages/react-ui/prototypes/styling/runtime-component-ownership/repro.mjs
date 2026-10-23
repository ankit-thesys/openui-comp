import {build,buildOptions} from '/private/tmp/openui-runtime-expanded-components/build-shared.mjs';
import {spawnSync} from 'node:child_process';
const root=new URL('.',import.meta.url).pathname;
await build({...buildOptions,entryPoints:[root+'repro.tsx'],outfile:root+'repro.cjs',platform:'node',format:'cjs',minify:true,sourcemap:false});
const result=spawnSync(process.execPath,[root+'repro.cjs'],{encoding:'utf8'});
process.stdout.write(result.stdout);process.stderr.write(result.stderr);process.exitCode=result.status;
