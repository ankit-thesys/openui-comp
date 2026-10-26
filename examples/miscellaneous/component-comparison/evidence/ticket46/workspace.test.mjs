import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, copyFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const source = process.env.TICKET46_SOURCE ?? '/private/tmp/openui-nested-kit-discovery';
function fixture() {
 const dir=mkdtempSync(join(tmpdir(),'openui-discovery-'));
 writeFileSync(join(dir,'package.json'), JSON.stringify({name:'discovery-fixture',private:true,packageManager:'pnpm@10.33.0'}));
 copyFileSync(join(source,'pnpm-workspace.yaml'),join(dir,'pnpm-workspace.yaml'));
 function pkg(path,manifest){mkdirSync(join(dir,path),{recursive:true});writeFileSync(join(dir,path,'package.json'),JSON.stringify(manifest));}
 pkg('packages/foundation',{name:'@openuidev/fixture-foundation',version:'1.2.0',scripts:{build:'node -e "console.log(\'FOUNDATION_BUILT\')"'}});
 pkg('packages/kits/nested-fixture',{name:'@openuidev/fixture-nested',version:'2.0.0',private:true,scripts:{build:'node -e "console.log(\'NESTED_BUILT\')"'},peerDependencies:{'@openuidev/fixture-foundation':'>=1.0.0 <2.0.0'}});
 const run=(cmd,args)=>spawnSync(cmd,args,{cwd:dir,encoding:'utf8'});
 return {dir,pkg,run,cleanup:()=>rmSync(dir,{recursive:true,force:true})};
}
test('workspace build discovers a nested nonpublishing kit alongside a first-level package',()=>{
 const f=fixture();try{const result=f.run('pnpm',['--filter','./packages/**','--workspace-concurrency=1','run','build']);assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/NESTED_BUILT/);assert.match(result.stdout,/FOUNDATION_BUILT/);
 const list=f.run('pnpm',['--filter','./packages/**','list','--depth','-1','--json']);assert.equal(list.status,0,list.stderr);assert.deepEqual(JSON.parse(list.stdout).map(p=>p.name).sort(),['@openuidev/fixture-foundation','@openuidev/fixture-nested']);
 }finally{f.cleanup();}
});
function copyScripts(f){mkdirSync(join(f.dir,'scripts'));for(const name of readdirSync(join(source,'scripts')))if(name.endsWith('.mjs'))copyFileSync(join(source,'scripts',name),join(f.dir,'scripts',name));}
test('peer guard rejects an incompatible nested kit peer window',()=>{
 const f=fixture();try{copyScripts(f);
 const valid=f.run('node',['scripts/verify-peer-windows.mjs']);assert.equal(valid.status,0,valid.stderr);
 f.pkg('packages/kits/nested-fixture',{name:'@openuidev/fixture-nested',version:'2.0.0',private:true,peerDependencies:{'@openuidev/fixture-foundation':'>=2.0.0 <3.0.0'}});
 const bad=f.run('node',['scripts/verify-peer-windows.mjs']);assert.equal(bad.status,1,bad.stdout);assert.match(bad.stderr,/@openuidev\/fixture-nested peer-requires @openuidev\/fixture-foundation/);
 }finally{f.cleanup();}
});
function gitFixture(f){
 mkdirSync(join(f.dir,'.changeset'));writeFileSync(join(f.dir,'.changeset/config.json'),JSON.stringify({fixed:[],linked:[]}));
 for(const args of [['init','--quiet'],['config','user.name','Fixture'],['config','user.email','fixture@example.invalid'],['add','.'],['commit','--quiet','-m','baseline']]){const r=f.run('git',args);assert.equal(r.status,0,r.stderr);}
 return f.run('git',['rev-parse','HEAD']).stdout.trim();
}
test('nonpublishing changeset analysis identifies a changed nested kit without attributing it to the parent',()=>{
 const f=fixture();try{copyScripts(f);const base=gitFixture(f);writeFileSync(join(f.dir,'packages/kits/nested-fixture/index.js'),'export const value = 1;');
 f.run('git',['add','.']);f.run('git',['commit','--quiet','-m','change nested kit']);
 const result=f.run('node',['scripts/changeset-check.mjs',base]);assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/Changed but not released[^\n]*@openuidev\/fixture-nested/);assert.doesNotMatch(result.stdout,/could not run/);
 }finally{f.cleanup();}
});
test('existing first-level peer checks continue rejecting incompatible windows',()=>{
 const f=fixture();try{copyScripts(f);f.pkg('packages/consumer',{name:'@openuidev/fixture-consumer',version:'1.0.0',peerDependencies:{'@openuidev/fixture-foundation':'>=2.0.0 <3.0.0'}});
 const result=f.run('node',['scripts/verify-peer-windows.mjs']);assert.equal(result.status,1);assert.match(result.stderr,/@openuidev\/fixture-consumer peer-requires/);assert.doesNotMatch(result.stderr,/@openuidev\/fixture-nested peer-requires/);
 }finally{f.cleanup();}
});
test('changeset analysis recognizes a nested package version and its peer manifest path',()=>{
 const f=fixture();try{copyScripts(f);const base=gitFixture(f);
 writeFileSync(join(f.dir,'.changeset/foundation-major.md'),'---\n"@openuidev/fixture-foundation": major\n"@openuidev/fixture-nested": minor\n---\nfixture release plan\n');
 f.run('git',['add','.']);f.run('git',['commit','--quiet','-m','release plan']);
 const result=f.run('node',['scripts/changeset-check.mjs',base]);assert.equal(result.status,0);assert.doesNotMatch(result.stdout,/not a workspace package|could not run|fixture-nested` declares/);assert.match(result.stdout,/packages\/kits\/nested-fixture\/package.json is untouched/);
 }finally{f.cleanup();}
});
