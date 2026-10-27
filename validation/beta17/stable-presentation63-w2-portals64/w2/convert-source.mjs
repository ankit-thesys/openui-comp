// One-time source editing aid; never shipped or imported by the package.
import ts from '/private/tmp/openui-common-styles/node_modules/typescript/lib/typescript.js';
import fs from 'node:fs';import path from 'node:path';
const root='/private/tmp/openui-selectors-w2/packages/react-components/src';const names=process.argv.slice(2);const ledger=[];
const kebab=s=>s.replace(/([a-z0-9])([A-Z])/g,'$1-$2').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'').toLowerCase();
function walkFiles(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walkFiles(path.join(dir,e.name)):/\.tsx?$/.test(e.name)?[path.join(dir,e.name)]:[]);}
for(const family of names){if(family==='EditableTable')throw Error('Explicitly deferred');for(const file of walkFiles(path.join(root,'components',family))){const text=fs.readFileSync(file,'utf8');const source=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);const calls=[];function visit(node){if(ts.isTaggedTemplateExpression(node)&&node.tag.getText(source)==='css'){const parts=[];let current=node.parent;while(current&&!ts.isSourceFile(current)){if(ts.isFunctionLike(current))throw Error('Runtime scope '+file);if(ts.isVariableDeclaration(current)||ts.isPropertyAssignment(current))parts.unshift(current.name.getText(source).replace(/^['"]|['"]$/g,''));current=current.parent;}calls.push({node,parts});}ts.forEachChild(node,visit);}visit(source);if(!calls.length)continue;if(text.includes('const stylesheetScope'))throw Error('Already converted '+file);
 const familySlug=kebab(family);let stem=path.basename(file).replace(/\.tsx?$/,'').replace(/\.styles$/,'');let prefix=kebab(stem);if(prefix===familySlug||stem==='styles')prefix=familySlug;else if(!prefix.startsWith(familySlug+'-'))prefix=familySlug+'-'+prefix;
 if(family==='_shared/cards')prefix='card-layout';
 const seen=new Set();const rules=[];let changed=text;
 for(const c of calls){let suffix=c.parts.map(p=>kebab(p.replace(/Classes$/,'').replace(/Class$/,''))).join('-');if(suffix==='component'||family==='Image'&&suffix==='image'||family==='SourceFaviconImage'&&suffix==='favicon'||family==='TagBlock'&&suffix==='block')suffix='root';if(family==='CodeBlock'&&suffix==='wrapper')suffix='root';let hook='openui-'+prefix+'-'+suffix;
 // Keep old alias-only host nodes outside newly global owned rules.
 if(text.includes('"'+hook+'"')||text.includes("'"+hook+"'"))hook+='-styled';
 // Existing hooks live in sibling TSX, not only in the style module.
 const existing=walkFiles(path.join(root,'components',family)).some(p=>{const s=fs.readFileSync(p,'utf8');return new RegExp('(?<![-A-Za-z0-9_])'+hook+'(?![-A-Za-z0-9_])').test(s);});if(existing)hook+='-styled';
 if(seen.has(hook))throw Error('Duplicate '+hook);seen.add(hook);const body=c.node.template.getText(source).slice(1,-1);rules.push('    .'+hook+' {\n'+body+'\n    }');ledger.push({family,file:path.relative(root,file),symbol:c.parts.join('.'),hook,bodySha256:null,body,scope:'document :where guard; single canonical class plus unchanged nested selectors',status:'source converted; runtime validation pending'});c.hook=hook;
 }
 for(const c of [...calls].reverse())changed=changed.slice(0,c.node.getStart(source))+JSON.stringify(c.hook)+changed.slice(c.node.end);
 changed+='\nconst stylesheetScope = css`\n  :where(&:root) {\n'+rules.join('\n')+'\n  }\n`;\n\nif (typeof document !== "undefined") {\n  document.documentElement.classList.add(stylesheetScope);\n}\n';
 const parsed=ts.createSourceFile(file,changed,ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);if(parsed.parseDiagnostics.length)throw Error('Parse failure '+file);fs.writeFileSync(file,changed);
}}
const output='/private/tmp/openui-selectors-w2-evidence/conversion-ledger.json';const prior=fs.existsSync(output)?JSON.parse(fs.readFileSync(output,'utf8')):[];fs.writeFileSync(output,JSON.stringify([...prior,...ledger],null,2));console.log(JSON.stringify({families:names,rules:ledger.length,files:new Set(ledger.map(r=>r.file)).size}));
