import React,{useId} from 'react';
import {Fixture as OriginalFixture} from './OriginalFixture';
import descriptors from './descriptors.json';
import { Renderer } from '@openuidev/react-lang';
import { openuiChatLibrary } from '/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/src/genui-lib/openuiChatLibrary';
import { ThemeProvider, useTheme } from '/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/src/components/ThemeProvider';
import { RuntimeButton } from './Button';
export {RuntimeButton} from './Button';
import { Input } from '/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/src/components/Input';
import { camelToKebab } from '/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/src/components/ThemeProvider/utils';
import { ArmContext, useOwnedStyle, ownedComponent, type Unit } from './adapter';
export { makeResponse } from '/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/prototypes/styling/real/workloads';
import { makeResponse } from '/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/prototypes/styling/real/workloads';
export { ArmContext, ownedStyle, useOwnedStyle, ownedComponent } from './adapter';
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
export function RuntimeThemeBoundary({children,arm='runtime',themeName,scopeId}:{children:React.ReactNode;arm?:'baseline'|'runtime';themeName?:string;scopeId?:string}){
 const {theme,mode}=useTheme();
 const variables=Object.fromEntries(Object.entries(theme).filter(([,value])=>typeof value==='string').map(([key,value])=>['--openui-'+camelToKebab(key),value]));
 return <section data-inline-theme-scope={scopeId} data-arm={arm} data-theme={themeName} data-mode={mode} style={variables as React.CSSProperties}>{children}</section>;
}
export function ScopedThemeProvider({children,arm='runtime',themeName,...props}:any){const id='openui-inline-'+useId().replace(/[^a-zA-Z0-9_-]/g,'');return <ThemeProvider {...props} cssSelector={'[data-inline-theme-scope="'+id+'"]'}><RuntimeThemeBoundary arm={arm} themeName={themeName} scopeId={id}>{children}</RuntimeThemeBoundary></ThemeProvider>;}
export function InlineFixture({scenario='chat',arm='runtime',theme='blue',response,isStreaming=false,size=2,accent:customAccent,mode='light'}:{scenario?:string;arm?:'baseline'|'runtime';theme?:'blue'|'red';response?:string;isStreaming?:boolean;size?:number;accent?:string;mode?:'light'|'dark'}){
 const accent=customAccent??(theme==='red'?'oklch(0.55 0.2 25 / 1)':'oklch(0.55 0.2 260 / 1)');
 return <ArmContext.Provider value={arm}><ScopedThemeProvider mode={mode} arm={arm} themeName={theme} lightTheme={{interactiveAccentDefault:accent}}><Renderer response={response??makeResponse(scenario,size)} isStreaming={isStreaming} library={runtimeLibrary}/></ScopedThemeProvider></ArmContext.Provider>;
}

export function Fixture(props:any){return props.arm==='baseline'?<OriginalFixture {...props}/>:<InlineFixture {...props}/>;}
export function ThemeCases(){return <ArmContext.Provider value="runtime"><ScopedThemeProvider themeName="outer-red" lightTheme={{interactiveAccentDefault:'oklch(0.55 0.2 25 / 1)'}}><RuntimeButton data-nested-outer>Outer red</RuntimeButton><ScopedThemeProvider themeName="inner-dark-green" mode="dark" darkTheme={{interactiveAccentDefault:'oklch(0.6 0.18 150 / 1)'}}><RuntimeButton data-nested-inner>Inner dark green</RuntimeButton></ScopedThemeProvider></ScopedThemeProvider><ScopedThemeProvider themeName="standalone-dark" mode="dark"><RuntimeButton data-standalone-dark>Dark default</RuntimeButton></ScopedThemeProvider></ArmContext.Provider>;}
