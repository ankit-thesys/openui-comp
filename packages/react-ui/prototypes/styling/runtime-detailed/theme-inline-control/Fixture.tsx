import React from 'react';
import descriptors from '../runtime/descriptors.json';
import { Renderer } from '@openuidev/react-lang';
import { openuiChatLibrary } from '/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/src/genui-lib/openuiChatLibrary';
import { ThemeProvider, useTheme } from '/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/src/components/ThemeProvider';
import { RuntimeButton } from '../runtime/Button';
export {RuntimeButton} from '../runtime/Button';
import { Input } from '/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/src/components/Input';
import { camelToKebab } from '/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/src/components/ThemeProvider/utils';
import { ArmContext, useOwnedStyle, ownedComponent, type Unit } from '../runtime/adapter';
export { makeResponse } from '/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/prototypes/styling/real/workloads';
import { makeResponse } from '/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/prototypes/styling/real/workloads';
export { ArmContext, ownedStyle, useOwnedStyle, ownedComponent } from '../runtime/adapter';
export const RuntimeInput=ownedComponent(Input,'Input',descriptors.Input);
function decorate(element:any,className:string,card=false):any{
 if(!React.isValidElement(element))return element;
 if(card)return React.cloneElement(element as any,{},React.Children.map((element.props as any).children,child=>decorate(child,className)));
 return React.cloneElement(element as any,{className:[(element.props as any).className,className].filter(Boolean).join(' ')});
}
const names:(Exclude<Unit,'Theme'>)[]=['Card','Button','Input','CardHeader','Buttons','FormControl','TextContent','Table','BarChart'];
const overrides=names.map(name=>{
 const original=openuiChatLibrary.components[name];
 const Original=original.component;
 function RuntimeRenderer(props:any){
  const styles=useOwnedStyle(name,descriptors[name]);
  // Invoke the original genui adapter, including its hooks, on both arms.
  // Its returned production component is unchanged; only className is supplied.
  const element=Original(props);
  return <>{styles.resource}{styles.className?decorate(element,styles.className,name==='Card'):element}</>;
 }
 return {...original,component:RuntimeRenderer};
});
export const runtimeLibrary=openuiChatLibrary.extend({components:{override:overrides}});
export function RuntimeThemeBoundary({children,arm='runtime',themeName}:{children:React.ReactNode;arm?:'baseline'|'runtime';themeName?:string}){
 const {theme}=useTheme();
 const variables=Object.fromEntries(Object.entries(theme).filter(([,value])=>typeof value==='string').map(([key,value])=>['--openui-'+camelToKebab(key),value]));
 return <section data-arm={arm} data-theme={themeName} style={variables as React.CSSProperties}>{children}</section>;
}
export function Fixture({scenario='chat',arm='runtime',theme='blue',response,isStreaming=false,size=2,accent:customAccent}:{scenario?:string;arm?:'baseline'|'runtime';theme?:'blue'|'red';response?:string;isStreaming?:boolean;size?:number;accent?:string}){
 const accent=customAccent??(theme==='red'?'oklch(0.55 0.2 25 / 1)':'oklch(0.55 0.2 260 / 1)');
 return <ArmContext.Provider value={arm}><ThemeProvider lightTheme={{interactiveAccentDefault:accent}}><RuntimeThemeBoundary arm={arm} themeName={theme}><Renderer response={response??makeResponse(scenario,size)} isStreaming={isStreaming} library={runtimeLibrary}/></RuntimeThemeBoundary></ThemeProvider></ArmContext.Provider>;
}
