import {styles as buttonStyles}from'./runtime/styles/Button';(window as any).__getButtonStyle=()=>buttonStyles.get();
import {readStyleCounters}from'./runtime/adapter';(window as any).__readStyleCounters=readStyleCounters;
import React from'react';import{hydrateRoot}from'react-dom/client';import{Catalog}from'./catalog';const p=new URLSearchParams(location.search);hydrateRoot(document.getElementById('app')!,<Catalog arm={p.get('arm') as any||'runtime'}/>);setTimeout(()=>{(window as any).__catalogReady=true},200);
