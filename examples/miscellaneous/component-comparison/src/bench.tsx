import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import { themePresetFixture, getThemePreset } from "./theme-presets.mjs";
import { ComparisonSession } from "./session.mjs";
import { channel } from "./protocol";
import type {
  BenchCase,
  Checklist,
  CellResult,
  Run,
  Progress,
} from "./bench-types";
import "./bench.css";
const manual = new ComparisonSession({
  replayDelay: 10,
  fetcher: async () => {
    throw Error("Manual bench never generates");
  },
});
async function api<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(
    "/bench-api/" + path,
    body
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : undefined,
  );
  const result = await response.json();
  if (!response.ok) throw Error(result.error ?? "Local bench request failed");
  return result;
}
const tone = (s?: string) =>
  s === "Pass"
    ? "pass"
    : s === "Fail"
      ? "fail"
      : s === "Known issue"
        ? "known"
        : s === "Review"
          ? "review"
          : "muted";
function Badge({ value }: { value?: string }) {
  return (
    <span className={"badge " + tone(value)}>{value ?? "Not covered"}</span>
  );
}
function App() {
  const snapshot = useSyncExternalStore(manual.subscribe, manual.getSnapshot);
  const [cases, setCases] = useState<BenchCase[]>([]),
    [checklist, setChecklist] = useState<Checklist[]>([]),
    [history, setHistory] = useState<Progress[]>([]);
  const [selected, setSelected] = useState(""),
    [checked, setChecked] = useState<string[]>([]),
    [query, setQuery] = useState("");
  const [mode, setMode] = useState<"quick" | "full">("quick"),
    [width, setWidth] = useState(390),
    [environment, setEnvironment] = useState("plain");
  const [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [tab, setTab] = useState("Results");
  const [progress, setProgress] = useState<Progress>(),
    [run, setRun] = useState<Run>(),
    [cell, setCell] = useState<CellResult>();
  const [activity, setActivity] = useState<unknown[]>([]),
    [expected, setExpected] = useState("[]"),
    [caseCoverage, setCaseCoverage] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const frames = [
    useRef<HTMLIFrameElement>(null),
    useRef<HTMLIFrameElement>(null),
  ];
  const revision = useRef(0),
    caseRef = useRef<BenchCase | undefined>(undefined);
  const current = cell
    ? run?.cases.find((c) => c.id === cell.cell.caseId)
    : cases.find((c) => c.id === selected);
  caseRef.current = current;
  const busy = progress?.status === "running";
  const playback = snapshot.status !== "idle";
  function broadcast() {
    const state = manual.getSnapshot();
    const packet = {
      ...state,
      status: caseRef.current?.setup.isStreaming ? "streaming" : state.status,
      revision: ++revision.current,
      bench: {
        pendingQuery: !!caseRef.current?.setup.pendingQuery,
        directHorizontal: caseRef.current?.setup.directHorizontal,
      },
    };
    for (const f of frames)
      f.current?.contentWindow?.postMessage(
        { channel, type: "snapshot", snapshot: packet },
        location.origin,
      );
  }
  function show(c: BenchCase, stream = false) {
    manual.stop();
    setActivity([]);
    manual.update({
      messages: [
        {
          id: c.id,
          role: "assistant",
          content: stream ? "" : c.source,
          chunks: c.source.match(/[\s\S]{1,180}/g) ?? [],
          complete: !stream,
        },
      ],
      viewId: crypto.randomUUID(),
      allowActions: !stream,
      error: "",
    });
    if (stream) void manual.replay();
  }
  async function refresh() {
    const [catalog, history] = await Promise.all([
      api<{ cases: BenchCase[]; checklist: Checklist[] }>("cases"),
      api<{ runs: Progress[] }>("runs"),
    ]);
    setCases(catalog.cases);
    setChecklist(catalog.checklist);
    setHistory(history.runs);
    setSelected((old) => old || catalog.cases[0]?.id || "");
  }
  useEffect(() => {
    void refresh().catch((e) => setError(e.message));
    const unsubscribe = manual.subscribe(broadcast);
    const connected = new Set<number>();
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.data?.channel !== channel)
        return;
      const pane = frames.findIndex(
        (f) => f.current?.contentWindow === event.source,
      );
      if (pane < 0) return;
      if (event.data.type === "ready") {
        connected.add(pane);
        setReady(connected.size === 2);
        broadcast();
      }
      if (
        event.data.type === "action" &&
        event.data.viewId === manual.getSnapshot().viewId &&
        event.data.responseId === manual.getSnapshot().messages.at(-1)?.id &&
        manual.getSnapshot().status === "idle"
      )
        setActivity((old) => [
          ...old,
          {
            pane: pane === 0 ? "legacy" : "migrated",
            event: event.data.action,
          },
        ]);
    };
    window.addEventListener("message", receive);
    return () => {
      unsubscribe();
      window.removeEventListener("message", receive);
      manual.stop();
    };
  }, []);
  useEffect(() => {
    if (current && ready) {
      show(current);
      setExpected(JSON.stringify(current.assertions, null, 2));
      setCaseCoverage(current.coverage.join(", "));
    }
  }, [current?.version, ready]);
  useEffect(() => {
    if (!ready) return;
    for (const ref of frames) {
      const doc = ref.current?.contentDocument;
      if (!doc) continue;
      doc.querySelector("[data-manual-host]")?.remove();
      const link = doc.createElement("link");
      link.rel = "stylesheet";
      link.dataset.manualHost = environment;
      link.href =
        "/bench-host/" +
        (environment.startsWith("tailwind3")
          ? "tailwind3"
          : environment.startsWith("tailwind4")
            ? "tailwind4"
            : "plain") +
        ".css";
      if (environment.endsWith("-after")) doc.head.append(link);
      else doc.head.prepend(link);
    }
  }, [environment, ready]);
  useEffect(() => {
    if (!busy || !progress) return;
    let alive = true;
    const timer = setInterval(() => {
      void api<Progress>("runs/" + progress.id + "/progress")
        .then((p) => {
          if (!alive) return;
          setProgress(p);
          if (p.status !== "running") {
            void api<Run>("runs/" + p.id)
              .then((r) => {
                setRun(r);
                setCell(undefined);
              })
              .catch((e) => setError(e.message));
            void refresh();
          }
        })
        .catch((e) => setError(e.message));
    }, 1500);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [progress?.id, busy]);
  async function start(ids?: string[]) {
    setError("");
    setCell(undefined);
    try {
      setProgress(
        await api<Progress>("runs", {
          mode,
          presetId: manual.getSnapshot().presetId ?? "default",
          ...(ids ? { caseIds: ids } : {}),
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Run could not start");
    }
  }
  async function openRun(id: string) {
    try {
      const r = await api<Run>("runs/" + id);
      setRun(r);
      setCell(r.results[0]);
      setTab("Results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Missing run");
    }
  }
  async function saveAssertions() {
    if (!current) return;
    try {
      const result = await api<{ case: BenchCase }>("cases", {
        name: current.name + " · edited expectations",
        source: current.source,
        coverage: caseCoverage
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        steps: current.steps,
        setup: current.setup,
        deliveries: current.deliveries,
        themePreset: {
          id: snapshot.presetId ?? "default",
          mode: snapshot.theme,
        },
        assertions: JSON.parse(expected),
      });
      await refresh();
      setCell(undefined);
      setSelected(result.case.id);
      setSaveStatus(
        "Saved a new immutable local case. Historical cases and baselines were not changed.",
      );
    } catch (e) {
      setSaveStatus(e instanceof Error ? e.message : "Invalid assertions");
    }
  }
  const filtered = cases.filter((c) =>
    (c.name + " " + c.coverage.join(" "))
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const currentResults =
    run?.results.filter((r) => r.cell.caseId === (current?.id ?? selected)) ??
    [];
  const runMatchesPreset =
    run?.themePreset?.id === (snapshot.presetId ?? "default") &&
    run?.themePreset?.definitionHash ===
      getThemePreset(snapshot.presetId ?? "default").definitionHash;
  const activeLedger = runMatchesPreset
    ? (run?.coverage ?? checklist)
    : checklist;
  const notCovered = activeLedger.flatMap((l) =>
    l.checks.filter(
      (c) => c.applicable && (!c.status || c.status === "Not covered"),
    ),
  ).length;
  return (
    <div className="bench-app" data-theme={snapshot.theme}>
      <header className="bench-top">
        <a className="bench-brand" href="/bench.html">
          open<span>ui</span>
          <i>/</i>
          <strong>Component bench</strong>
        </a>
        <nav>
          <a href="/">Live AI</a>
          <a href="/?mode=offline">Offline atlas</a>
          <span className="local-mark">LOCAL · NO GENERATION</span>
        </nav>
      </header>
      <section className="bench-intro">
        <div>
          <p className="eyebrow">PARITY / REGRESSION / INVESTIGATION</p>
          <h1>
            Make every difference
            <br />
            <em>visible and repeatable.</em>
          </h1>
        </div>
        <p>
          84 registry entries. Independent expectations.
          <br />
          Strict layers, immutable evidence, honest coverage.
          <br />
          <span>Known issues never become green.</span>
        </p>
      </section>
      <section className="runbar">
        <label>
          Matrix
          <select
            aria-label="Matrix mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as "quick" | "full")}
          >
            <option value="quick">Quick · plain CSS</option>
            <option value="full">
              Full · plain + Tailwind3/4 · both orders
            </option>
          </select>
        </label>
        <button
          className="primary"
          disabled={busy || !cases.length}
          onClick={() => void start(checked.length ? checked : [selected])}
        >
          Run selected {checked.length || 1}
        </button>
        <button disabled={busy || !cases.length} onClick={() => void start()}>
          Run all {cases.length}
        </button>
        <button
          disabled={
            busy ||
            !run?.results.some(
              (r) => r.verdict !== "Pass" && r.verdict !== "Not applicable",
            )
          }
          onClick={() =>
            void api<Progress>("runs", {
              mode: run?.mode,
              fromRun: run?.id,
              caseIds: [
                ...new Set(
                  run?.results
                    .filter(
                      (r) =>
                        r.verdict !== "Pass" && r.verdict !== "Not applicable",
                    )
                    .map((r) => r.cell.caseId),
                ),
              ],
            })
              .then(setProgress)
              .catch((e) => setError(e.message))
          }
        >
          Rerun non-passing
        </button>
        {busy && (
          <button
            className="danger"
            onClick={() =>
              void api("runs/" + progress.id + "/cancel", {}).then(() =>
                setSaveStatus(
                  "Cancellation requested; unfinished cells remain Not covered.",
                ),
              )
            }
          >
            Cancel run
          </button>
        )}
        <p>3 widths × 2 themes × compatible instant/streaming delivery</p>
      </section>
      {progress && (
        <section className="run-progress" aria-live="polite">
          <strong>
            {progress.status === "running"
              ? "Executing pinned Chrome"
              : progress.status}
          </strong>
          <span>
            {progress.completed ?? 0} / {progress.total ?? 0} cells
          </span>
          <progress max={progress.total || 1} value={progress.completed ?? 0} />
          <code>{progress.running ?? progress.summary?.verdict ?? ""}</code>
        </section>
      )}
      {error && (
        <p className="bench-notice" role="alert">
          {error}
        </p>
      )}
      <div className="bench-grid">
        <aside className="case-list">
          <div className="list-title">
            <h2>
              Cases <span>{cases.length}</span>
            </h2>
            <input
              aria-label="Search component cases"
              placeholder="Search component or state…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <p>
              {notCovered} applicable checks not covered ·{" "}
              <button onClick={() => setTab("Coverage")}>inspect ledger</button>
            </p>
          </div>
          <div className="case-scroll">
            {filtered.map((c) => {
              const results = runMatchesPreset
                ? run?.results.filter((r) => r.cell.caseId === c.id)
                : undefined;
              const status = results?.some((r) => r.verdict === "Fail")
                ? "Fail"
                : results?.some((r) => r.verdict === "Review")
                  ? "Review"
                  : results?.some((r) => r.verdict === "Known issue")
                    ? "Known issue"
                    : results?.length &&
                        results.every((r) => r.verdict === "Pass")
                      ? "Pass"
                      : "Not covered";
              return (
                <div
                  className={
                    "case-row " + (current?.id === c.id ? "chosen" : "")
                  }
                  key={c.id}
                >
                  <input
                    type="checkbox"
                    aria-label={"Select " + c.name}
                    checked={checked.includes(c.id)}
                    onChange={(e) =>
                      setChecked((old) =>
                        e.target.checked
                          ? [...old, c.id]
                          : old.filter((id) => id !== c.id),
                      )
                    }
                  />
                  <button
                    onClick={() => {
                      setSelected(c.id);
                      setCell(undefined);
                    }}
                  >
                    <strong>{c.name}</strong>
                    <span>
                      {c.coverage.join(" · ") || "Unassigned coverage"}
                    </span>
                    <Badge value={status} />
                  </button>
                </div>
              );
            })}
          </div>
        </aside>
        <main className="bench-center">
          <div className="preview-header">
            <div>
              <p className="eyebrow">MANUAL EXPLORATION</p>
              <h2>{current?.name ?? "Loading cases…"}</h2>
              <p>
                {cell
                  ? "Historical input · " + current?.version.slice(0, 12)
                  : "Current deterministic source"}{" "}
                · official runs execute in separate pinned Chrome contexts.
              </p>
            </div>
            <div className="preview-controls">
              <label>
                Viewport
                <select
                  aria-label="Renderer viewport"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                >
                  <option value="390">Mobile · 390px</option>
                  <option value="768">Tablet · 768px</option>
                  <option value="1280">Desktop · 1280px</option>
                </select>
              </label>
              <label>
                Preset
                <select
                  aria-label="Bench shared preset"
                  value={snapshot.presetId ?? "default"}
                  onChange={(e) => manual.update({ presetId: e.target.value })}
                >
                  {themePresetFixture.presets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Theme
                <select
                  aria-label="Bench shared theme"
                  value={snapshot.theme}
                  onChange={(e) => manual.theme(e.target.value)}
                >
                  <option>light</option>
                  <option>dark</option>
                </select>
              </label>
              <label>
                Host CSS
                <select
                  aria-label="Manual host CSS"
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                >
                  {[
                    "plain",
                    "tailwind3-before",
                    "tailwind3-after",
                    "tailwind4-before",
                    "tailwind4-after",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className="manual-toolbar">
            <button
              disabled={!ready || !current}
              onClick={() => current && show(current)}
            >
              Instant
            </button>
            <button
              disabled={
                !ready || !current?.deliveries.includes("stream") || playback
              }
              onClick={() => current && show(current, true)}
            >
              Stream case
            </button>
            <button
              disabled={
                playback ||
                !snapshot.messages.length ||
                !current?.deliveries.includes("stream")
              }
              onClick={() => void manual.replay()}
            >
              Replay
            </button>
            <button disabled={!playback} onClick={() => manual.stop()}>
              Stop
            </button>
            <span>
              {snapshot.status === "idle"
                ? "Explore freely · actions stay local"
                : "Local progressive playback"}
            </span>
          </div>
          <div className="viewport-scroller">
            <div className="preview-panes" style={{ width: width * 2 + 16 }}>
              {["Existing library", "Migrated library"].map((name, i) => (
                <section key={name}>
                  <h3>
                    <span>{i === 0 ? "01" : "02"}</span>
                    {name}
                    <small>
                      {width} × 720 · DPR depends on this manual browser
                    </small>
                  </h3>
                  <iframe
                    ref={frames[i]}
                    title={name}
                    src={i === 0 ? "/legacy.html" : "/migrated.html"}
                    width={width}
                    height={720}
                    onLoad={broadcast}
                  />
                </section>
              ))}
            </div>
          </div>
          <section className="activity">
            <h3>Manual action log</h3>
            <pre data-testid="bench-activity">
              {activity.length
                ? JSON.stringify(activity, null, 2)
                : "No actions. Submissions never call generation."}
            </pre>
          </section>
        </main>
        <aside className="bench-details">
          <div className="detail-tabs">
            {["Results", "Case", "Coverage", "History"].map((t) => (
              <button
                key={t}
                className={tab === t ? "active" : ""}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === "Results" && (
            <div className="detail-body">
              <div className="detail-heading">
                <h2>{run ? "Recorded run" : "Awaiting execution"}</h2>
                <Badge value={run?.summary.verdict} />
              </div>
              {run ? (
                <>
                  <code>{run.id}</code>
                  <p>
                    Tested preset: {run.themePreset?.label ?? "Not recorded"} ·{" "}
                    {run.themePreset?.definitionHash.slice(0, 10)}
                  </p>
                  {!runMatchesPreset && (
                    <p className="small-note">
                      This preview preset/version has no matching evidence in
                      the loaded run. Historical results below retain their
                      original identity.
                    </p>
                  )}
                  <p>
                    {run.summary.executed}/{run.summary.expected} executed ·{" "}
                    {JSON.stringify(run.summary.counts)}
                  </p>
                  <div className="export-links">
                    <a
                      download
                      href={"/bench-artifacts/" + run.id + "/run.json"}
                    >
                      JSON
                    </a>
                    <a download href={"/bench-api/runs/" + run.id + "/bundle"}>
                      HTML + evidence bundle
                    </a>
                  </div>
                  <p className="small-note">
                    A pixel difference requires review. Known issues and
                    uncovered checks cannot produce an all-green run.
                  </p>
                  <div className="result-cells">
                    {currentResults.map((r) => (
                      <button
                        key={r.cell.id}
                        className={
                          cell?.cell.id === r.cell.id ? "selected-result" : ""
                        }
                        onClick={() => setCell(r)}
                      >
                        <Badge value={r.verdict} />
                        <span>
                          {r.cell.environment} · {r.cell.width}px ·{" "}
                          {r.cell.theme} · {r.cell.delivery}
                        </span>
                      </button>
                    ))}
                  </div>
                  {cell && (
                    <>
                      <h3>Comparison layers</h3>
                      {Object.entries(cell.layers).map(([name, layer]) => (
                        <details key={name} open={layer.status !== "Pass"}>
                          <summary>
                            <strong>{name}</strong>
                            <Badge value={layer.status} />
                          </summary>
                          <pre>{JSON.stringify(layer, null, 2)}</pre>
                        </details>
                      ))}
                      <h3>Visible evidence</h3>
                      {cell.images?.map((src) => (
                        <a
                          key={src}
                          href={"/bench-artifacts/" + run.id + "/" + src}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img
                            alt={src.split("/").at(-1)}
                            src={"/bench-artifacts/" + run.id + "/" + src}
                          />
                        </a>
                      ))}
                      <p>
                        <a
                          download
                          href={
                            "/bench-artifacts/" + run.id + "/" + cell.evidence
                          }
                        >
                          Full raw measurements
                        </a>
                      </p>
                      <pre>{cell.reproduce}</pre>
                    </>
                  )}
                  <details>
                    <summary>Exact historical provenance</summary>
                    <pre>{JSON.stringify(run.provenance, null, 2)}</pre>
                  </details>
                </>
              ) : (
                <p>
                  Run selected or all cases. Static presence and manual
                  exploration do not count as executed parity.
                </p>
              )}
            </div>
          )}
          {tab === "Case" && (
            <div className="detail-body">
              <h2>Frozen input & expectations</h2>
              <code>{current?.version}</code>
              <p>
                {current?.deliveries.join(" + ")} ·{" "}
                {current?.saved
                  ? "Explicitly saved exploratory response"
                  : "Curated local fixture"}
              </p>
              <details open>
                <summary>Independent assertions</summary>
                <pre>{JSON.stringify(current?.assertions, null, 2)}</pre>
              </details>
              <details>
                <summary>Interaction steps</summary>
                <pre>{JSON.stringify(current?.steps, null, 2)}</pre>
              </details>
              <details>
                <summary>Setup / environment</summary>
                <pre>{JSON.stringify(current?.setup, null, 2)}</pre>
              </details>
              <details>
                <summary>Exact source</summary>
                <pre>{current?.source}</pre>
              </details>
              <h3>Create a local case revision</h3>
              <p>
                Explicit expectations only. Empty assertions remain Not covered.
                Saving never accepts a baseline or changes a historical run.
              </p>
              <label>
                Component names
                <input
                  aria-label="Case coverage components"
                  value={caseCoverage}
                  onChange={(e) => setCaseCoverage(e.target.value)}
                />
              </label>
              <label>
                Assertions (JSON)
                <textarea
                  aria-label="Independent assertions JSON"
                  rows={12}
                  value={expected}
                  onChange={(e) => setExpected(e.target.value)}
                />
              </label>
              <button onClick={() => void saveAssertions()}>
                Save as new local case
              </button>
              <p role="status">{saveStatus}</p>
            </div>
          )}
          {tab === "Coverage" && (
            <div className="detail-body">
              <h2>Component/state ledger</h2>
              <p>
                Requested checks have explicit cases and assertion IDs. Matching
                parser names alone earns no behavior credit.
              </p>
              {activeLedger
                .filter(
                  (l) =>
                    !current?.coverage.length ||
                    current.coverage.includes(l.component),
                )
                .map((l) => (
                  <details key={l.component} open>
                    <summary>
                      <strong>{l.component}</strong>
                      {l.direct && <small>Direct entry</small>}
                    </summary>
                    <code>{l.signature}</code>
                    {l.checks.map((c) => (
                      <div className="coverage-row" key={c.id}>
                        <span>{c.id}</span>
                        <Badge
                          value={
                            c.status ??
                            (!c.applicable ? "Not applicable" : "Not covered")
                          }
                        />
                        <p>{c.reason}</p>
                        <small>
                          {c.cases.join(", ") || "No implemented case"}
                          <br />
                          {c.assertions.join(", ")}
                        </small>
                      </div>
                    ))}
                  </details>
                ))}
            </div>
          )}
          {tab === "History" && (
            <div className="detail-body">
              <h2>Local immutable history</h2>
              <p>
                Stored outside tracked source. Reports retain their original
                case inputs, artifact hashes and browser identity.
              </p>
              <button onClick={() => void refresh()}>Refresh history</button>
              {history.map((h) => (
                <button
                  className="history-row"
                  key={h.id}
                  onClick={() => void openRun(h.id)}
                >
                  <code>{h.id}</code>
                  <Badge value={h.summary?.verdict} />
                  <small>
                    {h.status} · {h.completed ?? 0}/
                    {h.total ?? h.summary?.expected ?? "?"}
                  </small>
                </button>
              ))}
            </div>
          )}
        </aside>
      </div>
      <footer className="bench-footer">
        No performance, SSR or full accessibility certification.{" "}
        <span>Strict evidence · no automatic baseline acceptance.</span>
      </footer>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
