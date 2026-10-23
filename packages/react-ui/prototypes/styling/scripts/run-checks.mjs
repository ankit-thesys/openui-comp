import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
const children=[];
const run=(cmd,args,env={})=>new Promise((resolve,reject)=>{const p=spawn(cmd,args,{stdio:'inherit',env:{...process.env,...env}});p.on('error',reject);p.on('exit',code=>code===0?resolve():reject(Error(`${cmd} exited ${code}`)));});
async function server(url,args,env={}){
 // Dedicated check ports: never accidentally test a stale existing server.
 try{await fetch(url);throw Error('Check port already occupied: '+url);}catch(e){if(e.message.startsWith('Check port'))throw e;}
 const p=spawn(process.execPath,args,{stdio:'inherit',env:{...process.env,...env}});children.push(p);
 for(let i=0;i<90;i++){if(p.exitCode!==null)throw Error('Server exited: '+url);try{if((await fetch(url)).ok)return;}catch{}await new Promise(r=>setTimeout(r,500));}
 throw Error('Server did not become ready: '+url);
}
try{
 await run('npm',['run','build']);
 await run(process.execPath,['next-fixture/node_modules/next/dist/bin/next','build','next-fixture']);
 await server('http://127.0.0.1:4187',['scripts/serve.mjs'],{PORT:'4187'});
 await server('http://127.0.0.1:4189',['next-fixture/node_modules/next/dist/bin/next','start','next-fixture','--hostname','127.0.0.1','--port','4189']);
 await run(process.execPath,['scripts/pack-prototype.mjs']);
 await run(process.execPath,['scripts/prepare-compat.mjs']);
 const checks=[];
 for(const [script,env] of [['check.mjs',{PROTOTYPE_URL:'http://127.0.0.1:4187'}],['check-next.mjs',{NEXT_URL:'http://127.0.0.1:4189'}],['check-compat.mjs',{}],['check-csp.mjs',{}]]){
  try{await run(process.execPath,['scripts/'+script],env);checks.push({script,status:'passed'});}
  catch(e){checks.push({script,status:'failed-or-incomplete',error:e.message});}
 }
 await fs.writeFile('results/validation-run.json',JSON.stringify({generatedAt:new Date().toISOString(),checks},null,2));
 await run(process.execPath,['scripts/report.mjs']);
 if(checks.some(x=>x.status!=='passed'))process.exitCode=1;
}finally{for(const p of children)p.kill();}
