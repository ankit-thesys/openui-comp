import React from 'react';import{renderToString}from'react-dom/server';import{css}from'goober';
import{Button}from'/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/src/components/Button';
import descriptor from '/private/tmp/openui-runtime-detailed/runtime/descriptors/Button.json';
function compile(object:any){const target={data:''};const className=css.call({target},object);return{className,text:target.data};}
import rootMetadata from './button-root-metadata.json';
const props=new Set(rootMetadata.rootProperties);
export function render(query:Record<string,string>){const{framework='plain',order='host-first',candidate='rollback-type',type='none',inForm='no',cursor='none',hostSize='no'}=query;
 const layered=candidate!=='unlayered';const base=compile(layered?{'@layer components':descriptor}:descriptor);
 const guardObject=Object.fromEntries([...props].map(key=>[key,'revert-layer']));
 const guard=candidate==='rollback-class'?compile({'&':guardObject}):candidate==='rollback-type'?compile({'html button:where(&)':guardObject}):candidate==='rollback-type-disabled'?compile({'html button:where(&)':{...guardObject,'&:disabled':{cursor:'revert-layer'}}}):null;
 const text=candidate==='host-only'?'':(layered?'@layer theme, base, components, utilities;':'')+base.text+(guard?.text||'');
 const OwnedButton=({override=false,disabled=false}:{override?:boolean;disabled?:boolean})=><Button data-probe={override?'override':disabled?'disabled':'default'} disabled={disabled} {...(type==='none'?{}:{type:type as any})} className={[base.className,guard?.className,disabled&&cursor!=='none'?cursor:'',override?'consumer-override rounded-none border-0 bg-red-500 p-8 text-white hover:bg-green-500':''].filter(Boolean).join(' ')}>{override?'Override':disabled?'Disabled':'Default'}</Button>;
 let html='<!doctype html>'+renderToString(<html><head><meta charSet="utf-8"/>{hostSize==='yes'&&<style data-host-size="true">{'button{width:180px;height:60px}'}</style>}{order==='host-first'&&<link rel="stylesheet" href={'/framework/'+framework+'.css'}/>}</head><body><style href={'cascade-research:'+candidate+':'+base.className+':'+guard?.className} precedence="openui">{text}</style>{inForm==='yes'?<form><OwnedButton/><OwnedButton override/><OwnedButton disabled/></form>:<><OwnedButton/><OwnedButton override/><OwnedButton disabled/></>}{order==='host-late'&&<link rel="stylesheet" href={'/framework/'+framework+'.css'}/>}</body></html>);
 const link=html.match(/<link[^>]+>/)?.[0];if(link){html=html.replace(link,'');html=order==='host-first'?html.replace('<head>','<head>'+link):html.replace('</head>',link+'</head>');}return html;
}
