import { Renderer } from '@openuidev/react-lang';
import { ThemeProvider, openuiChatLibrary } from './arm';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

const query = new URLSearchParams(location.search);
const cell = await fetch(`/cell?${query}`).then(r => r.json());
function App() {
  const [mounted, setMounted] = useState(true);
  const [source, setSource] = useState('');
  const [status, setStatus] = useState('idle');
  const [prompt, setPrompt] = useState('');
  const [hue, setHue] = useState('220');
  const [action, setAction] = useState('');
  const active = useRef<AbortController | undefined>(undefined);
  function cancel() { active.current?.abort(); }
  useEffect(() => () => cancel(), []);
  async function start() {
    cancel();
    const controller = new AbortController();
    active.current = controller;
    setSource(''); setStatus('streaming');
    try {
      const response = await fetch(`/stream?${query}`, {signal: controller.signal});
      if (!response.ok) throw Error(`HTTP ${response.status}`);
      const reader = response.body!.pipeThrough(new TextDecoderStream()).getReader();
      let text = '';
      while (true) {
        const {value, done} = await reader.read();
        if (done) break;
        text += value;
        if (!controller.signal.aborted) setSource(text);
      }
    } catch (error) {
      if (!controller.signal.aborted) throw error;
    } finally {
      if (active.current === controller) setStatus('idle');
    }
  }
  return <>
    <output id="ready">true</output><output id="mounted">{String(mounted)}</output>
    <button id="mount" onClick={() => setMounted(true)}>Mount</button>
    <button id="unmount" onClick={() => {cancel(); setMounted(false); setSource('');}}>Unmount</button>
    <button id="start-stream" onClick={start}>Start</button>
    <button id="cancel-stream" onClick={cancel}>Cancel</button>
    <button id="history" onClick={() => {cancel(); setSource(cell.payload);}}>History</button>
    <button id="clear" onClick={() => {cancel(); setSource('');}}>Clear</button>
    <input id="prompt" value={prompt} onChange={e => setPrompt(e.target.value)}/>
    <input id="theme-hue" value={hue} onChange={e => setHue(e.target.value)}/>
    <output id="status">{status}</output><pre id="message-source" hidden>{source}</pre>
    <output id="action">{action}</output>
    <main id="rendered">{mounted && <ThemeProvider cssSelector="#rendered" lightTheme={{interactiveAccentDefault:`hsl(${hue} 70% 45%)`}}>
      <Renderer library={openuiChatLibrary} response={source} isStreaming={status === 'streaming'} onAction={event => setAction(JSON.stringify(event))}/>
    </ThemeProvider>}</main>
  </>;
}
createRoot(document.getElementById('root')!).render(<App/>);
