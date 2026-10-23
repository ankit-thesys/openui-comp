import {spawn} from 'node:child_process';import path from 'node:path';
const children=[];
for(const [i,name]of ['none','tailwind3','tailwind4','bootstrap','plain'].entries()){
 const port=4210+i;
 const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{cwd:path.resolve('.compat',name),stdio:'inherit'});children.push(child);console.log(name+': http://127.0.0.1:'+port);
}
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{for(const child of children)child.kill();});
