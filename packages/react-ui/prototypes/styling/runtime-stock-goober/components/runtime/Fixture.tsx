import React,{useId} from 'react';
import{makeExpandedResponse}from './workloads';
export{makeExpandedResponse}from './workloads';
import {Fixture as OriginalFixture} from './OriginalFixture';
import { Renderer } from '@openuidev/react-lang';
import { openuiChatLibrary } from '/private/tmp/openui-stock-goober/components/source/src/genui-lib/openuiChatLibrary';
import { ThemeProvider, useTheme } from '/private/tmp/openui-stock-goober/components/source/src/components/ThemeProvider';
import { RuntimeButton } from './Button';
export {RuntimeButton} from './Button';
import { Input } from '/private/tmp/openui-stock-goober/components/source/src/components/Input';
import { camelToKebab } from '/private/tmp/openui-stock-goober/components/source/src/components/ThemeProvider/utils';
import { ArmContext } from './adapter';
export { makeResponse } from '/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/prototypes/styling/real/workloads';
import { makeResponse } from '/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/prototypes/styling/real/workloads';
export {ArmContext,defineStyles,useOwnedStyles,ownedElement,OwnedElement,readStyleCounters} from './adapter';
export const RuntimeInput=Input;
export const runtimeLibrary=openuiChatLibrary;
export function RuntimeThemeBoundary({children,arm='runtime',themeName,scopeId}:{children:React.ReactNode;arm?:'baseline'|'runtime';themeName?:string;scopeId?:string}){
 const {theme,mode}=useTheme();
 const variables=Object.fromEntries(Object.entries(theme).filter(([,value])=>typeof value==='string').map(([key,value])=>['--openui-'+camelToKebab(key),value]));
 return <section data-inline-theme-scope={scopeId} data-arm={arm} data-theme={themeName} data-mode={mode} style={variables as React.CSSProperties}>{children}</section>;
}
export function ScopedThemeProvider({children,arm='runtime',themeName,...props}:any){const id='openui-inline-'+useId().replace(/[^a-zA-Z0-9_-]/g,'');return <ThemeProvider {...props} cssSelector={'[data-inline-theme-scope="'+id+'"]'}><RuntimeThemeBoundary arm={arm} themeName={themeName} scopeId={id}>{children}</RuntimeThemeBoundary></ThemeProvider>;}
export function InlineFixture({scenario='chat',arm='runtime',theme='blue',response,isStreaming=false,size=2,accent:customAccent,mode='light'}:{scenario?:string;arm?:'baseline'|'runtime';theme?:'blue'|'red';response?:string;isStreaming?:boolean;size?:number;accent?:string;mode?:'light'|'dark'}){
 const accent=customAccent??(theme==='red'?'oklch(0.55 0.2 25 / 1)':'oklch(0.55 0.2 260 / 1)');
 return <ArmContext.Provider value={arm}><ScopedThemeProvider mode={mode} arm={arm} themeName={theme} lightTheme={{interactiveAccentDefault:accent}}><Renderer response={response??(scenario==='expanded'?makeExpandedResponse(size):makeResponse(scenario,size))} isStreaming={isStreaming} library={runtimeLibrary}/></ScopedThemeProvider></ArmContext.Provider>;
}

export function Fixture(props:any){return props.arm==='baseline'?<OriginalFixture {...props}/>:<InlineFixture {...props}/>;}
export function ThemeCases(){return <ArmContext.Provider value="runtime"><ScopedThemeProvider themeName="outer-red" lightTheme={{interactiveAccentDefault:'oklch(0.55 0.2 25 / 1)'}}><RuntimeButton data-nested-outer>Outer red</RuntimeButton><ScopedThemeProvider themeName="inner-dark-green" mode="dark" darkTheme={{interactiveAccentDefault:'oklch(0.6 0.18 150 / 1)'}}><RuntimeButton data-nested-inner>Inner dark green</RuntimeButton></ScopedThemeProvider></ScopedThemeProvider><ScopedThemeProvider themeName="standalone-dark" mode="dark"><RuntimeButton data-standalone-dark>Dark default</RuntimeButton></ScopedThemeProvider></ArmContext.Provider>;}

