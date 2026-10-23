import fs from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {build,buildOptions,repo} from '/private/tmp/openui-runtime-expanded-components/build-shared.mjs';
const root=new URL('.',import.meta.url).pathname;
const componentRoot='/private/tmp/openui-runtime-expanded-components';
await fs.mkdir(root+'bundle',{recursive:true});
const entries={
 baseline:`export {Button} from '${repo}/packages/react-ui/src/components/Button';`,
 runtime:`export {RuntimeButton as Button} from '${componentRoot}/runtime/Button';`,
 unused:`import {RuntimeButton} from '${componentRoot}/runtime/Button'; export const marker='unused-import-control';`,
};
const rows=[];
for(const [arm,contents] of Object.entries(entries)){
 const file=root+'bundle/'+arm+'.tsx';await fs.writeFile(file,contents);
 const out=await build({...buildOptions,entryPoints:[file],outfile:root+'bundle/'+arm+'.js',platform:'browser',format:'esm',external:['react','react/*','react-dom','react-dom/*'],minify:true,sourcemap:false,metafile:true});
 const bytes=await fs.readFile(root+'bundle/'+arm+'.js');
 const inputs=Object.values(out.metafile.outputs).flatMap(o=>Object.entries(o.inputs).filter(([,v])=>v.bytesInOutput>0).map(([path,v])=>({path,bytesInOutput:v.bytesInOutput})));
 rows.push({arm,raw:bytes.length,gzip:gzipSync(bytes).length,sha256:createHash('sha256').update(bytes).digest('hex'),goober:inputs.some(x=>x.path.includes('/goober/')),chartImplementation:inputs.some(x=>/Charts\/|d3-/.test(x.path)),aggregateMetadata:inputs.filter(x=>/metadata\.json/.test(x.path)),inputs});
}
const hashes={};for(const file of ['runtime/adapter.tsx','runtime/Button.tsx','runtime/metadata.json','runtime/boundary-metadata.json','runtime/descriptors/Button.json'])hashes[file]=createHash('sha256').update(await fs.readFile(componentRoot+'/'+file)).digest('hex');
await fs.writeFile(root+'bundle-audit.json',JSON.stringify({generatedAt:new Date().toISOString(),scope:'Dedicated minified ESM Button entry, React external; JS excludes CSS/network costs. Not public-package barrel/tarball certification. Explicitly inspect aggregate property metadata retention.',rows,sourceHashes:hashes},null,2));
console.log(rows.map(({inputs,...r})=>r));
