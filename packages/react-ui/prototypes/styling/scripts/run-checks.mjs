import {spawn} from 'node:child_process';
const children=[];
const run=(cmd,args)=>new Promise((resolve,reject)=>{const p=spawn(cmd,args,{stdio:'inherit'});p.on('exit',code=>code===0?resolve():reject(Error(`${cmd} exited ${code}`)));});
async function server(url,args){try{if((await fetch(url)).ok)return;}catch{}const p=spawn(process.execPath,args,{stdio:'inherit'});children.push(p);for(let i=0;i<90;i++){try{if((await fetch(url)).ok)return;}catch{}await new Promise(r=>setTimeout(r,500));}throw Error('Server did not become ready: '+url);}
try{await run('npm',['run','build']);await server('http://127.0.0.1:4177',['scripts/serve.mjs']);await server('http://127.0.0.1:4178',['next-fixture/node_modules/next/dist/bin/next','dev','next-fixture','--hostname','127.0.0.1','--port','4178']);await run(process.execPath,['scripts/check.mjs']);await run(process.execPath,['scripts/check-next.mjs']);await run(process.execPath,['scripts/report.mjs']);}finally{for(const p of children)p.kill();}
