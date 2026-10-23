import {css,extractCss,keyframes} from 'goober';
import {artifacts} from './generated-styles.js';
import {rules,cssRule,mode,prepare,metadata as shared} from './styles.js';
export const metadata={engine:'goober',source:'lib/goober.js',styleSource:'lib/styles.js',...shared};
export function getClasses(policy,framework){
 if(policy==='adapted'){
  const bundle=artifacts[mode(policy,framework)];
  if(typeof document!=='undefined'){
   // Own only this tag. Never move, clear, or append to the host's _goober sheet.
   let sheet=document.querySelector('style[data-openui-owned="'+bundle.href+'"]');
   if(!sheet){sheet=document.createElement('style');sheet.dataset.openuiOwned=bundle.href;sheet.textContent=bundle.css;document.head.prepend(sheet);}
  }
  prepare(policy,framework);
  return bundle.classes;
 }
 prepare(policy,framework);
 const fade=keyframes({from:{opacity:0},to:{opacity:1}});
 const result=Object.fromEntries(Object.entries(rules).map(([name,rule])=>{const style=cssRule(name==='bar'?{...rule,animation:fade+' 200ms ease-out'}:rule);return [name,css(mode(policy,framework)==='layered'?{'@layer components':style}:style)];}));

 return result;
}
export function extract(){return {css:extractCss(),ids:[]};}
export function hydrate(){}
