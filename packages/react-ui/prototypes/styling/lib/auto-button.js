'use client';
// PROTOTYPE library component: consumer only imports Button, with no CSS/registry/provider.
import React,{useState} from 'react';
import {artifacts} from './generated-styles.js';
const h=React.createElement;
export function Button({late=false,accent,children='Goober button'}){
 const [count,setCount]=useState(0);
 const bundle=artifacts.unlayered;
 const sheet=late?bundle.late:bundle;
 const className=late?sheet.className:bundle.classes.button;
 return h(React.Fragment,null,
  h('style',{href:sheet.href,precedence:'openui'},sheet.css),
  h('button',{'data-testid':late?'next-late-button':'next-button','data-openui-style':'','data-source':'lib/auto-button.js',className,style:accent?{'--openui-accent':accent}:undefined,onClick:()=>setCount(c=>c+1)},children+' '+count));
}
