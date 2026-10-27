import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import { ComparisonSession } from "./session.mjs";
import { getThemePreset, themePresetFixture } from "./theme-presets.mjs";
import { OfflineSession } from "./offline-session.mjs";
import { channel } from "./protocol";
import "./main.css";
const liveSession = new ComparisonSession();
const offlineSession = new OfflineSession();
function App() {
  const [mode, setMode] = useState<"live" | "offline">(
    new URLSearchParams(location.search).get("mode") === "offline"
      ? "offline"
      : "live",
  );
  const session = mode === "offline" ? offlineSession : liveSession;
  function changeMode(next: "live" | "offline") {
    session.clear();
    const target = next === "offline" ? offlineSession : liveSession;
    target.clear();
    target.theme(session.getSnapshot().theme);
    target.update({presetId:session.getSnapshot().presetId ?? "default"});
    setMode(next);
  }
  const snapshot = useSyncExternalStore(session.subscribe, session.getSnapshot);
  const [prompt, setPrompt] = useState(
    "Build a sales dashboard with a chart, a table, and a contact form.",
  );
  const [config, setConfig] = useState<{
    mode: string;
    configured: boolean;
    missing: string[];
  }>();
  const [ready, setReady] = useState({ legacy: false, migrated: false });
  const [inspect, setInspect] = useState(false);
  const [caseName,setCaseName] = useState("");
  const [saveNotice,setSaveNotice] = useState("");
  const [responseToSave,setResponseToSave] = useState("");
  async function saveCase() {
    const message = snapshot.messages.find(m=>m.id===responseToSave) ?? snapshot.messages.filter(m=>m.role==="assistant").at(-1);
    if(!message || message.role!=="assistant") return;
    try { const response=await fetch("/bench-api/cases",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:caseName||"Saved exploratory response",source:message.chunks?.join("")??message.content,coverage:[],assertions:[],steps:[],themePreset:{...getThemePreset(snapshot.presetId ?? "default"),mode:snapshot.theme}})});const result=await response.json();if(!response.ok)throw Error(result.error);setSaveNotice("Saved only the selected response. Not covered until independent assertions are added in the test bench."); } catch(error) {setSaveNotice(error instanceof Error?error.message:"Could not save case");}
  }
  const legacy = useRef<HTMLIFrameElement>(null),
    migrated = useRef<HTMLIFrameElement>(null);
  const busy = snapshot.status !== "idle";
  const transportRevision = useRef(0);
  function broadcast() {
    const packet = {
      ...session.getSnapshot(),
      revision: ++transportRevision.current,
    };
    for (const frame of [legacy.current, migrated.current])
      frame?.contentWindow?.postMessage(
        { channel, type: "snapshot", snapshot: packet },
        location.origin,
      );
  }
  useEffect(() => {
    const unsubscribe = session.subscribe(broadcast);
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.data?.channel !== channel)
        return;
      const pane =
        event.source === legacy.current?.contentWindow
          ? "legacy"
          : event.source === migrated.current?.contentWindow
            ? "migrated"
            : null;
      if (!pane) return;
      if (event.data.type === "ready") {
        setReady((old) => ({ ...old, [pane]: true }));
        broadcast();
      }
      if (
        event.data.type === "action" &&
        typeof event.data.viewId === "string" &&
        typeof event.data.responseId === "string"
      )
        void (mode === "offline"
          ? offlineSession.action(
              event.data.viewId,
              event.data.responseId,
              event.data.action,
              pane,
            )
          : liveSession.action(
              event.data.viewId,
              event.data.responseId,
              event.data.action,
            ));
    };
    window.addEventListener("message", receive);
    const abort = new AbortController();
    const embedded = document.getElementById("comparison-config")?.textContent;
    if (mode === "live" && embedded) setConfig(JSON.parse(embedded));
    if (mode === "live" && !embedded)
      fetch("/api/config", { signal: abort.signal })
        .then((r) => r.json())
        .then(setConfig)
        .catch((error) => {
          if (error.name !== "AbortError")
            setConfig({
              mode: "unavailable",
              configured: false,
              missing: ["Start the example server to connect."],
            });
        });
    broadcast();
    return () => {
      unsubscribe();
      window.removeEventListener("message", receive);
      abort.abort();
    };
  }, [session, mode]);
  function send() {
    if (
      mode !== "live" ||
      busy ||
      !prompt.trim() ||
      !config?.configured ||
      !ready.legacy ||
      !ready.migrated
    )
      return;
    const submitted = prompt;
    setPrompt("");
    void session.send(submitted);
  }
  return (
    <div className="app" data-theme={snapshot.theme}>
      <header className="topbar">
        <a className="wordmark" href="/">
          open<span>ui</span>
          <i> / </i>
          <strong>Comparison lab</strong>

        </a>
        <div className="header-right">
          <a href="/bench.html">Test bench ↗</a>
          <label className="theme-label">
            Mode
            <select
              aria-label="Demo mode"
              value={mode}
              onChange={(e) => changeMode(e.target.value as "live" | "offline")}
            >
              <option value="live">Live AI</option>
              <option value="offline">Offline demo</option>
            </select>
          </label>
          <span className="mode-badge">
            <span />
            {mode === "offline"
              ? "Offline · zero API calls"
              : config?.mode === "live"
                ? "Live connection"
                : config?.mode === "mock"
                  ? "Mock · no AI calls"
                  : "Connecting"}
          </span>
          <label className="theme-label">Preset<select aria-label="Shared theme preset" value={snapshot.presetId ?? "default"} onChange={e=>session.update({presetId:e.target.value})}>{themePresetFixture.presets.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select></label>
          <label className="theme-label">
            Theme
            <select
              aria-label="Shared theme"
              value={snapshot.theme}
              onChange={(e) => session.theme(e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>
      </header>
      <section className="intro">
        <div>
          <p className="eyebrow">COMPONENT MIGRATION / SIDE BY SIDE</p>
          <h1>
            One conversation.
            <br />
            <em>Two ways to render it.</em>
          </h1>
        </div>
        <p className="intro-note">
          {mode === "offline"
            ? "One local fixture feeds both libraries."
            : "One server response feeds both libraries."}
          <br />
          Compare the components as they arrive.
          <br />
          <span>Your draft form inputs stay in their own pane.</span>
        </p>
      </section>
      {mode === "offline" ? (
        <section
          className="composer offline-controls"
          aria-label="Offline demo controls"
        >
          <h2>Component atlas · local playback</h2>
          <p>
            80 entries in one shared response, plus 4 labeled direct examples.
            Some helpers render through their parent; tabs and accordions reveal
            more examples.
          </p>
          <p>
            Switching modes clears both sessions and stops active work. Offline
            actions only enter the local activity log.
          </p>
          <div className="controls">
            <button
              onClick={() => offlineSession.instant()}
              disabled={!ready.legacy || !ready.migrated}
            >
              Render all instantly
            </button>
            <button
              onClick={() => void offlineSession.stream()}
              disabled={busy || !ready.legacy || !ready.migrated}
            >
              Stream demo
            </button>
            <button
              onClick={() => void offlineSession.replay()}
              disabled={busy || !snapshot.messages.length}
            >
              Replay
            </button>
            <button onClick={() => offlineSession.stop()} disabled={!busy}>
              Stop
            </button>
            <button onClick={() => offlineSession.clear()}>Clear</button>
          </div>
          <p role="status">
            {busy
              ? "Playing locally…"
              : snapshot.messages.length
                ? "Local response ready"
                : "Choose instant or streamed playback"}
          </p>
        </section>
      ) : (
        <section className="composer" aria-label="Shared conversation controls">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <label htmlFor="prompt">Ask once, compare both</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe a UI, ask a follow-up, or submit a form below…"
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  if (!busy) void send();
                }
              }}
            />
            <div className="composer-bottom">
              <span className="status" role="status">
                {snapshot.status === "streaming"
                  ? "Streaming one shared response…"
                  : snapshot.status === "replaying"
                    ? "Replaying retained chunks · no AI request"
                    : snapshot.messages.length
                      ? "Shared response ready"
                      : "Ready when you are"}
              </span>
              <div className="controls">
                <button
                  type="button"
                  onClick={() => session.clear()}
                  disabled={!snapshot.messages.length && !busy}
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => void session.replay()}
                  disabled={
                    busy ||
                    !snapshot.messages.some(
                      (m) => m.role === "assistant" && m.content,
                    )
                  }
                >
                  Replay
                </button>
                {busy ? (
                  <button
                    type="button"
                    className="primary"
                    onClick={() => session.stop()}
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="primary"
                    disabled={
                      !prompt.trim() ||
                      !config?.configured ||
                      !ready.legacy ||
                      !ready.migrated
                    }
                  >
                    Send prompt <span>↗</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </section>
      )}
      {mode === "live" && config && !config.configured && (
        <div className="notice" role="alert">
          <strong>Setup needed</strong> {config.missing.join(", ")}. Credentials
          belong in the server’s ignored .env.local file.
        </div>
      )}
      {snapshot.error && (
        <div className="notice error" role="alert">
          {snapshot.error} Both panes keep the response received so far.
        </div>
      )}
      <div className="comparison-heading">
        <p>
          <span className={busy ? "live-dot active" : "live-dot"} />
          {busy ? "Receiving together" : "Same response · isolated documents"}
        </p>
        <button
          className="inspect-toggle"
          onClick={() => setInspect(!inspect)}
          aria-expanded={inspect}
        >
          {inspect ? "Hide" : "Inspect"} response <span>⌘</span>
        </button>
      </div>
      {inspect && (
        <section className="raw">
          <h2>Shared response source</h2>
          <p>
            Session memory only. Replay uses these retained chunks without
            another generation.
          </p>
          {mode === "live" && <div className="save-case"><label>Response to save<select aria-label="Response to save" value={responseToSave} onChange={e=>setResponseToSave(e.target.value)}><option value="">Latest assistant response</option>{snapshot.messages.filter(m=>m.role==="assistant").map((m,i)=><option key={m.id} value={m.id}>Response {i+1}</option>)}</select></label><input aria-label="Saved case name" placeholder="Name this deterministic case" value={caseName} onChange={e=>setCaseName(e.target.value)}/><button onClick={()=>void saveCase()} disabled={!snapshot.messages.some(m=>m.role==="assistant")||busy}>Save selected response as case</button><p role="status">{saveNotice}</p></div>}
          <pre data-testid="raw-response">
            {snapshot.messages
              .filter((m) => m.role === "assistant")
              .map((m) => m.chunks?.join("") ?? m.content)
              .join("\n\n") || "No response yet."}
          </pre>
        </section>
      )}
      {mode === "offline" && (
        <section className="raw" aria-label="Local activity log">
          <h2>Local activity log</h2>
          <p>Originating pane and submitted values. No generation requests.</p>
          <pre data-testid="activity-log">
            {JSON.stringify(offlineSession.getSnapshot().activity, null, 2)}
          </pre>
        </section>
      )}
      <div className="panes">
        {(
          [
            {
              id: "legacy",
              label: "Existing library",
              detail: "@openuidev/react-ui",
              ref: legacy,
            },
            {
              id: "migrated",
              label: "Migrated library",
              detail: "react-components + chat-kit/libs",
              ref: migrated,
            },
          ] as const
        ).map((pane) => (
          <section className="pane" key={pane.id}>
            <div className="pane-heading">
              <div>
                <span className={"pane-index " + pane.id}>
                  {pane.id === "legacy" ? "01" : "02"}
                </span>
                <div>
                  <h2>{pane.label}</h2>
                  <p>{pane.detail}</p>
                </div>
              </div>
              <span className="pane-ready">
                {ready[pane.id] ? "Connected" : "Loading…"}
              </span>
            </div>
            <iframe
              ref={pane.ref}
              title={pane.label}
              src={`/${pane.id}.html`}
              onLoad={broadcast}
            />
          </section>
        ))}
      </div>
      <footer>
        <span>
          Visual comparison, not an automated parity or performance certificate.
        </span>
        <span>
          {mode === "offline"
            ? "Offline actions stay local · history clears on refresh"
            : "History clears on refresh · Forms submit into one shared next turn"}
        </span>
      </footer>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
