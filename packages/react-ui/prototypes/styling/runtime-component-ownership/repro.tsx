import React from 'react';
import {renderToString} from 'react-dom/server';
import {RuntimeChatBoundary} from '/private/tmp/openui-runtime-expanded-components/runtime/Boundary';
import {Button} from '/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/src/components/Button';
import {performance} from 'node:perf_hooks';
const times=[]; let html='';
for(let i=0;i<6;i++){const start=performance.now();html=renderToString(<RuntimeChatBoundary><Button>Only button</Button></RuntimeChatBoundary>);times.push(performance.now()-start)}
const resourceKeys=[...html.matchAll(/openui-expanded-v1:([^: ]+):boundary:[^" ]+/g)].map(m=>m[1]);
const result={case:'Actual existing RuntimeChatBoundary with one actual Button; unnecessary chart/shell resource emission',resources:[...new Set(resourceKeys)],htmlBytes:Buffer.byteLength(html),renderMs:times,checks:{noChartStyles:!resourceKeys.some(x=>/Chart/.test(x)),noChatShellStyles:!resourceKeys.some(x=>x.startsWith('Shell'))}};
console.log(JSON.stringify(result,null,2));
if(Object.values(result.checks).some(v=>!v)) process.exitCode=1;
