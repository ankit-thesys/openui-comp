import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {selectorPaths} from './runtime/selector-normalize.mjs';
export const probeRoot=path.dirname(new URL(import.meta.url).pathname);
export const repo='/Users/ankitdas/thesys/openui-styling-prototype';
export const previous=repo+'/packages/react-ui/prototypes/styling';
const require=createRequire(previous+'/real/package.json');
const sass=require('sass');
const postcss=require(previous+'/node_modules/postcss');
const selectorParser=require(previous+'/node_modules/postcss-selector-parser');
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
Object.assign(units,{
 LineChart:{roots:['openui-line-chart-container'],files:['Charts/LineChart/lineChart.scss','Charts/shared/core/DefaultLegend/defaultLegend.scss','Charts/shared/cartesian/ScrollButtonsHorizontal/scrollButtonsHorizontal.scss','Charts/shared/core/PortalTooltip/portalTooltip.scss']},PieChart:{roots:['openui-pie-chart-container'],files:['Charts/PieChart/pieChart.scss','Charts/shared/core/DefaultLegend/defaultLegend.scss','Charts/shared/core/StackedLegend/stackedLegend.scss','Charts/shared/core/PortalTooltip/portalTooltip.scss']},
 IconButton:{roots:['openui-icon-button'],files:['IconButton/iconButton.scss']},TextArea:{roots:['openui-textarea'],files:['TextArea/textArea.scss']},
 CheckBoxGroup:{roots:[],files:['CheckBoxGroup/checkBoxGroup.scss','CheckBoxItem/checkBoxItem.scss']},SwitchGroup:{roots:[],files:['SwitchGroup/switchGroup.scss','SwitchItem/switchItem.scss']},RadioGroup:{roots:[],files:['RadioGroup/radioGroup.scss','RadioItem/radioItem.scss']},
 Select:{roots:[],files:['Select/select.scss']},Tabs:{roots:[],files:['Tabs/tabs.scss']},Accordion:{roots:[],files:['Accordion/accordion.scss']},Separator:{roots:[],files:['Separator/separator.scss']},Modal:{roots:[],files:['Modal/Modal.scss']},Tooltip:{roots:[],files:['TooltipWrapper/tooltipWrapper.scss']},AssistantMessage:{roots:[],files:['OpenUIChat/assistantMessage.scss']},
});
const shellFiles=['agentInterface','sidebar','thread','threadHeader','mobileHeader','threadlist','historyMenu','renameChatDialog','themeModeToggle','welcomeScreen','conversationStarter','workspaceSidebar','resizableSeparator','artifactBrowser','welcomeGlow','_shared/shared','_shared/detailed-view/detailedViewPanel','_shared/detailed-view/detailedViewOverlay','components/composer','components/desktopWelcomeComposer','components/welcomeMascot','components/mascotLoader','components/welcomePrefillChips','components/ambientLoader'];
for(const file of shellFiles)units['Shell'+file.replace(/(^|\/)([a-z])/g,(_,slash,c)=>c.toUpperCase()).replaceAll('/','')]={roots:[],files:['AgentInterface/'+file+'.scss']};
export const shellUnits=Object.keys(units).filter(n=>n.startsWith('Shell')).concat(['Button','Input','TextArea','IconButton','Separator','Tooltip','Modal','AssistantMessage']);
export async function prepareRuntime(){
 const themeBuild=await build({...buildOptions,stdin:{contents:`export {defaultLightTheme} from '${repo}/packages/react-ui/src/components/ThemeProvider/defaultTheme';export {camelToKebab} from '${repo}/packages/react-ui/src/components/ThemeProvider/utils';`,resolveDir:probeRoot,loader:'ts'},platform:'node',format:'esm',write:false,sourcemap:false});
 const {defaultLightTheme,camelToKebab}=await import('data:text/javascript;base64,'+Buffer.from(themeBuild.outputFiles[0].text).toString('base64'));
 const defaults=Object.fromEntries(Object.entries(defaultLightTheme).filter(([,v])=>typeof v==='string').map(([k,v])=>['--openui-'+camelToKebab(k),v]));
 function fallbacks(value,stack=[]){return value.replace(/var\((--openui-[a-z0-9-]+)\)/g,(all,key)=>defaults[key]&&!stack.includes(key)?'var('+key+', '+fallbacks(defaults[key],[...stack,key])+')':all);}
 const descriptors={},boundaryDescriptors={},metadata={},boundaryMetadata={};let baseline='';const provenance={};
 for(const [name,unit] of Object.entries(units)){
  let css='';for(const file of unit.files)css+=sass.compile(repo+'/packages/react-ui/src/components/'+file,{style:'compressed',logger:{warn(){},debug(){}}}).css;
  baseline+=css;let serial=0;const tree=postcss.parse(css);
  function object(node,keyframes=false,boundaryMode='none'){
   const out={};for(const n of node.nodes||[]){
    if(n.type==='decl'){const key=n.prop+'/*d'+serial+++'*/';out[key]=fallbacks(n.value)+(n.important?'!important':'');}
    else if(n.type==='rule'){
     if(keyframes){out[n.selector+'/*r'+serial+++'*/']=object(n,true,boundaryMode);continue;}
     for(const {steps,zeroed} of selectorPaths(n.selector,boundaryMode==='self'?['*']:boundaryMode==='desc'?[]:unit.roots,['Button','Input','Card','Buttons','IconButton','TextArea'].includes(name))){
      if(!zeroed)throw new Error('Unsupported selector without source class in '+name+': '+n.selector);
      let value=object(n,false,boundaryMode);for(const step of [...steps].reverse())value={[step]:value};
      out['&/*r'+serial+++'*/']=value;
     }
    }
    else if(n.type==='atrule'&&n.nodes){const isKeys=n.name.endsWith('keyframes');out['@'+n.name+' '+n.params+'/*a'+serial+++'*/']=object(n,keyframes||isKeys,boundaryMode);}
    else if(n.type==='atrule')throw new Error('Unsupported non-block at-rule '+n.toString());
   }return out;
  }
  descriptors[name]=object(tree);
  const desc=object(tree,false,'desc'),self=object(tree,false,'self');boundaryDescriptors[name]={...desc,...self};
  function rows(mode){const out=[];tree.walkRules(rule=>{
   const ancestry=[];for(let p=rule.parent;p&&p.type!=='root';p=p.parent){if(p.type==='atrule'&&p.name.endsWith('keyframes'))return;if(p.type==='atrule')ancestry.unshift('@'+p.name+' '+p.params);}
   const properties={};for(const d of rule.nodes||[])if(d.type==='decl')properties[d.prop]=fallbacks(d.value);
   if(!Object.keys(properties).length)return;
   for(const selector of postcss.list.comma(rule.selector)){let root=false;selectorParser(ast=>ast.each(sel=>{const first=sel.nodes.slice(0,sel.nodes.findIndex(n=>n.type==='combinator')<0?undefined:sel.nodes.findIndex(n=>n.type==='combinator')).find(n=>n.type==='class');root=!!first&&(mode==='self'||(mode!=='desc'&&unit.roots.some(r=>first.value===r||(['Button','Input','Card','Buttons','IconButton','TextArea'].includes(name)&&first.value.startsWith(r+'-')))));})).processSync(selector.trim());
    const scoped=root?selector.trim().replace(/^([a-zA-Z][\w-]*)?/,m=>m+'__SCOPE__'):'__SCOPE__ '+selector.trim();out.push({selector:scoped,properties,conditions:ancestry,disabledCursor:!!properties.cursor&&/disabled/.test(selector)});
   }
  });return out;}
  metadata[name]=rows('none');boundaryMetadata[name]=rows('desc').concat(rows('self'));
  provenance[name]={sourceFiles:unit.files,rawCssBytes:Buffer.byteLength(css),rules:serial};
 }
 await fs.mkdir(probeRoot+'/runtime',{recursive:true});
 await fs.writeFile(probeRoot+'/runtime/descriptors.json',JSON.stringify(descriptors));
 await fs.writeFile(probeRoot+'/runtime/boundary-descriptors.json',JSON.stringify(boundaryDescriptors));
 await fs.writeFile(probeRoot+'/runtime/metadata.json',JSON.stringify(metadata));
 await fs.mkdir(probeRoot+'/runtime/metadata',{recursive:true});
 for(const [name,value]of Object.entries(metadata))await fs.writeFile(probeRoot+'/runtime/metadata/'+name+'.json',JSON.stringify(value));
 await fs.writeFile(probeRoot+'/runtime/boundary-metadata.json',JSON.stringify(boundaryMetadata));
 await fs.writeFile(probeRoot+'/runtime/shell-units.json',JSON.stringify(shellUnits));
 await fs.mkdir(probeRoot+'/runtime/descriptors',{recursive:true});
 for(const [name,value] of Object.entries(descriptors))await fs.writeFile(probeRoot+'/runtime/descriptors/'+name+'.json',JSON.stringify(value));
 await fs.writeFile(probeRoot+'/runtime/baseline.css',baseline);
 await fs.writeFile(probeRoot+'/runtime/provenance.json',JSON.stringify({method:'One-time spike generation from selected production component Sass to per-component scoped Goober OBJECT descriptors. Runtime imports only objects; no Sass/compiler or aggregate stylesheet. Selector AST normalization nests each compound/pseudo and zeroes one original class to offset the generated scope class; no generated CSS rewriting. Comments keep duplicate declarations and selectors in insertion order. Per-declaration var() fallback values come from actual defaultLightTheme, so standalone components respect inherited tokens and need no theme setup.',units:provenance},null,2));
 return {descriptors,provenance};
}
export const alias=Object.fromEntries(['react-lang','react-headless','lang-core','observability','devtools'].map(p=>['@openuidev/'+p,repo+'/packages/'+p+'/src/index.ts']));
Object.assign(alias,{goober:probeRoot+'/vendor/goober/src/index.js',react:previous+'/node_modules/react','react-dom':previous+'/node_modules/react-dom'});
export const buildOptions={bundle:true,minify:false,sourcemap:true,alias,nodePaths:[previous+'/real/node_modules',previous+'/node_modules'],define:{'process.env.NODE_ENV':'"production"'},jsx:'automatic',logLevel:'warning'};
if(process.argv[1]===new URL(import.meta.url).pathname){await prepareRuntime();console.log('Runtime component descriptors prepared');}
