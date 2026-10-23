import fs from 'node:fs/promises';import path from 'node:path';import{createRequire}from'node:module';
import{selectorPaths,metadataSelector}from'./runtime/selector-normalize.mjs';
export const probeRoot=path.dirname(new URL(import.meta.url).pathname);
export const repo='/Users/ankitdas/thesys/openui-styling-prototype';
export const previous=repo+'/packages/react-ui/prototypes/styling';
export const ownershipSourceRoot=probeRoot+'/source/src';
const require=createRequire(previous+'/real/package.json');
const sass=require('sass'),postcss=require(previous+'/node_modules/postcss'),selectorParser=require(previous+'/node_modules/postcss-selector-parser');
const ts=require('/Users/ankitdas/thesys/openui/node_modules/.pnpm/typescript@6.0.3/node_modules/typescript');
export const build=require(previous+'/node_modules/esbuild').build;
export const alias=Object.fromEntries(['react-lang','react-headless','lang-core','observability','devtools'].map(p=>['@openuidev/'+p,repo+'/packages/'+p+'/src/index.ts']));
Object.assign(alias,{goober:'/private/tmp/openui-runtime-owned-components/vendor/goober/src/index.js',react:previous+'/node_modules/react','react-dom':previous+'/node_modules/react-dom'});
export const buildOptions={bundle:true,minify:false,sourcemap:true,alias,nodePaths:[previous+'/real/node_modules',previous+'/node_modules'],define:{'process.env.NODE_ENV':'"production"'},jsx:'automatic',logLevel:'warning'};
// Finite source ownership inventory, NOT a runtime/workload allowlist. Source
// copies import their own definitions through ordinary composition.
export const units={
 Card:{files:['Card/card.scss'],sources:['Card']},Button:{files:['Button/button.scss'],sources:['Button']},Input:{files:['Input/input.scss'],sources:['Input']},CardHeader:{files:['CardHeader/cardHeader.scss'],sources:['CardHeader']},Buttons:{files:['Buttons/buttons.scss'],sources:['Buttons']},
 FormControl:{files:['FormControl/formControl.scss'],sources:['FormControl/FormControl.tsx']},Hint:{files:['FormControl/Hint/hint.scss'],sources:['FormControl/Hint']},Label:{files:['Label/label.scss'],sources:['Label']},
 TextContent:{files:['TextContentWrapper/textContentWrapper.scss'],sources:['TextContentWrapper']},Markdown:{files:['MarkDownRenderer/markDownRenderer.scss'],sources:['MarkDownRenderer']},Table:{files:['Table/table.scss'],sources:['Table']},
 BarChart:{prefixRoots:false,roots:['openui-bar-chart-container'],files:['Charts/BarChart/barChart.scss'],sources:['Charts/BarChart']},LineChart:{prefixRoots:false,roots:['openui-line-chart-container'],files:['Charts/LineChart/lineChart.scss'],sources:['Charts/LineChart']},PieChart:{prefixRoots:false,roots:['openui-pie-chart-container'],files:['Charts/PieChart/pieChart.scss'],sources:['Charts/PieChart']},
 DefaultLegend:{files:['Charts/shared/core/DefaultLegend/defaultLegend.scss'],sources:['Charts/shared/core/DefaultLegend']},StackedLegend:{files:['Charts/shared/core/StackedLegend/stackedLegend.scss'],sources:['Charts/shared/core/StackedLegend']},ScrollButtonsHorizontal:{files:['Charts/shared/cartesian/ScrollButtonsHorizontal/scrollButtonsHorizontal.scss'],sources:['Charts/shared/cartesian/ScrollButtonsHorizontal']},ScrollButtonsVertical:{files:['Charts/shared/cartesian/ScrollButtonsVertical/scrollButtonsVertical.scss'],sources:['Charts/shared/cartesian/ScrollButtonsVertical']},PortalTooltip:{files:['Charts/shared/core/PortalTooltip/portalTooltip.scss'],sources:['Charts/shared/core/PortalTooltip']},
 IconButton:{files:['IconButton/iconButton.scss'],sources:['IconButton']},TextArea:{files:['TextArea/textArea.scss'],sources:['TextArea']},CheckBoxGroup:{files:['CheckBoxGroup/checkBoxGroup.scss'],sources:['CheckBoxGroup']},CheckBoxItem:{files:['CheckBoxItem/checkBoxItem.scss'],sources:['CheckBoxItem']},SwitchGroup:{files:['SwitchGroup/switchGroup.scss'],sources:['SwitchGroup']},SwitchItem:{files:['SwitchItem/switchItem.scss'],sources:['SwitchItem']},RadioGroup:{files:['RadioGroup/radioGroup.scss'],sources:['RadioGroup']},RadioItem:{files:['RadioItem/radioItem.scss'],sources:['RadioItem']},Select:{files:['Select/select.scss'],sources:['Select']},Tabs:{files:['Tabs/tabs.scss'],sources:['Tabs']},Accordion:{files:['Accordion/accordion.scss'],sources:['Accordion']},Separator:{files:['Separator/separator.scss'],sources:['Separator']},Modal:{files:['Modal/Modal.scss'],sources:['Modal']},Tooltip:{files:['TooltipWrapper/tooltipWrapper.scss'],sources:['TooltipWrapper']},AssistantMessage:{roots:['openui-shell-thread-message-assistant','openui-shell-thread-message-user'],files:['OpenUIChat/assistantMessage.scss'],sources:['OpenUIChat']},
};
let defaults;
async function loadDefaults(){if(defaults)return;const r=await build({...buildOptions,stdin:{contents:`export {defaultLightTheme} from '${repo}/packages/react-ui/src/components/ThemeProvider/defaultTheme';export {camelToKebab} from '${repo}/packages/react-ui/src/components/ThemeProvider/utils';`,resolveDir:probeRoot,loader:'ts'},platform:'node',format:'esm',write:false,sourcemap:false});const t=await import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'));defaults=Object.fromEntries(Object.entries(t.defaultLightTheme).filter(([,v])=>typeof v==='string').map(([k,v])=>['--openui-'+t.camelToKebab(k),v]));}
function fallbacks(value,stack=[]){return value.replace(/var\((--openui-[a-z0-9-]+)\)/g,(all,key)=>defaults[key]&&!stack.includes(key)?'var('+key+', '+fallbacks(defaults[key],[...stack,key])+')':all);}
export async function prepareStyleUnit(name,{files=[],cssText,roots=['*'],prefixRoots=true}={}){
 await loadDefaults();let css=cssText??'';for(const file of files)css+=sass.compile(repo+'/packages/react-ui/src/components/'+file,{style:'compressed',logger:{warn(){},debug(){}}}).css;
 let serial=0;const tree=postcss.parse(css),rows=[],rootClasses=new Set();
 if(name==='FormControl')tree.walkRules(r=>{if(r.selector.includes('openui-hint'))r.remove();});
 function object(node,keyframes=false){const out={};for(const n of node.nodes||[]){
  if(n.type==='decl')out[n.prop+'/*d'+serial+++'*/']=fallbacks(n.value)+(n.important?'!important':'');
  else if(n.type==='rule'){
   if(keyframes){out[n.selector+'/*r'+serial+++'*/']=object(n,true);continue;}
   for(const{steps,zeroed}of selectorPaths(n.selector,roots,prefixRoots)){if(!zeroed)throw Error('Unassigned selector without class: '+name+' '+n.selector);let value=object(n);for(const step of [...steps].reverse())value={[step]:value};out['&/*r'+serial+++'*/']=value;}
  }else if(n.type==='atrule'&&n.nodes)out['@'+n.name+' '+n.params+'/*a'+serial+++'*/']=object(n,keyframes||n.name.endsWith('keyframes'));
  else if(n.type==='atrule')throw Error('Unsupported at-rule '+n.toString());
 }return out;}
 const descriptor=object(tree);
 tree.walkRules(rule=>{const ancestry=[];for(let p=rule.parent;p&&p.type!=='root';p=p.parent){if(p.type==='atrule'&&p.name.endsWith('keyframes'))return;if(p.type==='atrule')ancestry.unshift('@'+p.name+' '+p.params);}
  const properties={};for(const d of rule.nodes||[])if(d.type==='decl')properties[d.prop]=fallbacks(d.value);if(!Object.keys(properties).length)return;
  for(const selector of postcss.list.comma(rule.selector)){let firstClass;selectorParser(ast=>ast.each(sel=>{const end=sel.nodes.findIndex(n=>n.type==='combinator');firstClass=sel.nodes.slice(0,end<0?undefined:end).find(n=>n.type==='class')?.value;})).processSync(selector.trim());if(!firstClass)throw Error('No owner class '+name+' '+selector);rootClasses.add(firstClass);
   rows.push({selector:metadataSelector(selector.trim(),roots,prefixRoots),properties,conditions:ancestry,disabledCursor:!!properties.cursor&&/disabled/.test(selector)});
  }
 });
 await fs.mkdir(probeRoot+'/runtime/styles',{recursive:true});await fs.mkdir(probeRoot+'/runtime/descriptors',{recursive:true});await fs.mkdir(probeRoot+'/runtime/metadata',{recursive:true});
 await fs.writeFile(probeRoot+'/runtime/descriptors/'+name+'.json',JSON.stringify(descriptor));await fs.writeFile(probeRoot+'/runtime/metadata/'+name+'.json',JSON.stringify(rows));
 await fs.writeFile(probeRoot+'/runtime/styles/'+name+'.tsx',`import {defineStyles} from '../adapter';\nimport descriptor from '../descriptors/${name}.json';\nimport rows from '../metadata/${name}.json';\nexport const styles=defineStyles(${JSON.stringify(name)},descriptor,rows);\n`);
 return{descriptor,rows,css,rootClasses:[...rootClasses],files};
}
async function sourceFiles(where){const s=await fs.stat(where);if(s.isFile())return where.endsWith('.tsx')?[where]:[];const out=[];for(const e of await fs.readdir(where,{withFileTypes:true})){if(e.name==='stories'||e.name==='__tests__')continue;out.push(...await sourceFiles(path.join(where,e.name)));}return out;}
// Build-time TS AST edit creates explicit ordinary React composition. Runtime
// never searches response text, DOM class strings or a component registry.
export async function attachModuleStyles(file,names){const original=await fs.readFile(file,'utf8');const sf=ts.createSourceFile(file,original,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);let attachments=0;
 const f=ts.factory;const tr=ts.transform(sf,[ctx=>root=>ts.visitNode(root,function visit(node){
  if(ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node)){
   const hasClass=node.attributes.properties.some(a=>ts.isJsxAttribute(a)&&a.name.getText(sf)==='className');
   if(hasClass){attachments++;const raw=node.tagName.getText(sf);const element=/^[a-z]/.test(raw)&&!raw.includes('.')?f.createStringLiteral(raw):f.createJsxExpression(undefined,node.tagName);
    const attrs=f.createJsxAttributes([f.createJsxAttribute(f.createIdentifier('$element'),typeof element.text==='string'&&ts.isStringLiteral(element)?element:f.createJsxExpression(undefined,node.tagName)),f.createJsxAttribute(f.createIdentifier('$styles'),f.createJsxExpression(undefined,f.createArrayLiteralExpression(names.map((_,i)=>f.createIdentifier('__styles'+i))))),...node.attributes.properties]);
    return ts.isJsxOpeningElement(node)?f.updateJsxOpeningElement(node,f.createIdentifier('__OwnedElement'),node.typeArguments,attrs):f.updateJsxSelfClosingElement(node,f.createIdentifier('__OwnedElement'),node.typeArguments,attrs);
   }
  }
  if(ts.isJsxElement(node)){const opening=ts.visitNode(node.openingElement,visit);const children=ts.visitNodes(node.children,visit);return f.updateJsxElement(node,opening,children,ts.isIdentifier(opening.tagName)&&opening.tagName.text==='__OwnedElement'?f.createJsxClosingElement(f.createIdentifier('__OwnedElement')):node.closingElement);}
  return ts.visitEachChild(node,visit,ctx);
 })]);
 if(!attachments){tr.dispose();return{file,attachments:0};}
 let rel=path.relative(path.dirname(file),probeRoot+'/runtime/adapter').replaceAll(path.sep,'/');if(!rel.startsWith('.'))rel='./'+rel;
 const imports=[`import {OwnedElement as __OwnedElement} from ${JSON.stringify(rel)};`,...names.map((n,i)=>{let p=path.relative(path.dirname(file),probeRoot+'/runtime/styles/'+n).replaceAll(path.sep,'/');if(!p.startsWith('.'))p='./'+p;return `import {styles as __styles${i}} from ${JSON.stringify(p)};`})].join('\n');
 let text=ts.createPrinter().printFile(tr.transformed[0]);tr.dispose();const directive=text.startsWith('"use client";')?'"use client";\n':'';if(directive)text=text.slice(text.indexOf('\n')+1);await fs.writeFile(file,directive+imports+'\n'+text);return{file,attachments};
}
export async function prepareRuntime(){await loadDefaults();const generated={},modules=new Map();let baseline='';for(const[name,unit]of Object.entries(units)){const value=await prepareStyleUnit(name,unit);generated[name]=value;baseline+=value.css;for(const source of unit.sources)for(const file of await sourceFiles(ownershipSourceRoot+'/components/'+source)){const defs=modules.get(file)||[];defs.push(name);modules.set(file,defs);}}
 const attached=[];for(const[file,names]of modules){await fs.writeFile(file,await fs.readFile(file.replace(ownershipSourceRoot,repo+'/packages/react-ui/src')));attached.push({...await attachModuleStyles(file,names),definitions:names});}
 const unassigned=Object.keys(units).filter(n=>!attached.some(m=>m.attachments&&m.definitions.includes(n)));if(unassigned.length)throw Error('Selected style families without source owner: '+unassigned.join(','));
 await fs.writeFile(probeRoot+'/runtime/baseline.css',baseline);await fs.writeFile(probeRoot+'/ownership-inventory.json',JSON.stringify({method:'Static source-module ownership, no response scanning. One self scope; genuine descendant selectors retained. Each selected family must have actual JSX attachments.',units:Object.fromEntries(Object.entries(generated).map(([n,v])=>[n,{files:v.files,rootClasses:v.rootClasses,selectors:v.rows.length}])),modules:attached,unassigned},null,2));return generated;
}
if(process.argv[1]===new URL(import.meta.url).pathname){await prepareRuntime();console.log('Owned styles prepared');}
