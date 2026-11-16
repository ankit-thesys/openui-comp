// Only the library's root exports, resolved through its package.json to the built `dist`.
import { library, ThemeProvider } from "@openuidev/intelligent-ui-library";
import { ThemeProvider as ComponentsThemeProvider } from "@openuidev/react-components";
import { Renderer } from "@openuidev/react-lang";
import { useState, version, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { programs } from "../harness/programs";
import type { HostState } from "../harness/state";
import { demoTools } from "./mock-tools";

/**
 * The page an app gives the library: the library's ThemeProvider for the mode, and a Renderer.
 * Everything about it is chosen by the query string, so one build serves the whole host matrix (see
 * harness/matrix.ts):
 *
 * - `program`: an id from harness/programs.ts;
 * - `theme`: `light` or `dark`;
 * - `provider`: `0` leaves out ThemeProvider, so the page has no theme of its own;
 * - `custom`: `1` gives ThemeProvider an app's own success colour and first chart colour as both
 *   lightTheme and darkTheme; `light` passes them as lightTheme only; `split` passes a different
 *   success colour for each mode;
 * - `components`: `dark` wraps the page in a dark react-components ThemeProvider. A library
 *   ThemeProvider ignores it; without one, a Col root takes its mode;
 * - `kitmode`: `none` gives the page's library ThemeProvider no mode, so it takes its default;
 * - `restore`: `1` passes `initialState` with `$won: true`, as an app does when it reopens a saved
 *   chat; the Renderer applies it after the first render;
 * - `nest`: `1` puts a second library ThemeProvider with no mode inside the first, which takes the
 *   first one's mode; `flip` gives the second one the other mode;
 * - `stream`: `1` starts with no response and lets the test feed one in through
 *   `window.__iuStream`, as a chat streams the model's answer.
 */
const params = new URLSearchParams(location.search);
const id = params.get("program") ?? "";
const mode = params.get("theme") === "dark" ? "dark" : "light";
const provider = params.get("provider") !== "0";
const stream = params.get("stream") === "1";
const custom = params.get("custom");
const components = params.get("components") === "dark";
const nest = params.get("nest");
const restore = params.get("restore") === "1";
const kitMode = params.get("kitmode") === "none" ? undefined : mode;
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

/** An app's own success colour and first chart colour, which a response has to keep. */
const customSuccess = { textSuccessPrimary: "rgb(1, 2, 3)", intelligentChart1: "rgb(4, 5, 6)" };

/** For `custom=split`: a success colour for each mode. */
const splitLight = { textSuccessPrimary: "rgb(1, 2, 3)" };
const splitDark = { textSuccessPrimary: "rgb(7, 8, 9)" };

function themes() {
  if (custom === "1") return { lightTheme: customSuccess, darkTheme: customSuccess };
  if (custom === "light") return { lightTheme: customSuccess };
  if (custom === "split") return { lightTheme: splitLight, darkTheme: splitDark };
  return {};
}

function Themed({ children }: { children: ReactNode }) {
  const other = mode === "dark" ? "light" : "dark";
  const inner =
    nest === "1" ? (
      <ThemeProvider>{children}</ThemeProvider>
    ) : nest === "flip" ? (
      <ThemeProvider mode={other}>{children}</ThemeProvider>
    ) : (
      children
    );
  const page = provider ? (
    <ThemeProvider mode={kitMode} {...themes()}>
      {inner}
    </ThemeProvider>
  ) : (
    inner
  );
  return components ? <ComponentsThemeProvider mode="dark">{page}</ComponentsThemeProvider> : page;
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
          initialState={restore ? { $won: true } : undefined}
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
