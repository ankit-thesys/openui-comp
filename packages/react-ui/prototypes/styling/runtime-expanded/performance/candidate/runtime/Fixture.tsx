import React,{useId} from 'react';
import{makeExpandedResponse}from './workloads';
export{makeExpandedResponse}from './workloads';
import {RuntimeBoundary}from './Boundary';
export {RuntimeBoundary,RuntimeChatBoundary,RuntimeShellBoundary,chatUnits}from './Boundary';
import {Fixture as OriginalFixture} from './OriginalFixture';
import descriptors from './descriptors.json';
import inputMetadata from './metadata/Input.json';
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
export const RuntimeInput=ownedComponent(Input,'Input',descriptors.Input,inputMetadata);
function decorate(element:any,className:string,card=false):any{
 if(!React.isValidElement(element))return element;
 if(card)return React.cloneElement(element as any,{},React.Children.map((element.props as any).children,child=>decorate(child,className)));
 return React.cloneElement(element as any,{className:[(element.props as any).className,className].filter(Boolean).join(' ')});
}
export const runtimeLibrary=openuiChatLibrary;
export function RuntimeThemeBoundary({children,arm='runtime',themeName,scopeId}:{children:React.ReactNode;arm?:'baseline'|'runtime';themeName?:string;scopeId?:string}){
 const {theme,mode}=useTheme();
 const variables=Object.fromEntries(Object.entries(theme).filter(([,value])=>typeof value==='string').map(([key,value])=>['--openui-'+camelToKebab(key),value]));
 return <section data-inline-theme-scope={scopeId} data-arm={arm} data-theme={themeName} data-mode={mode} style={variables as React.CSSProperties}>{children}</section>;
}
export function ScopedThemeProvider({children,arm='runtime',themeName,...props}:any){const id='openui-inline-'+useId().replace(/[^a-zA-Z0-9_-]/g,'');return <ThemeProvider {...props} cssSelector={'[data-inline-theme-scope="'+id+'"]'}><RuntimeThemeBoundary arm={arm} themeName={themeName} scopeId={id}>{children}</RuntimeThemeBoundary></ThemeProvider>;}
export function InlineFixture({scenario='chat',arm='runtime',theme='blue',response,isStreaming=false,size=2,accent:customAccent,mode='light'}:{scenario?:string;arm?:'baseline'|'runtime';theme?:'blue'|'red';response?:string;isStreaming?:boolean;size?:number;accent?:string;mode?:'light'|'dark'}){
 const accent=customAccent??(theme==='red'?'oklch(0.55 0.2 25 / 1)':'oklch(0.55 0.2 260 / 1)');
 return <ArmContext.Provider value={arm}><ScopedThemeProvider mode={mode} arm={arm} themeName={theme} lightTheme={{interactiveAccentDefault:accent}}><RuntimeBoundary units={responseUnits(response??(scenario==='expanded'?makeExpandedResponse(size):makeResponse(scenario,size)))}><Renderer response={response??(scenario==='expanded'?makeExpandedResponse(size):makeResponse(scenario,size))} isStreaming={isStreaming} library={runtimeLibrary}/></RuntimeBoundary></ScopedThemeProvider></ArmContext.Provider>;
}

export function Fixture(props:any){return props.arm==='baseline'?<OriginalFixture {...props}/>:<InlineFixture {...props}/>;}
export function ThemeCases(){return <ArmContext.Provider value="runtime"><ScopedThemeProvider themeName="outer-red" lightTheme={{interactiveAccentDefault:'oklch(0.55 0.2 25 / 1)'}}><RuntimeButton data-nested-outer>Outer red</RuntimeButton><ScopedThemeProvider themeName="inner-dark-green" mode="dark" darkTheme={{interactiveAccentDefault:'oklch(0.6 0.18 150 / 1)'}}><RuntimeButton data-nested-inner>Inner dark green</RuntimeButton></ScopedThemeProvider></ScopedThemeProvider><ScopedThemeProvider themeName="standalone-dark" mode="dark"><RuntimeButton data-standalone-dark>Dark default</RuntimeButton></ScopedThemeProvider></ArmContext.Provider>;}

function responseUnits(response:string):Unit[]{const map:Record<string,string>={Form:'FormControl',Col:'Table',Series:'BarChart',TextContent:'TextContent',CheckBoxItem:'CheckBoxGroup',SwitchItem:'SwitchGroup',RadioItem:'RadioGroup',SelectItem:'Select',TabItem:'Tabs',AccordionItem:'Accordion'};return [...new Set([...response.matchAll(/\b([A-Z][A-Za-z0-9_]*)\(/g)].map(m=>map[m[1]]||m[1]).filter(name=>name in descriptors))] as Unit[];}
