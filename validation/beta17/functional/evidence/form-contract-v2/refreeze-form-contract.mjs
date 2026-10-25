// Correct harness metadata only; product archives and served output are unchanged.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const consumer=path.resolve(process.env.BETA17_CONSUMER ?? '/private/tmp/beta17-consumer');
const read=async p=>fs.readFile(p);
const hash=async p=>createHash('sha256').update(await read(p)).digest('hex');
const oldPath=path.join(consumer,'handoff.json'), saved=path.join(consumer,'handoff-v1.json');
await fs.copyFile(oldPath,saved,fs.constants.COPYFILE_EXCL);
await fs.copyFile(path.join(consumer,'installed-proof.json'),path.join(consumer,'installed-proof-v1.json'),fs.constants.COPYFILE_EXCL);
const manifest=JSON.parse(await read(saved));
for(const cell of Object.values(manifest.cells)){
 if(cell.expectedDom.forms.selector!=='main form')throw Error('Unexpected previous form contract');
 cell.expectedDom.forms.selector='main [role="form"]';
}
manifest.contractVersion=2;
manifest.previousManifest={path:saved,sha256:await hash(saved),reason:'FormRenderer uses a div with role=form in both arms, not a native form'};
for(const file of ['validation/beta17/fixtures/build.mjs','validation/beta17/functional/assert-dom.mjs','validation/beta17/functional/browser.mjs']){
 const p=path.resolve(file);manifest.inputs[p]=await hash(p);
}
await fs.writeFile(path.join(consumer,'handoff-v2.json'),JSON.stringify(manifest,null,2)+'\n');
await fs.copyFile(path.join(consumer,'handoff-v2.json'),oldPath);
console.log(JSON.stringify({manifest:path.join(consumer,'handoff-v2.json'),sha256:await hash(path.join(consumer,'handoff-v2.json')),servedOutputChanged:false}));
