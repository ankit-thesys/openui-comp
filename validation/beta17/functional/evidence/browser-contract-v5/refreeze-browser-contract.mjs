// Immutable operator-environment update; product, replay and thresholds stay fixed.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const c='/private/tmp/beta17-consumer';
const worker='/Users/ankitdas/.codex/worktrees/63b2/openui/validation/beta17/performance';
const hash=async p=>createHash('sha256').update(await fs.readFile(p)).digest('hex');
const previous=c+'/handoff-v4.json',m=JSON.parse(await fs.readFile(previous));
const allowed=new Set([path.join(worker,'browser.mjs'),path.join(worker,'run.mjs'),path.resolve('validation/beta17/functional/readiness.mjs')]);
const changed=[];
for(const [file,digest]of Object.entries(m.inputs))if(await hash(file)!==digest){if(!allowed.has(file))throw Error(`Unexpected existing input change: ${file}`);changed.push(file);m.inputs[file]=await hash(file);}
await fs.copyFile(c+'/installed-proof.json',c+'/installed-proof-v4.json',fs.constants.COPYFILE_EXCL);
const provenancePath=path.join(worker,'evidence/cft-browser.json');
const provenance=JSON.parse(await fs.readFile(provenancePath));
const bundle=JSON.parse(await fs.readFile(provenance.bundleInventoryPath));
Object.assign(m.inputs,bundle.files);m.browser=provenance;m.contractVersion=5;
m.previousManifest={path:previous,sha256:await hash(previous),reason:'Pinned official isolated Chrome for Testing and reviewed standard Playwright lifecycle; prior attempts/diagnostics excluded'};
const metadata='/private/tmp/beta17-cft/known-good-versions-with-downloads.json';
if(await hash(provenance.archivePath)!==provenance.archiveSha256||await hash(metadata)!==provenance.metadataSha256)throw Error('Browser source-chain hash mismatch');
const include=[previous,c+'/installed-proof-v4.json',provenance.archivePath,metadata,provenancePath,provenance.bundleInventoryPath,path.join(worker,'evidence/cft-archive-proof.json'),path.resolve('validation/beta17/functional/refreeze-browser-contract.mjs')];
for(const file of await fs.readdir(worker))if(file.endsWith('.mjs'))include.push(path.join(worker,file));
for(const file of include)m.inputs[file]=await hash(file);
const {browserLaunchOptions}=await import(pathToFileURL(path.join(worker,'browser-config.mjs')));await browserLaunchOptions(m);
const out=c+'/handoff-v5.json';await fs.writeFile(out,JSON.stringify(m,null,2)+'\n',{flag:'wx'});await fs.copyFile(out,c+'/handoff.json');
await fs.writeFile(c+'/v5-provenance-delta.json',JSON.stringify({changedExistingInputs:changed,browser:m.browser,regularBundleFiles:Object.keys(bundle.files).length,symlinks:Object.keys(bundle.symlinks).length,productReplayChanged:false},null,2)+'\n');
console.log(JSON.stringify({path:out,sha256:await hash(out),changedExistingInputs:changed,bundleFiles:Object.keys(bundle.files).length}));
