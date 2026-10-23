import React,{createContext,useContext}from'react';import{css}from'goober';
export const ArmContext=createContext<'baseline'|'runtime'>('runtime');export type Unit=string;
export type StyleOptions={boundary?:boolean;rows?:any[]};
function compile(object:any){const sink={data:''};const element={firstChild:sink,parentNode:true,nonce:undefined};const target=typeof window==='object'?{querySelector:()=>element}:sink;return{className:css.call({target},object),text:sink.data};}
// Independent ownership-guard serializer; NEVER rewrites generated Goober CSS.
// Scoped source selectors/conditions and owned declarations were prepared once
// from the actual component CSS AST. No Sass/parser runs in the consumer.
export function ownedStyle(unit:Unit,descriptor:any,options:StyleOptions={}){const boundary=!!options.boundary;const start=performance.now();const base=compile(unit==='Theme'?descriptor:{'@layer components':descriptor});let text=unit==='Theme'?base.text:'@layer theme, base, components, utilities;'+base.text;
 if(unit!=='Theme'){const rows=options.rows||[];for(const row of rows){const selector=row.selector.replaceAll('__SCOPE__','.'+base.className);let body='html body :where('+selector+'){'+Object.keys(row.properties).map(property=>property+':revert-layer;').join('')+'}';
 if(row.disabledCursor){const disabled=':is(:disabled,[data-disabled],[aria-disabled="true"])';body+='html body :where('+selector+')'+disabled+'{cursor:revert-layer;}';body+='@layer utilities{:is(button,input,textarea,select,div,span,a):where('+selector+')'+disabled+'{cursor:'+row.properties.cursor+';}}';}
 for(const condition of [...row.conditions].reverse())body=condition+'{'+body+'}';text+=body;}}
 const href='openui-expanded-v1:'+unit+':'+(boundary?'boundary:':'component:')+base.className;
 if(typeof window!=='undefined'){const m=(window as any).__runtimeMetrics;if(m){m.calls=(m.calls||0)+1;m.compileMs=(m.compileMs||0)+(performance.now()-start);m.gooberCalls=(m.gooberCalls||0)+1;(m.gooberMs||=[]).push(performance.now()-start);(m.units||={})[unit]=(m.units[unit]||0)+1;m.guardInfrastructure=true;}}
 return{className:base.className,resource:<style href={href} precedence="openui">{text}</style>,css:text,href};}
export function useOwnedStyle(unit:Unit,descriptor:any,options:StyleOptions={}){const arm=useContext(ArmContext);return arm==='runtime'?ownedStyle(unit,descriptor,options):{className:'',resource:null,css:'',href:''};}
export function ownedComponent(Component:any,unit:Unit,descriptor:any,rows:any[]=[]){return React.forwardRef<any,any>((props,ref)=>{const s=useOwnedStyle(unit,descriptor,{rows});return <>{s.resource}<Component {...props} ref={ref} className={[props.className,s.className].filter(Boolean).join(' ')}/></>});}
