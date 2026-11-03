import { Renderer } from "@openuidev/react-lang";
// Vite points this at target.kit.ts, or at target.source.ts when capturing the source app.
// @ts-expect-error resolved by the harness's Vite config
import { demoTools, library, Provider, runLibraryAction, vars } from "parity-target";
import { useCallback } from "react";
import { createRoot, type Root } from "react-dom/client";

type Bridge = {
  actions: unknown[];
  errors: string[];
  clipboard: string[];
  spec: () => unknown;
  mount: (program: string, theme: "light" | "dark") => void;
  unmount: () => void;
};

const bridge: Bridge = {
  actions: [],
  errors: [],
  clipboard: [],
  spec: () => library.toSpec(),
  mount: () => {},
  unmount: () => {},
};
(window as unknown as { __parity: Bridge }).__parity = bridge;

// Copies go here rather than to the real clipboard, so a test can read them.
Object.defineProperty(navigator, "clipboard", {
  configurable: true,
  value: {
    writeText: async (text: string) => {
      bridge.clipboard.push(text);
    },
  },
});

const bare = new URLSearchParams(location.search).get("host") === "plain";

/** The same page as the source app's /preview route, inside the theme provider its chat page has. */
function Page({ program, theme }: { program: string; theme: "light" | "dark" }) {
  const onError = useCallback((list: { code: string; message: string }[]) => {
    bridge.errors = list.map((error) => `${error.code}: ${error.message}`);
  }, []);
  const onAction = useCallback(
    (event: { type: string; humanFriendlyMessage?: string; formState?: unknown; params?: unknown }) => {
      void runLibraryAction(event);
      bridge.actions.push({
        type: event.type,
        message: event.humanFriendlyMessage,
        params: event.params,
        formState: event.formState,
      });
    },
    [],
  );

  const page = (
    <div
      style={{
        minHeight: "100dvh",
        background: `var(${vars.canvas})`,
        color: `var(${vars.ink})`,
        fontFamily: `var(${vars.font})`,
      }}
    >
      <main
        className="preview-root"
        style={{
          boxSizing: "border-box",
          maxWidth: 800,
          margin: "0 auto",
          padding: "24px 16px 48px",
          fontSize: 16,
          lineHeight: 1.6,
        }}
      >
        <Renderer
          response={program}
          library={library}
          isStreaming={false}
          onAction={onAction}
          onError={onError}
          toolProvider={demoTools}
        />
      </main>
    </div>
  );
  return bare ? page : <Provider mode={theme}>{page}</Provider>;
}

let root: Root | null = null;

bridge.unmount = () => {
  root?.unmount();
  root = null;
};

bridge.mount = (program, theme) => {
  bridge.unmount();
  bridge.actions = [];
  bridge.errors = [];
  bridge.clipboard = [];
  document.documentElement.setAttribute("data-openui-theme", theme);
  root = createRoot(document.getElementById("root")!);
  root.render(<Page program={program} theme={theme} />);
};
