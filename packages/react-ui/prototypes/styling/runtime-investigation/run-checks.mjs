import {spawnSync} from 'node:child_process';
let failed=false;
for(const name of ['check:browser','check:next','report']){const r=spawnSync('npm',['run',name],{stdio:'inherit'});if(r.status!==0)failed=true;}
process.exitCode=failed?1:0;
