// File provenance inventory, not an assertion of visual equivalence.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const roots={legacy:'packages/react-ui/src',core:'packages/react-ui-core/src',chat:'packages/kits/src/react/chat'};
const files=[];
async function visit(root,dir=root){
 for(const entry of await fs.readdir(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name);
  if(entry.isDirectory()){if(!['__tests__','stories'].includes(entry.name))await visit(root,file);}
  else if(/\.(scss|css)$|\.styles\.ts$/.test(entry.name)){
   const bytes=await fs.readFile(file);files.push({owner:Object.keys(roots).find(k=>roots[k]===root),path:file,relative:path.relative(root,file),sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length});
  }
 }
}
for(const root of Object.values(roots))await visit(root);
console.log(JSON.stringify({purpose:'Source-file traceability; no parity or completeness claim',files},null,2));
