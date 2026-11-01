import { Citation, CitationItem, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { source, useParityReady } from "./citations-sources-shared";

function Fixture() {
  useParityReady(2);
  return (
    <>
      {[source.url, undefined, "", " "].map((url, index) => (
        <section
          key={index}
          data-case={`item-${index}`}
          data-parity-target="button"
          style={{ width: 348 }}
        >
          <CitationItem {...source} url={url} />
        </section>
      ))}
      <section data-case="item-fallback" data-parity-target="button" style={{ width: 348 }}>
        <CitationItem {...source} faviconUrl="" />
      </section>
      {/* Pressing the trigger pins its portal. Run it last so it cannot cover later cases. */}
      <section data-case="citation" data-parity-target="button" style={{ width: 24 }}>
        <Citation sources={[source]} />
      </section>
    </>
  );
}
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    <Fixture />
  </ThemeProvider>,
);
