import React from'react';import{renderToString}from'react-dom/server';import{extractCss}from'goober';import{Catalog}from'./catalog';import{LayerContext}from'./runtime/adapter';
export function render({arm='runtime',framework='plain',order='host-first',layered='false',ssr='integrated'}:Record<string,string>){
 extractCss();
 const body=renderToString(<LayerContext.Provider value={layered==='true'}><Catalog arm={arm as any}/></LayerContext.Provider>);
 const css=extractCss();
 const style=ssr==='integrated'&&arm==='runtime'?'<style id="_goober">'+css+'</style>':'';
 const host='<link data-framework="true" rel="stylesheet" href="/frameworks/'+framework+'.css"/>';
 return '<!doctype html><html><head><meta charset="utf-8"/>'+(arm==='baseline'?'<link rel="stylesheet" href="/baseline.css"/>':'')+(order==='host-first'?host+style:style+host)+'</head><body><div id="app">'+body+'</div><script type="module" src="/catalog.js"></script></body></html>';
}
