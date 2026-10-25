import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import { ComparisonSession } from "./session.mjs";
import { channel } from "./protocol";
import "./main.css";
const session = new ComparisonSession();
function App() {
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
  const legacy = useRef<HTMLIFrameElement>(null),
    migrated = useRef<HTMLIFrameElement>(null);
  const busy = snapshot.status !== "idle";
  function broadcast() {
    for (const frame of [legacy.current, migrated.current])
      frame?.contentWindow?.postMessage(
        { channel, type: "snapshot", snapshot: session.getSnapshot() },
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
        void session.action(
          event.data.viewId,
          event.data.responseId,
          event.data.action,
        );
    };
    window.addEventListener("message", receive);
    const abort = new AbortController();
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
    return () => {
      unsubscribe();
      window.removeEventListener("message", receive);
      abort.abort();
    };
  }, []);
  function send() {
    if (
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
          <span className="mode-badge">
            <span />
            {config?.mode === "live"
              ? "Live connection"
              : config?.mode === "mock"
                ? "Mock · no AI calls"
                : "Connecting"}
          </span>
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
          One server response feeds both libraries.
          <br />
          Compare the components as they arrive.
          <br />
          <span>Your draft form inputs stay in their own pane.</span>
        </p>
      </section>
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
      {config && !config.configured && (
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
          <pre data-testid="raw-response">
            {snapshot.messages
              .filter((m) => m.role === "assistant")
              .map((m) => m.chunks?.join("") ?? m.content)
              .join("\n\n") || "No response yet."}
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
              detail: "react-ui-core + kits/react/chat/libs",
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
          History clears on refresh · Forms submit into one shared next turn
        </span>
      </footer>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
