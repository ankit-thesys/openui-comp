import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const base=path.resolve('.compat/none/setup-checks');
const cli=path.resolve('.compat/none/node_modules/@openui/goober-compat-prototype/configure.mjs');
await fs.rm(base,{recursive:true,force:true});
const results=[];
async function fixture(name,layout,source){const root=path.join(base,name);await fs.mkdir(path.dirname(path.join(root,layout)),{recursive:true});await fs.writeFile(path.join(root,'package.json'),JSON.stringify({dependencies:{react:'19.3.1',next:'16.4.2'}}));await fs.writeFile(path.join(root,layout),source);await fs.writeFile(path.join(path.dirname(path.join(root,layout)),'globals.css'),'button { color: red; }\n');return root;}
const run=root=>spawnSync(process.execPath,[cli,root],{encoding:'utf8'});
async function snapshot(root){const entries=await fs.readdir(root,{recursive:true,withFileTypes:true});const files={};for(const e of entries)if(e.isFile()){const file=path.join(e.parentPath||e.path,e.name);files[path.relative(root,file)]=await fs.readFile(file,'utf8');}return JSON.stringify(files);}
function check(name,pass){results.push({name,pass});console.log(name+': '+(pass?'PASS':'FAIL'));}
const source="// keep comment\n'use client';\nimport './globals.css';\nexport default function Layout({children}) { return <html><body>{children}</body></html>; }\n";
const root=await fixture('js','app/layout.jsx',source);const first=run(root);const updated=await fs.readFile(path.join(root,'app/layout.jsx'),'utf8');const inserted="\nimport './openui.generated.css'; // OpenUI: component defaults before app CSS\n";
check('Preserve directives, comments and all original layout source',first.status===0&&updated.replace(inserted,'')===source&&updated.indexOf("'use client'")<updated.indexOf('openui.generated.css')&&updated.indexOf('openui.generated.css')<updated.indexOf('globals.css'));
check('Preserve host stylesheet',await fs.readFile(path.join(root,'app/globals.css'),'utf8')==='button { color: red; }\n');
const before=await snapshot(root);check('Repeat setup is idempotent',run(root).status===0&&before===await snapshot(root));
await fs.appendFile(path.join(root,'app/openui.generated.css'),'/* consumer edit */');const customized=await snapshot(root);check('Refuse customized CSS without changing any files',run(root).status!==0&&customized===await snapshot(root));
const ts=await fixture('tsx','src/app/layout.tsx',"import './globals.css';\nexport default function Layout({children}: {children: React.ReactNode}) { return <html><body>{children}</body></html>; }\n");check('Support src/app TypeScript layout',run(ts).status===0);
const ambiguous=await fixture('ambiguous','app/layout.jsx',source);await fs.writeFile(path.join(ambiguous,'app/layout.js'),source);const ambBefore=await snapshot(ambiguous);check('Refuse ambiguous root layouts without changes',run(ambiguous).status!==0&&ambBefore===await snapshot(ambiguous));
const moved=await fixture('moved','app/layout.jsx',source);run(moved);await fs.writeFile(path.join(moved,'app/layout.jsx'),source+"\nimport './openui.generated.css';\n");const movedBefore=await snapshot(moved);check('Refuse reordered generated import without changes',run(moved).status!==0&&movedBefore===await snapshot(moved));
const newConflict=await fixture('conflict','app/layout.jsx',source);await fs.writeFile(path.join(newConflict,'app/openui.generated.css'),'custom');const conflictBefore=await snapshot(newConflict);check('Validate complete write set before generating entry or editing layout',run(newConflict).status!==0&&conflictBefore===await snapshot(newConflict));
await fs.writeFile('results/setup-safety.json',JSON.stringify({generatedAt:new Date().toISOString(),results},null,2));if(results.some(r=>!r.pass))process.exitCode=1;
