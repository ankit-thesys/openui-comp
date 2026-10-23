import React, { createContext, useContext } from 'react';
import { css } from 'goober';
export const ArmContext = createContext<'baseline'|'runtime'>('runtime');
export type Unit = 'Card'|'Button'|'Input'|'CardHeader'|'Buttons'|'FormControl'|'TextContent'|'Table'|'BarChart'|'Theme';
export function ownedStyle(unit: Unit, descriptor:any) {
  const start=performance.now();
  const sink={data:''};
  const element={firstChild:sink,parentNode:true,nonce:undefined};
  const target=typeof window==='object'?{querySelector:()=>element}:sink;
  const className=css.call({target},descriptor);
  const href='openui-runtime-v1:'+unit+':'+className;
  if(typeof window!=='undefined'){
    const metrics=(window as any).__runtimeMetrics;
    if(metrics){metrics.calls=(metrics.calls||0)+1;metrics.compileMs=(metrics.compileMs||0)+(performance.now()-start);metrics.gooberCalls=(metrics.gooberCalls||0)+1;(metrics.gooberMs||=[]).push(performance.now()-start);(metrics.units||={})[unit]=((metrics.units||{})[unit]||0)+1;}
  }
  return {className,resource:<style href={href} precedence="openui">{sink.data}</style>,css:sink.data,href};
}
export function useOwnedStyle(unit:Unit,descriptor:any){const arm=useContext(ArmContext);return arm==='runtime'?ownedStyle(unit,descriptor):{className:'',resource:null,css:'',href:''};}
export function ownedComponent(Component:any,unit:Unit,descriptor:any){return React.forwardRef<any,any>((props,ref)=>{const s=useOwnedStyle(unit,descriptor);return <>{s.resource}<Component {...props} ref={ref} className={[props.className,s.className].filter(Boolean).join(' ')}/></>});}
