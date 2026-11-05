// Only the library's root exports, resolved through its package.json to the built `dist`.
import { library } from "@openuidev/intelligent-ui-library";
import { ThemeProvider } from "@openuidev/react-components";
import { Renderer } from "@openuidev/react-lang";
import { useState, version, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { programs } from "../harness/programs";
import type { HostState } from "../harness/state";
import { demoTools } from "./mock-tools";

/**
 * The page an app gives the library: react-components' ThemeProvider for the mode, and a Renderer.
 * Everything about it is chosen by the query string, so one build serves the whole host matrix (see
 * harness/matrix.ts):
 *
 * - `program`: an id from harness/programs.ts;
 * - `theme`: `light` or `dark`;
 * - `provider`: `0` leaves out ThemeProvider, so the page has no theme of its own;
 * - `custom`: `1` gives ThemeProvider an app's own success colour;
 * - `stream`: `1` starts with no response and lets the test feed one in through
 *   `window.__iuStream`, as a chat streams the model's answer.
 */
const params = new URLSearchParams(location.search);
const id = params.get("program") ?? "";
const mode = params.get("theme") === "dark" ? "dark" : "light";
const provider = params.get("provider") !== "0";
const stream = params.get("stream") === "1";
const custom = params.get("custom") === "1";
const program = programs.find((entry) => entry.id === id);

const state: HostState = {
  react: version,
  program: id,
  rendered: false,
  parse: null,
  renderErrors: [],
  hostErrors: program ? [] : [`no program called "${id}"`],
  actions: [],
};
window.__iu = state;

/** An app's own success colour, which a response has to keep. */
const customSuccess = { textSuccessPrimary: "rgb(1, 2, 3)" };

function Themed({ children }: { children: ReactNode }) {
  if (!provider) return <>{children}</>;
  const theme = custom ? customSuccess : undefined;
  return (
    <ThemeProvider mode={mode} lightTheme={theme} darkTheme={theme}>
      {children}
    </ThemeProvider>
  );
}

function App() {
  const [streamed, setStreamed] = useState({ response: "", streaming: stream });
  if (stream) {
    window.__iuStream = (response, streaming) => setStreamed({ response, streaming });
  }
  return (
    <Themed>
      <main id="host">
        <Renderer
          response={stream ? streamed.response : (program?.code ?? null)}
          isStreaming={streamed.streaming}
          library={library}
          toolProvider={demoTools}
          onParseResult={(result) => {
            state.parse = result && {
              meta: result.meta,
              hasRoot: result.root !== null,
              rootType: result.root?.typeName ?? null,
            };
            state.rendered = true;
          }}
          onError={(errors) => {
            state.renderErrors = errors.map((error) => `${error.code}: ${error.message}`);
          }}
          onAction={(event) => {
            // The library defines no actions of its own (ce5fbf80), so every one reaches the host.
            state.actions.push({
              type: event.type,
              params: event.params,
              humanFriendlyMessage: event.humanFriendlyMessage,
              formState: event.formState,
              formName: event.formName,
            });
          }}
        />
      </main>
    </Themed>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
