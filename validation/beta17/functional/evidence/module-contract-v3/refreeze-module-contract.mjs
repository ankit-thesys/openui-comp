// Add missing provenance; served replay, schedules and product bytes stay unchanged.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {inventoryModules} from './module-inventory.mjs';
const c=path.resolve(process.env.BETA17_CONSUMER??'/private/tmp/beta17-consumer');
const hash=async p=>createHash('sha256').update(await fs.readFile(p)).digest('hex');
const previous=path.join(c,'handoff-v2.json');
const m=JSON.parse(await fs.readFile(previous,'utf8'));
await fs.copyFile(path.join(c,'installed-proof.json'),path.join(c,'installed-proof-v2.json'),fs.constants.COPYFILE_EXCL);
const inventory=await inventoryModules(c,[...m.runtimeModules,...m.moduleOrigins.baseline]);
Object.assign(m.inputs,inventory.inputs);
m.contractVersion=3;m.previousManifest={path:previous,sha256:await hash(previous),reason:'Hash every physical compiled module and its canonical path/package-lock identity'};
m.moduleInventory=inventory.records;
const artifacts=JSON.parse(await fs.readFile('validation/beta17/manifest.json','utf8')).artifacts;
for(const a of artifacts){if(await hash(a.path)!==a.sha256)throw Error(`Archive changed: ${a.path}`);m.inputs[a.path]=a.sha256;}
for(const name of ['validation/beta17/fixtures/build.mjs','validation/beta17/functional/module-inventory.mjs','validation/beta17/functional/refreeze-module-contract.mjs'])m.inputs[path.resolve(name)]=await hash(name);
const output=path.join(c,'handoff-v3.json');await fs.writeFile(output,JSON.stringify(m,null,2)+'\n',{flag:'wx'});
await fs.copyFile(output,path.join(c,'handoff.json'));
console.log(JSON.stringify({path:output,sha256:await hash(output),runtimeModules:m.runtimeModules.length,allModuleRecords:inventory.records.length}));
