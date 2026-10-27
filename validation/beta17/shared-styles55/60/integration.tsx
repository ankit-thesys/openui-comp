import React from 'react';
import {createRoot} from 'react-dom/client';
import {glob} from 'goober';
const params=new URLSearchParams(location.search);
const token='--openui-interactive-accent-default';
const props=['backgroundColor','color','borderColor','borderRadius','paddingTop','paddingRight','paddingBottom','paddingLeft','font','letterSpacing','boxSizing','cursor','outlineStyle','outlineColor','outlineWidth','boxShadow','width','height'];
function snapshot(selector:string){return [...document.querySelectorAll(selector)].map((el:any)=>{const s=getComputedStyle(el);return {tag:el.tagName,text:el.textContent?.slice(0,35),styles:Object.fromEntries(props.map(p=>[p,s[p]])),token:s.getPropertyValue(token).trim(),rect:{width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height}};});}
(window as any).hostBefore=snapshot('#host > *');
if(params.get('globOrder')!=='after')glob('.host-sentinel { color:rgb(4,5,6); }');
const pkg=await import('@openuidev/react-components');
(window as any).hostAfterImport=snapshot('#host > *');
if(params.get('globOrder')==='after')glob('.host-sentinel { color:rgb(4,5,6); }');
if(params.get('order')==='after')await (window as any).addHost();
const {Button,IconButton,Input,ThemeProvider,CheckBoxGroup,CheckBoxItem,RadioGroup,RadioItem,SwitchGroup,SwitchItem,Tabs,TabsList,TabsTrigger,TabsContent,Modal,Select,SelectTrigger,SelectValue,SelectContent,SelectItem,TooltipWrapper,DatePicker,VisualCard,Buttons,FormControl,TagBlock,Tag,CodeBlock,MarkDownRenderer}=pkg;
const root=createRoot(document.getElementById('app')!);
function Controls(){return <div id="controls"><Buttons className="shared-root shared-buttons" style={{width:173,padding:11,border:"5px solid black"}}><Button>One</Button><Button>Two</Button></Buttons><FormControl className="shared-root shared-form" style={{width:173,padding:11,border:"5px solid black"}}><Input placeholder="Shared form"/></FormControl><TagBlock className="shared-root shared-tags" styles={{width:173,padding:11,border:"5px solid black"}}><Tag text="Shared tag"/></TagBlock><Button id="probe">Action</Button><Button id="disabled" disabled>Disabled</Button><IconButton id="icon" aria-label="icon" icon={<span>+</span>}/><Input id="input" placeholder="input"/><Input id="error" hasError placeholder="error"/><CheckBoxGroup><CheckBoxItem label="check"/></CheckBoxGroup><RadioGroup defaultValue="one"><RadioItem value="one" label="radio"/></RadioGroup><SwitchGroup><SwitchItem label="switch"/></SwitchGroup><Tabs defaultValue="one"><TabsList><TabsTrigger value="one">One</TabsTrigger><TabsTrigger value="two">Two</TabsTrigger></TabsList><TabsContent value="one">First</TabsContent><TabsContent value="two">Second</TabsContent></Tabs><VisualCard item={{body:'no image'}}/></div>}
function Tree({mode}:{mode:string}){
 if(mode==='code')return <div id="code-smoke"><CodeBlock language="javascript" codeString="const result = 42;"/><MarkDownRenderer textMarkdown="**Markdown**"/></div>;
 if(mode==='nested')return <ThemeProvider lightTheme={{interactiveAccentDefault:'rgb(11, 12, 13)'}}><Button id="outer">Outer</Button><ThemeProvider mode="dark" darkTheme={{interactiveAccentDefault:'rgb(21, 22, 23)'}}><Button id="inner">Inner</Button></ThemeProvider><ThemeProvider lightTheme={{interactiveAccentDefault:'rgb(31, 32, 33)'}}><Button id="sibling">Sibling</Button></ThemeProvider></ThemeProvider>;
 if(mode==='root')return <ThemeProvider cssSelector=":root" lightTheme={{interactiveAccentDefault:'rgb(41, 42, 43)'}}><Controls/></ThemeProvider>;
 if(mode==='portal')return <ThemeProvider mode="dark" darkTheme={{interactiveAccentDefault:'rgb(51, 52, 53)'}}><Modal title="Dialog" open onOpenChange={()=>{}}><Button id="portal-button">Portal</Button></Modal></ThemeProvider>;
 if(mode==='select')return <ThemeProvider mode="dark" darkTheme={{interactiveAccentDefault:'rgb(51, 52, 53)'}}><Select defaultOpen value="one"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="one">One</SelectItem><SelectItem value="two">Two</SelectItem></SelectContent></Select></ThemeProvider>;
 if(mode==='tooltip')return <ThemeProvider mode="dark" darkTheme={{interactiveAccentDefault:'rgb(51, 52, 53)'}}><TooltipWrapper tooltipContent="tip" delayDuration={0}><Button id="tooltip-trigger">Tooltip</Button></TooltipWrapper></ThemeProvider>;
 if(mode==='calendar')return <ThemeProvider mode="dark" darkTheme={{interactiveAccentDefault:'rgb(51, 52, 53)'}}><DatePicker isOpen selectedSingleDate={new Date(2026,9,15)}/></ThemeProvider>;
 if(mode==='light'||mode==='dark')return <ThemeProvider mode={mode}><Controls/></ThemeProvider>;
 return <Controls/>;
}
function render(mode:string){root.render(<Tree mode={mode}/>);(window as any).mode=mode;}
Object.assign(window,{render,getSnapshot:()=>({controls:snapshot('#controls > *, .openui-checkbox-item-container, .openui-radio-item-container, .openui-switch-item-container, .openui-tabs-trigger'),named:snapshot('#outer,#inner,#sibling,#portal-button'),portals:snapshot('[class*=openui-theme-portal-]'),hosts:snapshot('#host > *'),hostSentinel:getComputedStyle(document.querySelector('.host-sentinel')!).color,rootToken:getComputedStyle(document.documentElement).getPropertyValue(token).trim(),imageToken:getComputedStyle(document.documentElement).getPropertyValue('--openui-visual-card-image').trim(),rootClass:document.documentElement.className,layerOrder:[...document.styleSheets].flatMap(s=>{try{return [...s.cssRules].map(r=>r.cssText.slice(0,150))}catch{return []}}).filter(s=>s.startsWith('@layer')),loaded:!!document.querySelector('#app > *, .openui-modal-root')}),hostUpdate:()=>glob('.host-sentinel { color:rgb(7,8,9); }')});
render(params.get('theme')||'none');
(window as any).ready=true;
