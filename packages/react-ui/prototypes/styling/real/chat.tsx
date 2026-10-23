import React,{useEffect} from 'react';
import {AgentInterface} from '../../../src/components/AgentInterface/AgentInterface';
import {useThread,useThreadList,fetchLLM,agUIAdapter} from '@openuidev/react-headless';
import {useTheme} from '../../../src/components/ThemeProvider';
import {benchmarkLibrary} from './workloads';
export function FullChat({scenario='chat',size=2,mode='light',onReady}:{scenario?:string,size?:number,mode?:'light'|'dark',onReady?:(api:any)=>void}){
 const llm=React.useMemo(()=>fetchLLM({url:'/api/chat?'+new URLSearchParams({scenario,size:String(size)}),streamAdapter:agUIAdapter()}),[scenario,size]);
 const storage=React.useMemo(()=>{let threads:any[]=[];return {thread:{listThreads:async()=>({threads}),createThread:async(first:any)=>{await new Promise(r=>setTimeout(r,40));const t={id:crypto.randomUUID(),title:first.content,createdAt:Date.now()};threads.push(t);return t;},getMessages:async(id:string)=>(await fetch('/api/history?id='+id)).json(),updateThread:async(t:any)=>t,deleteThread:async(id:string)=>{threads=threads.filter(t=>t.id!==id);}}};},[]);
 return <AgentInterface storage={storage} llm={llm} componentLibrary={benchmarkLibrary} theme={{mode}} agentName="OpenUI integration" scrollVariant="always"><AgentInterface.Sidebar><AgentInterface.SidebarHeader/><AgentInterface.NewChatButton/><AgentInterface.ThreadList/><AgentInterface.ThemeModeToggle/></AgentInterface.Sidebar><Probe onReady={onReady}/></AgentInterface>;
}
function Probe({onReady}:{onReady?: (api:any)=>void}){const thread=useThread(),list=useThreadList(),theme=useTheme();useEffect(()=>{onReady?.({...thread,...list,themeMode:theme.mode});});return null;}
