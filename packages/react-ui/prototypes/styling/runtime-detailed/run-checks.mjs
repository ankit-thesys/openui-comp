import {spawnSync} from 'node:child_process';
const outcomes=[];
for(const task of ['check:selectors','check:next','check:browser','check:soak']){
 const result=spawnSync('npm',['run',task],{cwd:new URL('.',import.meta.url),stdio:'inherit'});
 outcomes.push({task,status:result.status,error:result.error?.message});
}
console.log(JSON.stringify(outcomes,null,2));
if(outcomes.some(x=>x.status!==0))process.exitCode=1;
