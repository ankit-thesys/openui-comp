import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function inventoryModules(consumer, modules) {
  const canonicalConsumer=await fs.realpath(consumer);
  const installed=await fs.realpath(path.join(canonicalConsumer,'node_modules'));
  const lock=JSON.parse(await fs.readFile(path.join(consumer,'package-lock.json'),'utf8'));
  const inputs={},records=[];
  for(const module of [...new Set(modules)].sort()){
    if(!path.isAbsolute(module)||module.includes('?'))throw Error(`Expected physical absolute module: ${module}`);
    const canonical=await fs.realpath(module);
    const relative=path.relative(installed,canonical);
    if(relative.startsWith('..')||path.isAbsolute(relative))throw Error(`Module outside installed consumer: ${module}`);
    const digest=hash(await fs.readFile(canonical));
    inputs[module]=digest;inputs[canonical]=digest;
    let root=path.dirname(canonical),metadata;
    while(root!==installed){
      try{metadata=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8'));break;}
      catch(error){if(error.code!=='ENOENT')throw error;root=path.dirname(root);}
    }
    if(!metadata?.name)throw Error(`Missing package owner: ${module}`);
    const ownerManifest=path.join(root,'package.json');inputs[ownerManifest]=hash(await fs.readFile(ownerManifest));
    const lockKey=path.relative(canonicalConsumer,root).split(path.sep).join('/');
    const locked=lock.packages[lockKey];
    if(!locked||locked.version!==metadata.version)throw Error(`Package lock mismatch: ${module}`);
    records.push({module,canonical,sha256:digest,package:metadata.name,version:metadata.version,ownerManifest,lockKey,locked});
  }
  return {inputs,records};
}
