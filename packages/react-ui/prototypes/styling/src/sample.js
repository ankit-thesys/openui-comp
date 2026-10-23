import React,{useState,useEffect} from 'react';
import {createPortal} from 'react-dom';
const h=React.createElement;
export function Sample({adapter,policy='default',framework='none',theme='light'}){
 const [open,setOpen]=useState(false);const [count,setCount]=useState(0);
 const classes=adapter.getClasses(policy,framework);
 const vars=theme==='dark'?{'--openui-accent':'#a3b5ff','--openui-fg':'#172344','--openui-hover':'#c4cfff','--openui-surface':'#202b45','--openui-text':'#edf2ff','--openui-border':'#485571'}:{};
 const mark=name=>({'data-openui-style':'','data-openui-component':name,'data-source':adapter.metadata.source});
 const override=framework.startsWith('tailwind')?'bg-red-500 text-white p-8 rounded-none border-0 hover:bg-green-500':framework==='bootstrap'?'btn btn-warning':'consumer-override';
 useEffect(()=>{window.__fixture={engine:adapter.metadata.engine,policy,framework,theme,metadata:adapter.metadata};window.__rendered=true;},[count]);
 return h('div',{style:{...vars,padding:18,fontFamily:'system-ui',background:theme==='dark'?'#121b2d':'#f7f8fc',color:theme==='dark'?'#edf2ff':'#172344',minHeight:'100vh'}},
  h('p',{style:{margin:'0 0 12px',fontSize:12}},'Representative controls · no application import of component CSS'),
  h('div',{style:{display:'flex',gap:12,alignItems:'start',flexWrap:'wrap'}},
   h('button',{className:classes.button,'data-testid':'baseline',...mark('Button'),onClick:()=>setCount(c=>c+1)},'Library button'),
   h('button',{className:classes.button+' '+override,'data-testid':'override',...mark('Button')},'Consumer override')),
  h('div',{style:{marginTop:16}},h('button',{className:classes.button,'data-testid':'portal-trigger',...mark('Button'),onClick:()=>setOpen(x=>!x)},'Open themed portal')),
  h('div',{className:classes.panel,style:{marginTop:16},'data-testid':'chart-panel',...mark('AnimatedBarChart')},
   h('strong',null,'Chart update ',count),
   h('svg',{viewBox:'0 0 260 100',width:'100%',height:100,'aria-label':'Representative animated chart'},[35,65,45,80].map((v,i)=>h('rect',{key:i,className:classes.bar,x:i*62+10,y:100-((v+count*7)%85+10),width:38,height:(v+count*7)%85+10,'data-testid':i===0?'bar':undefined,...mark('ChartBar')}))),
   h('button',{className:classes.button,'data-testid':'update',...mark('Button'),onClick:()=>setCount(c=>c+1)},'Update data')),
  h('p',{style:{fontSize:11,marginTop:16}},'Host control below must not inherit library styles'),
  h('button',{'data-testid':'host'},'Plain host button'),
  open&&typeof document!=='undefined'?createPortal(h('div',{style:{...vars,position:'fixed',top:140,left:20,right:20,zIndex:50},...mark('PortalRoot')},h('div',{className:classes.panel,'data-testid':'portal',...mark('PortalPanel')},h('strong',null,'Themed portal'),h('p',null,'Tokens are forwarded to this portal scope.'),h('button',{className:classes.button,...mark('Button'),onClick:()=>setOpen(false)},'Close'))),document.body):null
 );
}
