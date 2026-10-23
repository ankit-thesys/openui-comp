import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import './generate-styles.mjs';
await fs.mkdir('.compat',{recursive:true});
for(const file of ['auto-button.js','generated-styles.js'])await fs.copyFile('lib/'+file,'package-prototype/'+file);
const result=JSON.parse(execFileSync('npm',['pack','./package-prototype','--pack-destination','.compat','--json'],{encoding:'utf8'}));
await fs.writeFile('results/package-artifact.json',JSON.stringify(result,null,2));
console.log('Packed '+result[0].filename);
