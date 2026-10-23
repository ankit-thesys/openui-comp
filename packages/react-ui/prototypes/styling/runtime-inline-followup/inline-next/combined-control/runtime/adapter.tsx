import React, { createContext, useContext } from 'react';
import { css } from 'goober';
import rootMetadata from './button-root-metadata.json';
export const ArmContext = createContext<'baseline'|'runtime'>('runtime');
export type Unit = 'Card'|'Button'|'Input'|'CardHeader'|'Buttons'|'FormControl'|'TextContent'|'Table'|'BarChart'|'Theme';
export function ownedStyle(unit: Unit, descriptor:any) {
  const start=performance.now();
  function compile(object:any){const sink={data:''};const element={firstChild:sink,parentNode:true,nonce:undefined};const target=typeof window==='object'?{querySelector:()=>element}:sink;return {className:css.call({target},object),text:sink.data};}
  let className:string,text:string;
  if(unit==='Button'){const base=compile({'@layer components':descriptor});const reverts=Object.fromEntries(rootMetadata.rootProperties.map(key=>[key,'revert-layer']));const guard=compile({'html button:where(&)':{...reverts,'&:disabled':{cursor:'revert-layer'}}});className=base.className+' '+guard.className;text='@layer theme, base, components, utilities;'+base.text+guard.text;}else{const compiled=compile(descriptor);className=compiled.className;text=compiled.text;}
  const href='openui-runtime-v1:'+unit+':'+className.replace(/ /g,'-');
  if(typeof window!=='undefined'){
    const metrics=(window as any).__runtimeMetrics;
    if(metrics){metrics.calls=(metrics.calls||0)+1;metrics.compileMs=(metrics.compileMs||0)+(performance.now()-start);metrics.gooberCalls=(metrics.gooberCalls||0)+(unit==='Button'?2:1);(metrics.gooberMs||=[]).push(performance.now()-start);(metrics.units||={})[unit]=((metrics.units||{})[unit]||0)+1;}
  }
  return {className,resource:<style href={href} precedence="openui">{text}</style>,css:text,href};
}
export function useOwnedStyle(unit:Unit,descriptor:any){const arm=useContext(ArmContext);return arm==='runtime'?ownedStyle(unit,descriptor):{className:'',resource:null,css:'',href:''};}
export function ownedComponent(Component:any,unit:Unit,descriptor:any){return React.forwardRef<any,any>((props,ref)=>{const s=useOwnedStyle(unit,descriptor);return <>{s.resource}<Component {...props} ref={ref} className={[props.className,s.className].filter(Boolean).join(' ')}/></>});}
