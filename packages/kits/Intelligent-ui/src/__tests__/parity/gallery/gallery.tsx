import { ThemeProvider } from "@openuidev/react-components";
import { Renderer } from "@openuidev/react-lang";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { demoTools } from "../../../lib/demo-data";
import { library, runLibraryAction } from "../../../lib";
import programs from "../fixtures/programs.json";

type Program = { id: string; section: string; title: string; code: string };
const SECTIONS = [
  ["components", "Components"],
  ["composition", "Composition"],
  ["tools", "Working tools"],
  ["examples", "Prompt examples"],
] as const;

/** Maps and iframes are heavy, so a program only renders once it is near the screen. */
function Lazy({ children }: { children: ReactNode }) {
  const holder = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => entry?.isIntersecting && setShown(true), {
      rootMargin: "600px",
    });
    if (holder.current) observer.observe(holder.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={holder}>{shown ? children : <div style={{ height: 280 }} />}</div>;
}

const line = "1px solid color-mix(in srgb, currentColor 14%, transparent)";
const nav: CSSProperties = {
  position: "sticky",
  top: 0,
  height: "100dvh",
  overflowY: "auto",
  width: 220,
  flex: "none",
  padding: 16,
  borderRight: line,
  fontSize: 13,
};

function App() {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [notice, setNotice] = useState("");
  useEffect(() => document.documentElement.setAttribute("data-openui-theme", mode), [mode]);
  const onAction = useCallback((event: Parameters<typeof runLibraryAction>[0]) => {
    void runLibraryAction(event);
    setNotice(`${event.type}: ${event.humanFriendlyMessage ?? ""}`);
    setTimeout(() => setNotice(""), 3000);
  }, []);

  return (
    <ThemeProvider mode={mode}>
      <div
        style={{
          display: "flex",
          minHeight: "100dvh",
          background: "var(--openui-intelligent-canvas)",
          color: "var(--openui-intelligent-ink)",
          fontFamily: "var(--openui-intelligent-font)",
        }}
      >
        <nav style={nav}>
          <button
            type="button"
            onClick={() => setMode(mode === "light" ? "dark" : "light")}
            style={{ width: "100%", padding: "6px 10px", marginBottom: 14, border: line, borderRadius: 8 }}
          >
            Switch to {mode === "light" ? "dark" : "light"}
          </button>
          {SECTIONS.map(([key, title]) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <strong>{title}</strong>
              {(programs as Program[])
                .filter((program) => program.section === key)
                .map((program) => (
                  <a key={program.id} href={`#${program.id}`} style={{ display: "block", padding: "3px 0", opacity: 0.75 }}>
                    {program.title}
                  </a>
                ))}
            </div>
          ))}
        </nav>
        <main style={{ flex: 1, minWidth: 0 }}>
          {SECTIONS.map(([key, title]) => (
            <div key={key}>
              <h1 style={{ maxWidth: 800, margin: "32px auto 0", padding: "0 16px", fontSize: 22, fontWeight: 600 }}>{title}</h1>
              {(programs as Program[])
                .filter((program) => program.section === key)
                .map((program) => (
                  <section
                    key={program.id}
                    id={program.id}
                    style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px", fontSize: 16, lineHeight: 1.6, borderBottom: line }}
                  >
                    <div style={{ marginBottom: 14, fontSize: 12, opacity: 0.6 }}>{program.title}</div>
                    <Lazy>
                      <Renderer response={program.code} library={library} isStreaming={false} onAction={onAction} toolProvider={demoTools} />
                    </Lazy>
                  </section>
                ))}
            </div>
          ))}
        </main>
      </div>
      {notice ? (
        <div role="status" style={{ position: "fixed", right: 16, bottom: 16, padding: "8px 12px", borderRadius: 8, background: "#000", color: "#fff", fontSize: 13 }}>
          {notice}
        </div>
      ) : null}
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
