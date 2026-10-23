import React from 'react';import {createRoot,hydrateRoot} from 'react-dom/client';import {RuntimeButton} from './runtime/Button';
const q=new URLSearchParams(location.search);const el=document.getElementById('single')!;
const button=<RuntimeButton onClick={()=>{document.documentElement.dataset.clicked='yes'}}>Standalone</RuntimeButton>;
if(q.has('ssr'))hydrateRoot(el,button);else if(!q.has('unused'))createRoot(el).render(button);
(window as any).__standaloneImported=true;
