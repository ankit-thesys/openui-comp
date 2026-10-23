import fs from 'node:fs/promises';
import{createRequire}from'node:module';
import{units,repo,previous}from'../build-shared.mjs';
const require=createRequire(previous+'/real/package.json');
const sass=require('sass'),postcss=require(previous+'/node_modules/postcss'),parser=require(previous+'/node_modules/postcss-selector-parser'),{css}=require(previous+'/node_modules/goober');
function specificity(selector){let result;parser(root=>{const max=nodes=>nodes.map(sum).sort((a,b)=>b[0]-a[0]||b[1]-a[1]||b[2]-a[2])[0]||[0,0,0];function sum(selector){const score=[0,0,0];selector.nodes.forEach(n=>{let extra=[0,0,0];if(n.type==='id')extra[0]++;else if(n.type==='class'||n.type==='attribute')extra[1]++;else if(n.type==='tag')extra[2]++;else if(n.type==='pseudo'){if(n.value.startsWith('::'))extra[2]++;else if(n.value===':where'){}else if([':not',':is',':has'].includes(n.value))extra=max(n.nodes||[]);else extra[1]++;}extra.forEach((x,i)=>score[i]+=x);});return score}result=max(root.nodes);}).processSync(selector);return result}
function selectors(text){const rows=[];postcss.parse(text).walkRules(rule=>{for(let p=rule.parent;p;p=p.parent)if(p.type==='atrule'&&p.name.endsWith('keyframes'))return;for(const s of postcss.list.comma(rule.selector))rows.push(s)});return rows;}
const result={candidate:'nested-object-specificity-neutral',generatedAt:new Date().toISOString(),units:[],failures:[]};
for(const[name,unit]of Object.entries(units)){
 let source='';for(const file of unit.files)source+=sass.compile(repo+'/packages/react-ui/src/components/'+file,{style:'compressed',logger:{warn(){},debug(){}}}).css;
 const descriptor=JSON.parse(await fs.readFile(new URL('./descriptors/'+name+'.json',import.meta.url)));const target={data:''};const className=css.call({target},descriptor);
 const original=selectors(source),generated=selectors(target.data);const failures=[];
 if(original.length!==generated.length)failures.push({reason:'selector-count',original:original.length,generated:generated.length});
 for(let i=0;i<Math.min(original.length,generated.length);i++){
  const a=specificity(original[i]),b=specificity(generated[i]);if(JSON.stringify(a)!==JSON.stringify(b))failures.push({reason:'specificity',index:i,original:original[i],generated:generated[i],a,b});
  // One generated scope class per selector: duplication was the old serializer bug.
  if(generated[i].split('.'+className).length!==2)failures.push({reason:'duplicated-scope',index:i,original:original[i],generated:generated[i]});
 }
 result.units.push({name,originalSelectors:original.length,generatedSelectors:generated.length,failures});result.failures.push(...failures.map(f=>({unit:name,...f})));
}
await fs.writeFile(new URL('./serializer-results.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));if(result.failures.length)process.exitCode=1;
