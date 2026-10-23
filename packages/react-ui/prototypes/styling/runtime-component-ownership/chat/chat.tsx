import React,{useEffect,useId,useState} from 'react';
import {AgentInterface as BaselineShell} from '/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/src/components/AgentInterface/AgentInterface';
import {AgentInterface as OwnedShell} from './source/src/components/AgentInterface/AgentInterface';
import {openuiChatLibrary as baselineLibrary} from '/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/src/genui-lib/openuiChatLibrary';
import {openuiChatLibrary as ownedLibrary} from '/private/tmp/openui-runtime-owned-components/source/src/genui-lib/openuiChatLibrary';
import {ThemeProvider as BaselineProvider,useTheme as useBaselineTheme} from '/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/src/components/ThemeProvider';
import {ThemeProvider as OwnedProvider,useTheme as useOwnedTheme} from '/private/tmp/openui-runtime-owned-components/source/src/components/ThemeProvider';
import {camelToKebab} from '/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/src/components/ThemeProvider/utils';
import {useThread,useThreadList,fetchLLM,agUIAdapter} from '@openuidev/react-headless';
import {ArmContext} from '/private/tmp/openui-runtime-owned-components/runtime/adapter';
export function FullChat({scenario='chat',size=2,mode='light',arm='runtime',accent,onReady}:{scenario?:string,size?:number,mode?:'light'|'dark',arm?:'baseline'|'runtime',accent?:string,onReady?:(api:any)=>void}){
 const [selectedMode,setSelectedMode]=useState(mode);useEffect(()=>setSelectedMode(mode),[mode]);
 const llm=React.useMemo(()=>fetchLLM({url:'/api/chat?'+new URLSearchParams({scenario,size:String(size)}),streamAdapter:agUIAdapter()}),[scenario,size]);
 const storage=React.useMemo(()=>{let threads:any[]=[];return {thread:{listThreads:async()=>({threads}),createThread:async(first:any)=>{await new Promise(r=>setTimeout(r,40));const t={id:crypto.randomUUID(),title:first.content,createdAt:Date.now()};threads.push(t);return t;},getMessages:async(id:string)=>(await fetch('/api/history?id='+id)).json(),updateThread:async(t:any)=>t,deleteThread:async(id:string)=>{threads=threads.filter(t=>t.id!==id);}}};},[]);
 const scope='openui-owned-chat-'+useId().replace(/[^a-zA-Z0-9_-]/g,'');
 const Shell=arm==='baseline'?BaselineShell:OwnedShell,Provider=arm==='baseline'?BaselineProvider:OwnedProvider;
 return <ArmContext.Provider value={arm}><Provider mode={selectedMode} lightTheme={accent?{interactiveAccentDefault:accent}:undefined} darkTheme={accent?{interactiveAccentDefault:accent}:undefined} cssSelector={'[data-chat-theme="'+scope+'"]'}><Boundary scope={scope} arm={arm}><Shell disableThemeProvider storage={storage} llm={llm} componentLibrary={arm==='baseline'?baselineLibrary:ownedLibrary} agentName="OpenUI component-owned runtime" scrollVariant="always"><Shell.Welcome title="OpenUI runtime conversation" description="Actual production welcome and composer"/><Shell.Sidebar><Shell.SidebarHeader/><Shell.NewChatButton/><Shell.ThreadList/><Shell.ThemeModeToggle mode={selectedMode} onModeChange={setSelectedMode}/></Shell.Sidebar><Probe arm={arm} onReady={onReady}/></Shell></Boundary></Provider></ArmContext.Provider>;
}
function useSelectedTheme(arm:string){const baseline=useBaselineTheme(),owned=useOwnedTheme();return arm==='baseline'?baseline:owned;}
function Boundary({children,scope,arm}:{children:React.ReactNode,scope:string,arm:string}){const {theme,mode}=useSelectedTheme(arm);const vars=Object.fromEntries(Object.entries(theme).filter(([,v])=>typeof v==='string').map(([k,v])=>['--openui-'+camelToKebab(k),v]));return <section data-chat-theme={scope} data-chat-mode={mode} style={{...vars,height:'100%'} as React.CSSProperties}>{children}</section>;}
function Probe({arm,onReady}:{arm:string,onReady?: (api:any)=>void}){const thread=useThread(),list=useThreadList(),theme=useSelectedTheme(arm);useEffect(()=>{onReady?.({...thread,...list,themeMode:theme.mode,accent:theme.theme.interactiveAccentDefault});});return null;}
