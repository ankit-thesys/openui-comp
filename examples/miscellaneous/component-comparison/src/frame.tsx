import type { Theme } from "@openuidev/react-components";
import { getThemePreset } from "./theme-presets.mjs";
import { Renderer } from "@openuidev/react-lang";
import {
  Component,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type ComponentType,
  type ReactNode,
} from "react";
import { createRoot } from "react-dom/client";
import { channel, isSnapshot, type Snapshot } from "./protocol";
import { directExamples } from "./offline-fixture.mjs";
import "./frame.css";
class PaneBoundary extends Component<
  { children: ReactNode; resetKey: string },
  { error: string }
> {
  state = { error: "" };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  componentDidUpdate(previous: { resetKey: string }) {
    if (previous.resetKey !== this.props.resetKey && this.state.error)
      this.setState({ error: "" });
  }
  render() {
    return this.state.error ? (
      <div role="alert" className="pane-error">
        This pane could not render the response. {this.state.error}
      </div>
    ) : (
      this.props.children
    );
  }
}
export function mountPane({
  library,
  ThemeProvider,
  HorizontalBarChart,
}: {
  HorizontalBarChart?: ComponentType<any>;
  library: ComponentProps<typeof Renderer>["library"];
  ThemeProvider: ComponentType<{
    children: ReactNode;
    mode: "light" | "dark";
    cssSelector: string;
    lightTheme?: Theme;
    darkTheme?: Theme;
  }>;
}) {
  function Pane() {
    const [snapshot, setSnapshot] = useState<Snapshot>();
    const pendingTools = useMemo(() => ({ benchRows: () => new Promise(() => {}) }), []);
    const [errors, setErrors] = useState<Record<string, string>>({});
    useEffect(() => {
      let revision = -1;
      let viewId = "";
      function receive(event: MessageEvent) {
        if (
          event.origin !== location.origin ||
          event.source !== parent ||
          event.data?.channel !== channel ||
          event.data.type !== "snapshot" ||
          !isSnapshot(event.data.snapshot)
        )
          return;
        if (event.data.snapshot.revision <= revision) return;
        revision = event.data.snapshot.revision;
        if (viewId !== event.data.snapshot.viewId) {
          viewId = event.data.snapshot.viewId;
          setErrors({});
        }
        setSnapshot(event.data.snapshot);
      }
      window.addEventListener("message", receive);
      parent.postMessage({ channel, type: "ready" }, location.origin);
      return () => window.removeEventListener("message", receive);
    }, []);
    useEffect(() => {
      document.documentElement.dataset.theme = snapshot?.theme ?? "light";
    }, [snapshot?.theme]);
    if (!snapshot)
      return (
        <p className="pane-empty">Connecting to the shared conversation…</p>
      );
    const last = snapshot.messages.at(-1)?.id;
    const preset = snapshot.themePreset ?? getThemePreset(snapshot.presetId ?? "default");
    return (
      <>
        <output id="pane-source" hidden>
          {snapshot.messages
            .filter((m) => m.role === "assistant")
            .map((m) => m.content)
            .join("\n")}
        </output>
        <output id="pane-status" hidden>
          {snapshot.status}
        </output>
        <output id="pane-revision" hidden>
          {snapshot.revision}
        </output>
        <output id="pane-preset" hidden>{preset.id}:{preset.definitionHash}</output>
        <ThemeProvider mode={snapshot.theme} cssSelector="#comparison-pane" lightTheme={preset.lightTheme as Theme} darkTheme={preset.darkTheme as Theme}>
          <main id="comparison-pane" style={{background:"var(--openui-background)",color:"var(--openui-text-neutral-primary)",minHeight:"100vh"}}>
            {!snapshot.messages.length && (
              <div className="pane-empty">
                <span>One response. Two renderings.</span>
                <p>Send a prompt above to compare the chat libraries.</p>
              </div>
            )}
            {snapshot.messages.map((message) =>
              message.role === "user" ? (
                <div className="user-message" key={message.id}>
                  {message.display ?? message.content}
                </div>
              ) : (
                <section
                  key={message.id}
                  className="assistant-message"
                  data-response-id={message.id}
                >
                  {errors[message.id] && (
                    <div role="alert" className="pane-error">
                      Renderer notice: {errors[message.id]}
                    </div>
                  )}
                  <PaneBoundary key={message.id} resetKey={snapshot.viewId}>
                    {snapshot.bench?.directHorizontal && HorizontalBarChart ? <div style={{height:snapshot.bench.directHorizontal.parentHeight}}><HorizontalBarChart data={[{category:"A",value:4},{category:"B",value:7}]} categoryKey="category" dataKeys={["value"]} height={snapshot.bench.directHorizontal.height} fitLegendInHeight={snapshot.bench.directHorizontal.fitLegendInHeight} onClick={(datum:unknown)=>parent.postMessage({channel,type:"action",viewId:snapshot.viewId,responseId:message.id,action:{type:"chart-click",params:{datum},humanFriendlyMessage:"Chart click"}},location.origin)}/></div> : <Renderer
                      response={message.content}
                      library={library}
                      toolProvider={snapshot.bench?.pendingQuery ? pendingTools : undefined}
                      isStreaming={
                        message.id === last && snapshot.status !== "idle"
                      }
                      onAction={(action) =>
                        parent.postMessage(
                          {
                            channel,
                            type: "action",
                            viewId: snapshot.viewId,
                            responseId: message.id,
                            action,
                          },
                          location.origin,
                        )
                      }
                      onError={(next) => {
                        if (snapshot.status === "idle") {
                          const error = next
                            .map(
                              (e) =>
                                (e.severity === "warning" ? "Warning: " : "") +
                                e.message,
                            )
                            .join("; ");
                          setErrors((old) =>
                            old[message.id] === error
                              ? old
                              : { ...old, [message.id]: error },
                          );
                        }
                      }}
                    />}
                  </PaneBoundary>
                </section>
              ),
            )}
            {snapshot.offline && snapshot.messages.length > 0 && (
              <section className="direct-examples">
                <h2>Direct registry examples · outside Card</h2>
                <p>
                  These four entries are not reachable from Card. No schemas or
                  production components were changed.
                </p>
                {directExamples.map((example) => (
                  <section
                    data-direct-example={example.name}
                    key={example.name}
                  >
                    <h3>{example.name}</h3>
                    <p>{example.note}</p>
                    <code>{example.source}</code>
                    <PaneBoundary resetKey={snapshot.viewId}>
                      <Renderer
                        response={example.source}
                        library={library}
                        onError={(next) => {
                          const error = next.map((e) => e.message).join("; ");
                          setErrors((old) =>
                            old[example.name] === error
                              ? old
                              : { ...old, [example.name]: error },
                          );
                        }}
                      />
                    </PaneBoundary>
                    {errors[example.name] && (
                      <p role="alert" className="pane-error">
                        Direct example notice: {errors[example.name]}
                      </p>
                    )}
                  </section>
                ))}
              </section>
            )}
          </main>
        </ThemeProvider>
      </>
    );
  }
  createRoot(document.getElementById("root")!).render(<Pane />);
}
