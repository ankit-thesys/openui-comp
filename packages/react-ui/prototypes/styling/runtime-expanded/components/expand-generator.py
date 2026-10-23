p='/private/tmp/openui-runtime-expanded-components/build-shared.mjs';s=open(p).read();s=s.replace("const postcss=require(previous+'/node_modules/postcss');","const postcss=require(previous+'/node_modules/postcss');\nconst selectorParser=require(previous+'/node_modules/postcss-selector-parser');")
pos=s.index('export async function prepareRuntime')
extras="""Object.assign(units,{
 IconButton:{roots:['openui-icon-button'],files:['IconButton/iconButton.scss']},TextArea:{roots:['openui-textarea'],files:['TextArea/textArea.scss']},
 CheckBoxGroup:{roots:[],files:['CheckBoxGroup/checkBoxGroup.scss','CheckBoxItem/checkBoxItem.scss']},SwitchGroup:{roots:[],files:['SwitchGroup/switchGroup.scss','SwitchItem/switchItem.scss']},RadioGroup:{roots:[],files:['RadioGroup/radioGroup.scss']},
 Select:{roots:[],files:['Select/select.scss']},Tabs:{roots:[],files:['Tabs/tabs.scss']},Accordion:{roots:[],files:['Accordion/accordion.scss']},Separator:{roots:[],files:['Separator/separator.scss']},Modal:{roots:[],files:['Modal/Modal.scss']},Tooltip:{roots:[],files:['TooltipWrapper/tooltipWrapper.scss']},AssistantMessage:{roots:[],files:['OpenUIChat/assistantMessage.scss']},
});
const shellFiles=['agentInterface','sidebar','thread','threadHeader','mobileHeader','threadlist','historyMenu','renameChatDialog','themeModeToggle','welcomeScreen','conversationStarter','workspaceSidebar','resizableSeparator','artifactBrowser','welcomeGlow','_shared/shared','_shared/detailed-view/detailedViewPanel','_shared/detailed-view/detailedViewOverlay','components/composer','components/desktopWelcomeComposer','components/welcomeMascot','components/mascotLoader','components/welcomePrefillChips','components/ambientLoader'];
for(const file of shellFiles)units['Shell'+file.replace(/(^|\\/)([a-z])/g,(_,slash,c)=>c.toUpperCase()).replaceAll('/','')]={roots:[],files:['AgentInterface/'+file+'.scss']};
export const shellUnits=Object.keys(units).filter(n=>n.startsWith('Shell')).concat(['Button','Input','TextArea','IconButton','Separator','Tooltip','Modal','AssistantMessage']);
"""
s=s[:pos]+extras+s[pos:]
s=s.replace("const descriptors={};let baseline='';const provenance={};", "const descriptors={},boundaryDescriptors={},metadata={},boundaryMetadata={};let baseline='';const provenance={};")
s=s.replace("function object(node,keyframes=false){", "function object(node,keyframes=false,boundaryMode='none'){")
s=s.replace("const selector=keyframes?n.selector:scope(n.selector);", "const selector=keyframes?n.selector:scope(n.selector);")
s=s.replace("object(n,true);", "object(n,true,boundaryMode);")
s=s.replace("selectorPaths(n.selector,unit.roots,['Button','Input','Card','Buttons'].includes(name))", "selectorPaths(n.selector,boundaryMode==='self'?['*']:boundaryMode==='desc'?[]:unit.roots,['Button','Input','Card','Buttons','IconButton','TextArea'].includes(name))")
s=s.replace("if(!zeroed)throw new Error('Selector without source class needs a separate specificity policy: '+n.selector);", "if(!zeroed)throw new Error('Unsupported selector without source class in '+name+': '+n.selector);")
s=s.replace("let value=object(n,false);", "let value=object(n,false,boundaryMode);")
s=s.replace("object(n,keyframes||isKeys);", "object(n,keyframes||isKeys,boundaryMode);")
s=s.replace("descriptors[name]=object(tree);provenance[name]", """descriptors[name]=object(tree);
  const desc=object(tree,false,'desc'),self=object(tree,false,'self');boundaryDescriptors[name]={...desc,...self};
  function rows(mode){const out=[];tree.walkRules(rule=>{
   const ancestry=[];for(let p=rule.parent;p&&p.type!=='root';p=p.parent){if(p.type==='atrule'&&p.name.endsWith('keyframes'))return;if(p.type==='atrule')ancestry.unshift('@'+p.name+' '+p.params);}
   const properties={};for(const d of rule.nodes||[])if(d.type==='decl')properties[d.prop]=fallbacks(d.value);
   if(!Object.keys(properties).length)return;
   for(const selector of postcss.list.comma(rule.selector)){let root=false;selectorParser(ast=>ast.each(sel=>{const first=sel.nodes.slice(0,sel.nodes.findIndex(n=>n.type==='combinator')<0?undefined:sel.nodes.findIndex(n=>n.type==='combinator')).find(n=>n.type==='class');root=!!first&&(mode==='self'||(mode!=='desc'&&unit.roots.some(r=>first.value===r||(['Button','Input','Card','Buttons','IconButton','TextArea'].includes(name)&&first.value.startsWith(r+'-')))));})).processSync(selector.trim());
    const scoped=root?selector.trim().replace(/^([a-zA-Z][\\w-]*)?/,m=>m+'__SCOPE__'):'__SCOPE__ '+selector.trim();out.push({selector:scoped,properties,conditions:ancestry,disabledCursor:!!properties.cursor&&/disabled/.test(selector)});
   }
  });return out;}
  metadata[name]=rows('none');boundaryMetadata[name]=rows('desc').concat(rows('self'));
  provenance[name]""")
s=s.replace("await fs.writeFile(probeRoot+'/runtime/descriptors.json',JSON.stringify(descriptors));", "await fs.writeFile(probeRoot+'/runtime/descriptors.json',JSON.stringify(descriptors));\n await fs.writeFile(probeRoot+'/runtime/boundary-descriptors.json',JSON.stringify(boundaryDescriptors));\n await fs.writeFile(probeRoot+'/runtime/metadata.json',JSON.stringify(metadata));\n await fs.writeFile(probeRoot+'/runtime/boundary-metadata.json',JSON.stringify(boundaryMetadata));\n await fs.writeFile(probeRoot+'/runtime/shell-units.json',JSON.stringify(shellUnits));")
open(p,'w').write(s)
p='/private/tmp/openui-runtime-expanded-components/runtime/selector-normalize.mjs';s=open(p).read().replace("roots.some(r=>firstClass.value===r", "roots.some(r=>r==='*'||firstClass.value===r");open(p,'w').write(s)
