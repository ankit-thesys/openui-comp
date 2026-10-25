import { FollowUpItem, ModelSwitcher } from "@openuidev/kits/react/chat";
import { openuiChatLibrary } from "@openuidev/kits/react/chat/libs";
import { Renderer } from "@openuidev/react-lang";
import { ThemeProvider } from "@openuidev/react-ui-core";
import { useState } from "react";
import { createRoot } from "react-dom/client";

const program = `root = Card([title, table, chart, form, followups])
title = TextContent("Sales overview with **streaming**")
table = Table([Col("Month", ["Jan", "Feb"]), Col("Sales", [10, 20])])
chart = BarChart(["Jan", "Feb"], [Series("Sales", [10, 20])], "grouped")
form = Form("contact", buttons, [field])
field = FormControl("Name", Input("name", "Your name", "text", { required: true }))
buttons = Buttons([Button("Send details", @ToAssistant("Send details"), "primary")])
followups = FollowUpBlock([FollowUpItem("Show the next quarter")])`;

const framework = new URLSearchParams(location.search).get("framework");
const override =
  framework === "plain"
    ? "explicit"
    : framework === "tailwind3"
      ? "!bg-red-500 hover:!bg-green-500 disabled:!bg-gray-500 disabled:!cursor-wait"
      : "bg-red-500! hover:bg-green-500! disabled:bg-gray-500! disabled:cursor-wait!";
function App() {
  const [response, setResponse] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [action, setAction] = useState("");
  const [model, setModel] = useState("fast");
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [controller, setController] = useState<AbortController>();
  const [history, setHistory] = useState(false);
  async function start() {
    controller?.abort();
    const abort = new AbortController();
    setController(abort);
    setHistory(false);
    setResponse("");
    setStreaming(true);
    try {
      const result = await fetch("/stream", {
        method: "POST",
        body: program,
        signal: abort.signal,
      });
      const reader = result.body!.pipeThrough(new TextDecoderStream()).getReader();
      let text = "";
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        text += chunk.value;
        setResponse(text);
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) throw error;
    } finally {
      setStreaming(false);
    }
  }
  return (
    <>
      <section id="unthemed">
        <Renderer
          library={openuiChatLibrary}
          response={'root = Card([Text("text", "Default spacing"), Text("text", "Second line")])'}
        />
      </section>
      <nav>
        <button className={override}>Host override</button>
        <button onClick={start}>Start stream</button>
        <button onClick={() => controller?.abort()}>Cancel stream</button>
        <button
          onClick={() => {
            controller?.abort();
            setHistory(true);
            setResponse(program);
          }}
        >
          Load history
        </button>
        <button
          onClick={() => {
            controller?.abort();
            setResponse("");
            setHistory(false);
          }}
        >
          Clear response
        </button>
        <button onClick={() => setMode(mode === "light" ? "dark" : "light")}>Toggle theme</button>
      </nav>
      <output id="status">{streaming ? "streaming" : "idle"}</output>
      <output id="action">{action}</output>
      <div id="themed">
        <ThemeProvider mode={mode} cssSelector="#themed">
          <ModelSwitcher
            models={[
              { id: "fast", name: "Fast", logo: { light: "Sun", dark: "Moon" } },
              { id: "deep", name: "Deep", badge: "Pro" },
            ]}
            value={model}
            onValueChange={setModel}
          />
          <FollowUpItem className={override} text="Explicit override" />
          <FollowUpItem className={override} text="Disabled override" disabled />
          <main style={{ width: 720 }}>
            <Renderer
              key={history ? "history" : "live"}
              library={openuiChatLibrary}
              response={response}
              isStreaming={streaming}
              initialState={
                history
                  ? { contact: { name: { value: "Grace", componentType: "input" } } }
                  : undefined
              }
              onAction={(event) => setAction(JSON.stringify(event))}
            />
          </main>
        </ThemeProvider>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
