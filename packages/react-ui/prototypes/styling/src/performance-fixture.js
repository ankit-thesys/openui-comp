import './performance.css';
import React,{useState,useLayoutEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {createComponents} from '../lib/auto-button.js';
import {artifacts} from '../lib/generated-styles.js';
const h=React.createElement,q=new URLSearchParams(location.search);
const bounded=(key,fallback,min,max)=>Math.max(min,Math.min(max,Number(q.get(key))||fallback));
const config={arm:q.get('arm')||'generated',scenario:q.get('scenario')||'chat',framework:q.get('framework')||'plain',count:bounded('count',100,1,500),rate:bounded('rate',60,1,120),seconds:bounded('seconds',10,1,60),runId:q.get('runId')};
const mode=config.framework==='tailwind4'?'layered':'unlayered',bundle=artifacts[mode];
const send=(type,data)=>parent.postMessage({source:'openui-perf',runId:config.runId,type,...data},location.origin);
const link=href=>new Promise((resolve,reject)=>{const e=document.createElement('link');e.rel='stylesheet';e.href=href;e.onload=resolve;e.onerror=()=>reject(Error('Stylesheet failed: '+href));document.head.append(e);});
await link('/performance/'+mode+'.css');await link('/frameworks/'+config.framework+'.css');
const Generated=createComponents(mode,'external').Button;
// Equivalent React button behavior and exact CSS; diagnostic control, NOT existing react-ui.
function StaticButton({children='Goober button',...props}){const [count,setCount]=useState(0);return h(React.Fragment,null,null,h('button',{'data-testid':'next-button','data-openui-style':'','data-source':'static-control',...props,className:bundle.classes.button+' ',onClick:()=>setCount(c=>c+1)},children+' '+count));}
const Button=config.arm==='generated'?Generated:StaticButton;
const samples={updateOpportunity:[],deliveryLag:[],frameGaps:[],inputOpportunity:[],longTasks:[],memory:[]};
let started=false,finished=false,start=0,sent=0,committed=0,renderedSequence=0,timer,frame,finishTimer,flushFrame,pending,rootSetter;
const total=Math.ceil(config.seconds*config.rate),chunk='Revenue increased across the selected regions. ',text=chunk.repeat(total);
const quantile=(a,p)=>a.length?[...a].sort((x,y)=>x-y)[Math.min(a.length-1,Math.floor(a.length*p))]:null;
let longObserver;const longSupported=PerformanceObserver.supportedEntryTypes.includes('longtask');
if(longSupported){longObserver=new PerformanceObserver(list=>{if(started&&!finished)for(const e of list.getEntries())if(e.startTime>=start)samples.longTasks.push({start:e.startTime-start,duration:e.duration});});longObserver.observe({type:'longtask',buffered:false});}
const countRules=list=>Array.from(list).reduce((n,r)=>n+1+(r.cssRules?countRules(r.cssRules):0),0);
const rules=()=>{let n=0;for(const s of document.styleSheets)try{n+=countRules(s.cssRules);}catch{}return n;};
const initialRules=rules(),initialSheets=document.styleSheets.length;let lastFrame;
const memory=()=>performance.memory?performance.memory.usedJSHeapSize:null;
function summary(status){return {config,status,scope:'Synthetic React styling comparison; no OpenUI parser, real components or server load',durationMs:performance.now()-start,scheduledChunks:total,receivedChunks:sent,commits:committed,renderedSequence,finalContentMatches:renderedSequence===sent&&document.querySelector('.transcript')?.textContent===text.slice(0,sent*chunk.length)&&document.querySelectorAll('.tile').length===config.count,updateOpportunityP95Ms:quantile(samples.updateOpportunity,.95),deliveryLagP95Ms:quantile(samples.deliveryLag,.95),frameGapP95Ms:quantile(samples.frameGaps,.95),inputOpportunityP95Ms:quantile(samples.inputOpportunity,.95),inputSamples:samples.inputOpportunity.length,longTaskCount:longSupported?samples.longTasks.length:null,longTaskMs:longSupported?samples.longTasks.reduce((a,x)=>a+x.duration,0):null,rulesBefore:initialRules,rulesAfter:rules(),sheetsBefore:initialSheets,sheetsAfter:document.styleSheets.length,heapSamples:samples.memory,samples,visibility:document.visibilityState,userAgent:navigator.userAgent};}
function finish(status='complete'){if(finished)return;finished=true;clearTimeout(timer);clearTimeout(finishTimer);cancelAnimationFrame(frame);cancelAnimationFrame(flushFrame);longObserver?.disconnect();send('result',{result:summary(status)});document.querySelector('#progress').textContent=status==='complete'?'Finished — explore the controls or start another run':'Stopped';}
window.addEventListener('pagehide',()=>finish('aborted'));
document.addEventListener('visibilitychange',()=>{if(started&&!finished&&document.hidden)finish('invalid-hidden-tab');});
for(const name of ['input','click'])document.querySelector('.interaction').addEventListener(name,()=>{if(!started||finished)return;const at=performance.now();requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!finished)samples.inputOpportunity.push(performance.now()-at);}));});
function Scene({sequence}){
 const number=sequence.n;
 useLayoutEffect(()=>{renderedSequence=number;if(!started||finished||!number)return;committed++;requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!finished)samples.updateOpportunity.push(performance.now()-sequence.at);if(number===total&&!finished)finishTimer=setTimeout(()=>finish(),60);}));},[sequence]);
 const tiles=Array.from({length:config.count},(_,i)=>h('section',{className:'tile',key:i},h('strong',null,config.scenario==='chat'?'Response '+(i+1):'Metric '+(i+1)),h('p',null,'Value '+(i+number)),h(Button,null,'Explore')));
 const rows=config.scenario==='dashboard'?h('div',{className:'fixture-table'},h('table',null,h('tbody',null,Array.from({length:config.count*2},(_,i)=>h('tr',{key:i},h('td',null,'Region '+i),h('td',null,(i*37+number)%10000),h('td',null,'Active')))))):null;
 const chart=config.scenario==='dashboard'?h('svg',{className:'chart',viewBox:'0 0 1000 160',role:'img','aria-label':'Synthetic streamed chart'},h('polyline',{fill:'none',stroke:'#3347b0',strokeWidth:2,points:Array.from({length:config.count*2},(_,i)=>`${i/(config.count*2-1)*1000},${80+Math.sin((i+number)/8)*60}`).join(' ')})):null;
 return h(React.Fragment,null,h('p',null,config.scenario==='chat'?'Synthetic chat stream':'Synthetic dashboard stream'),h('div',{className:'transcript'},text.slice(0,number*chunk.length)),chart,rows,h('div',{className:'tiles'},tiles));
}
function App(){const [sequence,setSequence]=useState({n:0,at:0});rootSetter=setSequence;return h(Scene,{sequence});}
createRoot(document.querySelector('#fixture')).render(h(App));
function tick(){if(finished)return;const now=performance.now();sent++;samples.deliveryLag.push(Math.max(0,now-(start+sent*1000/config.rate)));pending={n:sent,at:now};if(!flushFrame)flushFrame=requestAnimationFrame(()=>{flushFrame=0;rootSetter(pending);});if(sent%config.rate===0){samples.memory.push({atMs:now-start,bytes:memory()});send('progress',{received:sent,total});document.querySelector('#progress').textContent=`${sent}/${total} chunks — type or scroll now`;}
 if(sent<total)timer=setTimeout(tick,Math.max(0,start+(sent+1)*1000/config.rate-performance.now()));else finishTimer=setTimeout(()=>finish('timeout-final-render'),5000);
}
function frames(at){if(finished)return;if(lastFrame!==undefined)samples.frameGaps.push(at-lastFrame);lastFrame=at;frame=requestAnimationFrame(frames);}
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==parent||event.data?.source!=='openui-perf-parent')return;if(event.data.type==='stop')finish('stopped');if(event.data.type==='start'&&!started){started=true;start=performance.now();samples.memory.push({atMs:0,bytes:memory()});frame=requestAnimationFrame(frames);timer=setTimeout(tick,1000/config.rate);}});
// Let the initial React mount settle before starting the streaming clock.
await new Promise(r=>setTimeout(r,300));send('ready',{config});
