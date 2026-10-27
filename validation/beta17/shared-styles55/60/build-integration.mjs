import {build} from '/private/tmp/openui-common-styles/node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/lib/main.js';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
for(const [name,dir] of [['baseline','/private/tmp/openui-styles57-evidence/consumer'],['candidate','/private/tmp/openui-styles60-evidence/consumer']]){
 const out='/private/tmp/openui-styles60-evidence/'+name+'-browser';mkdirSync(out,{recursive:true});
 const result=await build({absWorkingDir:dir,stdin:{contents:readFileSync('/private/tmp/openui-styles60-evidence/integration.tsx','utf8'),resolveDir:dir,sourcefile:'integration.tsx',loader:'tsx'},bundle:true,minify:true,format:'esm',splitting:true,outdir:out,metafile:true,loader:{'.woff2':'file','.woff':'file','.ttf':'file'},define:{'process.env.NODE_ENV':'"production"'},logLevel:'warning'});
 writeFileSync(out+'/metafile.json',JSON.stringify(result.metafile));
}
