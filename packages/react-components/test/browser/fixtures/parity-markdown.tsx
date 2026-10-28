import { MarkDownRenderer, ThemeProvider } from "openui-under-test";
import { useLayoutEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import remarkGfm from "remark-gfm";
import { markdown } from "../../fixtures/markdown";

const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";

function Fixture() {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    ref.current!.querySelectorAll("[data-parity-case]").forEach((root) => {
      root.querySelectorAll("*").forEach((part, index) => {
        part.setAttribute("data-parity-part", `${part.tagName.toLowerCase()}-${index}`);
      });
    });
  }, []);
  return (
    <div ref={ref}>
      {([undefined, "clear", "card", "sunk"] as const).map((variant) => (
        <section key={variant ?? "default"} data-parity-case={variant ?? "default"}>
          <MarkDownRenderer
            variant={variant}
            textMarkdown={markdown}
            options={{ remarkPlugins: [remarkGfm], urlTransform: (url) => url }}
          />
        </section>
      ))}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    <Fixture />
  </ThemeProvider>,
);
