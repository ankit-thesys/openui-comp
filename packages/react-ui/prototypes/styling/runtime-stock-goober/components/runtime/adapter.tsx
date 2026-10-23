import React,{createContext,useContext}from'react';
import{css}from'goober';
export const ArmContext=createContext<'baseline'|'runtime'>('runtime');
export const LayerContext=createContext(false);
export type StyleDefinition={unit:string;descriptor:any};
export function defineStyles(unit:string,descriptor:any):StyleDefinition{return {unit,descriptor};}
// Ordinary component authoring. Goober owns serialization, caching and injection.
// No extractCss, private target, custom parser, conflict guards, or style resources.
export function useOwnedStyles(definitions:readonly StyleDefinition[],_emitResources=true){
 const arm=useContext(ArmContext),layered=useContext(LayerContext);
 return {className:arm==='runtime'?definitions.map(d=>css(layered?{'@layer components':d.descriptor}:d.descriptor)).join(' '):'',resources:[]};
}
export function ownedElement(Element:any,definitions:readonly StyleDefinition[]){return React.forwardRef<any,any>((props,ref)=>{const s=useOwnedStyles(definitions);return <Element {...props} ref={ref} className={[props.className,s.className].filter(Boolean).join(' ')||undefined}/>;});}
export const OwnedElement=React.forwardRef<any,any>(function OwnedElement({$element:Element,$styles:definitions,$emitResources,...props},ref){const s=useOwnedStyles(definitions);return <Element {...props} ref={ref} className={[props.className,s.className].filter(Boolean).join(' ')||undefined}/>;});
export function readStyleCounters(){return {note:'No custom style cache or counters; stock Goober owns CSS.'};}
