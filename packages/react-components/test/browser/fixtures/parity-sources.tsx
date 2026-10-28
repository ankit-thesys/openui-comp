import {
  CardSourceContext,
  ListedSourceItem,
  ListedSources,
  Sources,
  ThemeProvider,
} from "openui-under-test";
import { createRoot } from "react-dom/client";
import { source, sources, useParityReady } from "./citations-sources-shared";

function Fixture() {
  useParityReady(1);
  return (
    <>
      <section data-case="listed" style={{ width: 640 }}>
        <ListedSources sources={sources} />
      </section>
      <section data-case="overflow" style={{ width: 320 }}>
        <ListedSources
          sources={Array.from({ length: 8 }, (_, index) => ({
            ...source,
            title: `Source ${index}`,
            url: `https://example.com/${index}`,
          }))}
        />
      </section>
      <section data-case="context" style={{ width: 640 }}>
        <CardSourceContext.Provider value={sources}>
          <Sources />
        </CardSourceContext.Provider>
      </section>
      {[source.url, undefined, "", " "].map((url, index) => (
        <section key={index} data-case={`item-${index}`} style={{ width: 180 }}>
          <ListedSourceItem {...source} url={url} sourceId={index} />
        </section>
      ))}
      <section data-case="item-fallback" style={{ width: 180 }}>
        <ListedSourceItem {...source} faviconUrl="" sourceId={4} />
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
