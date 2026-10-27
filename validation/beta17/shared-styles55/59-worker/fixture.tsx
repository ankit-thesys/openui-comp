import React from 'react';
import {createRoot} from 'react-dom/client';
import {css} from 'goober';
const params=new URLSearchParams(location.search);
const consumerRule='box-sizing: content-box;';
const earlyClass=params.get('consumer')==='goober-before'?css(consumerRule):'';
const ui=await import('@openuidev/react-components');
const lateClass=params.get('consumer')==='goober-after'?css(consumerRule):'';
window.afterImportHost();
const {Buttons,Button,FormControl,Hint,TagBlock,Tag,ThemeProvider}=ui;
const root=createRoot(document.querySelector('#app'));
let clickCount=0;const refs={};
const stable=['openui-buttons','openui-form-control','openui-tag-block'];
window.renderCase=(config={})=>{
 const c={theme:'none',variant:'horizontal',error:false,disabled:false,inline:false,reverse:false,...config};
 const extra={width:173,padding:11,border:'5px solid rgb(10, 20, 30)',...(c.inline?{boxSizing:'content-box'}:{})};
 const className=['custom',earlyClass,lateClass].join(' ');
 const nodes=[<Buttons key="buttons" ref={e=>refs.buttons=e} style={extra} className={className} variant={c.variant}><Button id="action" disabled={c.disabled} onClick={()=>clickCount++}>Action</Button><Button disabled>Disabled</Button><span className="plain-child" style={{width:23,padding:3,border:'2px solid'}}>Child</span></Buttons>,<FormControl key="form" ref={e=>refs.form=e} style={extra} className={className} hasError={c.error}><Hint>Hint</Hint><span className="plain-child" style={{width:23,padding:3,border:'2px solid'}}>Child</span></FormControl>,<TagBlock key="tags" ref={e=>refs.tags=e} styles={extra} className={className}><Tag text="Alpha"/><Tag text="Second longer tag"/></TagBlock>];
 let view=<>{c.reverse?[...nodes].reverse():nodes}</>;
 if(c.theme==='light'||c.theme==='dark')view=<ThemeProvider mode={c.theme}>{view}</ThemeProvider>;
 if(c.theme==='nested')view=<ThemeProvider mode="dark"><ThemeProvider mode="light" lightTheme={{spaceM:'19px',spaceS:'17px'}}>{view}</ThemeProvider></ThemeProvider>;
 root.render(view);
};
window.tokens=(scope,value)=>{
 for(const el of [document.documentElement,document.querySelector('#app')])for(const token of ['--openui-space-m','--openui-space-s'])el.style.removeProperty(token);
 if(value!=='remove')for(const token of ['--openui-space-m','--openui-space-s'])(scope==='root'?document.documentElement:document.querySelector('#app')).style.setProperty(token,value);
};
const properties=['boxSizing','display','width','height','padding','borderWidth','borderStyle','borderColor','gap','flexDirection','flexWrap','maxWidth','font','color','backgroundColor','cursor','outline','opacity'];
function readEl(el){const s=getComputedStyle(el);const r=el.getBoundingClientRect();return{tag:el.tagName,text:el.textContent,role:el.getAttribute('role'),disabled:el.hasAttribute('disabled'),error:el.classList.contains('openui-hint-error'),styles:Object.fromEntries(properties.map(p=>[p,s[p]])),geometry:[r.width,r.height]};}
window.capture=()=>({roots:stable.map(s=>{const el=document.querySelector('#app .'+s);return{root:readEl(el),children:[...el.querySelectorAll('*')].map(readEl)}}),hosts:[...document.querySelectorAll('#host *')].map(readEl),refs:stable.map((s,i)=>refs[['buttons','form','tags'][i]]===document.querySelector('#app .'+s)),clickCount});
window.unmountCase=()=>root.render(null);
window.renderCase();window.ready=true;
