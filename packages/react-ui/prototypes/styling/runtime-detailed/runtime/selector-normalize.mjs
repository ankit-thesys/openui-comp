import {createRequire} from 'node:module';
const require=createRequire('/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/prototypes/styling/package.json');
const selectorParser=require('postcss-selector-parser');
// Normalize the selector AST into nested Goober OBJECT keys. Never rewrite
// generated CSS. One source class becomes :where(class), offsetting Goober's
// scope class; each pseudo gets its own nesting step to avoid Goober's regex
// splitting a functional pseudo followed by another pseudo or combinator.
export function selectorPaths(selector,roots,prefixRoots=false){
 const paths=[];
 selectorParser(root=>root.each(sel=>{
  const groups=[{combinator:'',nodes:[]}];
  sel.nodes.forEach(n=>{if(n.type==='combinator')groups.push({combinator:n.value.trim(),nodes:[]});else groups.at(-1).nodes.push(n)});
  let zeroed=false;
  const steps=[];
  groups.forEach((group,index)=>{
   const firstClass=group.nodes.find(n=>n.type==='class');
   const rootMatch=index===0&&firstClass&&roots.some(r=>firstClass.value===r||(prefixRoots&&firstClass.value.startsWith(r+'-')));
   const bases=group.nodes.filter(n=>n.type!=='pseudo').map(n=>{
    if(n.type==='class'&&!zeroed){zeroed=true;return ':where('+n.toString()+')';}
    return n.toString();
   });
   const relation=index===0?(rootMatch?'&':''):(group.combinator?group.combinator+' ':'');
   if(bases.length){steps.push(relation+bases[0]);for(const value of bases.slice(1))steps.push('&'+value);}
   else if(relation&&relation!=='&')steps.push(relation+'*');
   for(const pseudo of group.nodes.filter(n=>n.type==='pseudo'))steps.push('&'+pseudo.toString());
  });
  paths.push({steps,zeroed});
 })).processSync(selector.trim());
 return paths;
}
