import {css,extractCss,keyframes} from 'goober';
import {rules,cssRule,mode,prepare,metadata as shared} from './styles.js';
export const metadata={engine:'goober',source:'lib/goober.js',styleSource:'lib/styles.js',...shared};
export function getClasses(policy,framework){
 prepare(policy,framework);
 const fade=keyframes({from:{opacity:0},to:{opacity:1}});
 const result=Object.fromEntries(Object.entries(rules).map(([name,rule])=>{const style=cssRule(name==='bar'?{...rule,animation:fade+' 200ms ease-out'}:rule);return [name,css(mode(policy,framework)==='layered'?{'@layer components':style}:style)];}));
 if(policy==='adapted'&&framework!=='tailwind4'&&typeof document!=='undefined'){
  const sheet=document.getElementById('_goober');if(sheet)document.head.prepend(sheet);
 }
 return result;
}
export function extract(){return {css:extractCss(),ids:[]};}
export function hydrate(){}
