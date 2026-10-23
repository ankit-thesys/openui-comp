import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
export const probeRoot='/private/tmp/openui-runtime-probe';
export const repo='/Users/ankitdas/thesys/openui-styling-prototype';
export const previous=repo+'/packages/react-ui/prototypes/styling';
const require=createRequire(previous+'/real/package.json');
const sass=require('sass');
const postcss=require(previous+'/node_modules/postcss');
export const build=require(previous+'/node_modules/esbuild').build;
export const units={
 Card:{roots:['openui-card'],files:['Card/card.scss']},
 Button:{roots:['openui-button-base'],files:['Button/button.scss']},
 Input:{roots:['openui-input'],files:['Input/input.scss']},
 CardHeader:{roots:['openui-header'],files:['CardHeader/cardHeader.scss']},
 Buttons:{roots:['openui-buttons'],files:['Buttons/buttons.scss']},
 FormControl:{roots:['openui-form-control'],files:['FormControl/formControl.scss','FormControl/Hint/hint.scss','Label/label.scss']},
 TextContent:{roots:[],files:['TextContentWrapper/textContentWrapper.scss','MarkDownRenderer/markDownRenderer.scss']},
 Table:{roots:[],files:['Table/table.scss']},
 BarChart:{roots:['openui-bar-chart-container'],files:['Charts/BarChart/barChart.scss','Charts/shared/core/DefaultLegend/defaultLegend.scss','Charts/shared/core/StackedLegend/stackedLegend.scss','Charts/shared/cartesian/ScrollButtonsHorizontal/scrollButtonsHorizontal.scss','Charts/shared/cartesian/ScrollButtonsVertical/scrollButtonsVertical.scss','Charts/shared/core/PortalTooltip/portalTooltip.scss']},
};
export async function prepareRuntime(){
 const themeBuild=await build({...buildOptions,stdin:{contents:`export {defaultLightTheme} from '${repo}/packages/react-ui/src/components/ThemeProvider/defaultTheme';export {camelToKebab} from '${repo}/packages/react-ui/src/components/ThemeProvider/utils';`,resolveDir:probeRoot,loader:'ts'},platform:'node',format:'esm',write:false,sourcemap:false});
 const {defaultLightTheme,camelToKebab}=await import('data:text/javascript;base64,'+Buffer.from(themeBuild.outputFiles[0].text).toString('base64'));
 const defaults=Object.fromEntries(Object.entries(defaultLightTheme).filter(([,v])=>typeof v==='string').map(([k,v])=>['--openui-'+camelToKebab(k),v]));
 function fallbacks(value,stack=[]){return value.replace(/var\((--openui-[a-z0-9-]+)\)/g,(all,key)=>defaults[key]&&!stack.includes(key)?'var('+key+', '+fallbacks(defaults[key],[...stack,key])+')':all);}
 const descriptors={};let baseline='';const provenance={};
 for(const [name,unit] of Object.entries(units)){
  let css='';for(const file of unit.files)css+=sass.compile(repo+'/packages/react-ui/src/components/'+file,{style:'compressed',logger:{warn(){},debug(){}}}).css;
  baseline+=css;let serial=0;const tree=postcss.parse(css);
  const scope=selector=>postcss.list.comma(selector).map(s=>{s=s.trim();return unit.roots.some(r=>s.startsWith('.'+r)&&(['Button','Input','Card','Buttons'].includes(name)||!s.slice(r.length+1,r.length+2).match(/[a-zA-Z0-9_-]/)))?'&'+s:'& '+s;}).join(',');
  function object(node,keyframes=false){
   const out={};for(const n of node.nodes||[]){
    if(n.type==='decl'){const key=n.prop+'/*d'+serial+++'*/';out[key]=fallbacks(n.value)+(n.important?'!important':'');}
    else if(n.type==='rule'){const selector=keyframes?n.selector:scope(n.selector);out[selector+'/*r'+serial+++'*/']=object(n,keyframes);}
    else if(n.type==='atrule'&&n.nodes){const isKeys=n.name.endsWith('keyframes');out['@'+n.name+' '+n.params+'/*a'+serial+++'*/']=object(n,keyframes||isKeys);}
    else if(n.type==='atrule')throw new Error('Unsupported non-block at-rule '+n.toString());
   }return out;
  }
  descriptors[name]=object(tree);provenance[name]={sourceFiles:unit.files,rawCssBytes:Buffer.byteLength(css),rules:serial};
 }
 await fs.mkdir(probeRoot+'/runtime',{recursive:true});
 await fs.writeFile(probeRoot+'/runtime/descriptors.json',JSON.stringify(descriptors));
 await fs.mkdir(probeRoot+'/runtime/descriptors',{recursive:true});
 for(const [name,value] of Object.entries(descriptors))await fs.writeFile(probeRoot+'/runtime/descriptors/'+name+'.json',JSON.stringify(value));
 await fs.writeFile(probeRoot+'/runtime/baseline.css',baseline);
 await fs.writeFile(probeRoot+'/runtime/provenance.json',JSON.stringify({method:'One-time spike generation from selected production component Sass to per-component scoped Goober OBJECT descriptors. Runtime imports only objects; no Sass/compiler or aggregate stylesheet. Comments keep duplicate declarations and selectors in insertion order. Per-declaration var() fallback values come from actual defaultLightTheme, so standalone components respect inherited tokens and need no theme setup.',units:provenance},null,2));
 return {descriptors,provenance};
}
export const alias=Object.fromEntries(['react-lang','react-headless','lang-core','observability','devtools'].map(p=>['@openuidev/'+p,repo+'/packages/'+p+'/src/index.ts']));
Object.assign(alias,{react:previous+'/node_modules/react','react-dom':previous+'/node_modules/react-dom'});
export const buildOptions={bundle:true,minify:false,sourcemap:true,alias,nodePaths:[previous+'/real/node_modules',previous+'/node_modules'],define:{'process.env.NODE_ENV':'"production"'},jsx:'automatic',logLevel:'warning'};
if(process.argv[1]===new URL(import.meta.url).pathname){await prepareRuntime();console.log('Runtime component descriptors prepared');}
