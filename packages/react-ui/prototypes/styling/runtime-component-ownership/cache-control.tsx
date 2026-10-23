// Diagnostic only: same existing CSS and DOM, one-variable lazy immutable memoization.
import React,{useContext} from 'react';
import {renderToString} from 'react-dom/server';
import {createHash} from 'node:crypto';
import {RuntimeChatBoundary} from '/private/tmp/openui-runtime-expanded-components/runtime/Boundary';
import {ownedStyle} from '/private/tmp/openui-runtime-expanded-components/runtime/adapter';
import descriptors from '/private/tmp/openui-runtime-expanded-components/runtime/boundary-descriptors.json';
import metadata from '/private/tmp/openui-runtime-expanded-components/runtime/boundary-metadata.json';
import {ThemeContext} from '/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/src/components/ThemeProvider';
import {Button} from '/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/src/components/Button';
let compiles=0;
const definitions=Object.entries(descriptors).map(([unit,descriptor])=>{
 let compiled:undefined|{className:string,css:string,href:string};
 return ()=>{if(!compiled){const s=ownedStyle(unit,descriptor,{boundary:true,rows:metadata[unit]});compiled={className:s.className,css:s.css,href:s.href};compiles++}return compiled};
});
function CachedBoundary({children}){
 const theme=useContext(ThemeContext),styles=definitions.map(get=>get()),classes=styles.map(s=>s.className).join(' ');
 return <>{styles.map(s=><style key={s.href} href={s.href} precedence="openui">{s.css}</style>)}<ThemeContext.Provider value={{...theme,portalThemeClassName:[theme.portalThemeClassName,classes].filter(Boolean).join(' ')}}><div data-runtime-boundary="true" className={classes} style={{display:'contents'}}>{children}</div></ThemeContext.Provider></>;
}
const rows=[];let original='',cached='';
for(let i=-2;i<12;i++)for(const arm of i%2?['original','cached']:['cached','original']){const C=arm==='original'?RuntimeChatBoundary:CachedBoundary;const start=performance.now();const html=renderToString(<C><Button>Only button</Button></C>);const elapsed=performance.now()-start;if(arm==='original')original=html;else cached=html;rows.push({warmup:i<0,arm,elapsed,htmlBytes:Buffer.byteLength(html),sha256:createHash('sha256').update(html).digest('hex')})}
const result={scope:'Same exact existing CSS/DOM; isolate closure-local immutable caching only. Neither full SSR benchmark nor unused-CSS fix.',rows,compiledDefinitions:compiles,checks:{identicalHtml:original===cached,compiledOncePerDefinition:compiles===47}};
console.log(JSON.stringify(result,null,2));if(Object.values(result.checks).some(x=>!x))process.exitCode=1;
