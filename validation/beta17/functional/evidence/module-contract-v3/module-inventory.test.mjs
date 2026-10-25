import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {inventoryModules} from './module-inventory.mjs';
async function fixture(){
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'beta17-inventory-'));
 const pkg=path.join(root,'node_modules','pkg');await fs.mkdir(pkg,{recursive:true});
 await fs.writeFile(path.join(pkg,'package.json'),JSON.stringify({name:'pkg',version:'1.0.0'}));
 await fs.writeFile(path.join(pkg,'module.js'),'export const value=1;');
 await fs.writeFile(path.join(root,'package-lock.json'),JSON.stringify({packages:{'node_modules/pkg':{version:'1.0.0',integrity:'test-lock-identity'}}}));
 return {root,pkg,module:path.join(pkg,'module.js')};
}
test('canonical module bytes and owner lock identity are frozen',async()=>{
 const f=await fixture();try{
  await fs.symlink(f.module,path.join(f.pkg,'alias.js'));
  const result=await inventoryModules(f.root,[f.module,path.join(f.pkg,'alias.js')]);
  assert.equal(result.records.length,2);assert.equal(result.records[1].package,'pkg');
  assert.equal(result.inputs[f.module],result.inputs[path.join(f.pkg,'alias.js')]);
  assert.equal(result.records[0].locked.integrity,'test-lock-identity');
 }finally{await fs.rm(f.root,{recursive:true,force:true});}
});
test('rejects outside-consumer resolution and mismatched lock identity',async()=>{
 const f=await fixture();try{
  const external=path.join(f.root,'outside.js');await fs.writeFile(external,'bad');
  await fs.symlink(external,path.join(f.pkg,'escape.js'));
  await assert.rejects(inventoryModules(f.root,[path.join(f.pkg,'escape.js')]),/outside installed/);
  await fs.writeFile(path.join(f.root,'package-lock.json'),JSON.stringify({packages:{'node_modules/pkg':{version:'2.0.0'}}}));
  await assert.rejects(inventoryModules(f.root,[f.module]),/lock mismatch/);
 }finally{await fs.rm(f.root,{recursive:true,force:true});}
});
