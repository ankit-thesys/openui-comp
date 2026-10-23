import React from 'react';
import {createRoot,hydrateRoot} from 'react-dom/client';
import {Button} from '../lib/auto-button.js';
const node=React.createElement(Button);
const root=document.getElementById('root');
window.__hydrationErrors=[];
if(window.__AUTO_SSR)hydrateRoot(root,node,{onRecoverableError:e=>window.__hydrationErrors.push(e.message)});
else createRoot(root).render(node);
