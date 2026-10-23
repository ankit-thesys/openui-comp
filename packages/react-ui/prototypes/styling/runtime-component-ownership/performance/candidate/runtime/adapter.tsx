import React,{createContext,useContext}from'react';
import{css,extractCss}from'goober';
export const ArmContext=createContext<'baseline'|'runtime'>('runtime');
export type CompiledStyle={className:string;css:string;href:string};
export type StyleDefinition={unit:string;get:()=>CompiledStyle};
const counters={compileCount:0,lookupCalls:0,compiledCSSBytes:0,resourceDefinitions:0,renderCalls:0,resourceEmits:0,compileMs:0};
export function readStyleCounters(){return {...counters};}
function compile(object:any){
 // Browser: public Goober Element target + extractCss API, REAL detached DOM.
 // Server: inherited implementation-dependent {data:''} target (not an
 // Element/public target type). This optimization does not validate that API.
 // Neither branch writes document.head or a consumer-owned stylesheet.
 const target=typeof document==='object'?document.createElement('div'):{data:''};
 // extractCss initializes/clears Goober's new target (including its browser
 // whitespace text node), so Node/browser compiled records are byte-identical.
 extractCss(target);
 const className=css.call({target},object);
 return {className,text:extractCss(target)};
}
export function defineStyles(unit:string,descriptor:any,rows:any[]=[]):StyleDefinition{
 // One immutable record per module-local definition. No theme/request/response
 // keys, DOM target, React element or document is retained after compilation.
 let compiled:CompiledStyle|undefined;
 return {unit,get(){counters.lookupCalls++;if(compiled)return compiled;const start=performance.now();
  const base=compile({'@layer components':descriptor});let text='@layer theme, base, components, utilities;'+base.text;
  // INHERITED experimental guard infrastructure; deliberately unchanged.
  for(const row of rows){const selector=row.selector.replaceAll('__SCOPE__','.'+base.className);let body='html body :where('+selector+'){'+Object.keys(row.properties).map(p=>p+':revert-layer;').join('')+'}';
   if(row.disabledCursor){const disabled=':is(:disabled,[data-disabled],[aria-disabled="true"])';body+='html body :where('+selector+')'+disabled+'{cursor:revert-layer;}';body+='@layer utilities{:is(button,input,textarea,select,div,span,a):where('+selector+')'+disabled+'{cursor:'+row.properties.cursor+';}}';}
   for(const condition of [...row.conditions].reverse())body=condition+'{'+body+'}';text+=body;
  }
  compiled=Object.freeze({className:base.className,css:text,href:'openui-owned-v1:'+unit+':'+base.className});
  counters.compileCount++;counters.resourceDefinitions++;counters.compiledCSSBytes+=new TextEncoder().encode(text).length;counters.compileMs+=performance.now()-start;
  return compiled;
 }};
}
export function useOwnedStyles(definitions:readonly StyleDefinition[],emitResources=true){
 const arm=useContext(ArmContext);counters.renderCalls++;
 const records=arm==='runtime'?definitions.map(d=>d.get()):[];
 counters.resourceEmits+=emitResources?records.length:0;
 return {className:records.map(s=>s.className).join(' '),resources:emitResources?records.map(s=><style key={s.href} href={s.href} precedence="openui">{s.css}</style>):[]};
}
export function ownedElement(Element:any,definitions:readonly StyleDefinition[]){
 const Owned=React.forwardRef<any,any>((props,ref)=>{const s=useOwnedStyles(definitions);return <>{s.resources}<Element {...props} ref={ref} className={[props.className,s.className].filter(Boolean).join(' ')||undefined}/></>});
 Owned.displayName='Owned('+ (typeof Element==='string'?Element:Element.displayName||Element.name||'Element') +')';return Owned;
}
// Ordinary element composition used in the reviewable private source copies.
// This component executes at React render time (including deferred portals),
// rather than while a parent constructs an element that may never mount.
export const OwnedElement=React.forwardRef<any,any>(function OwnedElement({$element:Element,$styles:definitions,$emitResources=true,...props},ref){const s=useOwnedStyles(definitions,$emitResources);return <>{s.resources}<Element {...props} ref={ref} className={[props.className,s.className].filter(Boolean).join(' ')||undefined}/></>});
