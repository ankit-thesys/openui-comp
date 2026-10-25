import {useState,useRef,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {Renderer} from '@openuidev/react-lang';
import {openuiChatLibrary} from '@openuidev/kits/react/chat/libs';
import {FollowUpItem,ModelSwitcher} from '@openuidev/kits/react/chat';
import {ThemeProvider} from '@openuidev/react-ui-core';
const program=`root = Card([TextContent("Independent streaming check"), Form("contact", Buttons([Button("Send", @ToAssistant("Submit contact"), "primary")]), [FormControl("Name", Input("name", "Name", "text", {required: true}))]), FollowUpBlock([FollowUpItem("Next report")])])`;
const math='root = Card([TextContent("Formula: $$x^2 + y^2 = z^2$$")])';
const framework=new URLSearchParams(location.search).get('framework');
const override=framework==='plain'?'explicit':framework==='tailwind3'?'!bg-red-500 hover:!bg-green-500 disabled:!bg-gray-500 disabled:!cursor-wait':'bg-red-500! hover:bg-green-500! disabled:bg-gray-500! disabled:cursor-wait!';
function App(){
 const [text,setText]=useState(''),[streaming,setStreaming]=useState(false),[action,setAction]=useState(''),[mode,setMode]=useState<'light'|'dark'>('light'),[model,setModel]=useState('a');
 const controller=useRef<AbortController>();
 useEffect(()=>()=>controller.current?.abort(),[]);
 async function start(){controller.current?.abort();const c=new AbortController();controller.current=c;setText('');setStreaming(true);try{const res=await fetch('/stream',{method:'POST',body:program,signal:c.signal});const reader=res.body!.pipeThrough(new TextDecoderStream()).getReader();let acc='';for(;;){const part=await reader.read();if(part.done)break;acc+=part.value;setText(acc);}}catch(e){if(!(e instanceof DOMException&&e.name==='AbortError'))throw e;}finally{setStreaming(false);}}
 return <><nav><button onClick={start}>Start</button><button onClick={()=>controller.current?.abort()}>Cancel</button><button onClick={()=>setMode(mode==='light'?'dark':'light')}>Theme</button><button onClick={()=>setText(math)}>Math</button><button onClick={()=>{controller.current?.abort();setText('');}}>Clear</button><button className={override}>Host reference</button></nav><output id="status">{streaming?'streaming':'idle'}</output><output id="action">{action}</output><output id="response-length">{text.length}</output><section id="scope"><ThemeProvider mode={mode} cssSelector="#scope"><ModelSwitcher models={[{id:'a',name:'Alpha',logo:{light:'Sun',dark:'Moon'}},{id:'b',name:'Beta'}]} value={model} onValueChange={setModel}/><FollowUpItem className={override} text="Override"/><FollowUpItem className={override} text="Disabled" disabled/><main><Renderer library={openuiChatLibrary} response={text} isStreaming={streaming} onAction={e=>setAction(JSON.stringify(e))}/></main></ThemeProvider></section></>;
}
createRoot(document.getElementById('root')!).render(<App/>);
