// Public-package fixture for flat classes, portal states, callers and the sources carousel.
import {
  CardSourceContext,
  Citation,
  CitationItem,
  InlineMarkdownRenderer,
  ListedSourceItem,
  ListedSources,
  SourceFaviconImage,
  Sources,
  ThemeProvider,
} from "openui-under-test";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { favicon, InlineExamples, inlineText, source, sources } from "./citations-sources-shared";

const params = new URLSearchParams(location.search);
function Fixture() {
  const [url, setUrl] = useState("/missing-favicon.svg");
  return (
    <ThemeProvider
      mode={params.get("mode") === "dark" ? "dark" : "light"}
      cssLayer={params.get("layer") ?? undefined}
    >
      <CardSourceContext.Provider value={[source]}>
        <section data-testid="inline">
          <InlineMarkdownRenderer content={inlineText} />
        </section>
        <InlineExamples />
      </CardSourceContext.Provider>
      <section data-testid="citation">
        <Citation sources={sources} />
      </section>
      <section data-testid="citation-item">
        <CitationItem {...source} />
      </section>
      <section data-testid="citation-item-unlinked">
        <CitationItem {...source} url="" />
      </section>
      <section data-testid="sources" style={{ width: 320 }}>
        <ListedSources
          sources={Array.from({ length: 8 }, (_, index) => ({
            ...source,
            title: `Source ${index}`,
            url: `https://example.com/${index}`,
          }))}
        />
      </section>
      <section data-testid="source-item">
        <ListedSourceItem {...source} sourceId={0} />
      </section>
      <section data-testid="source-item-unlinked">
        <ListedSourceItem {...source} sourceId={1} url="" />
      </section>
      <section data-testid="image">
        <SourceFaviconImage url={favicon} alt="Favicon" width={24} height={24} />
      </section>
      <section data-testid="fallback">
        <SourceFaviconImage url="" alt="Fallback" width={24} height={24} />
      </section>
      <section data-testid="retry">
        <SourceFaviconImage url={url} alt="Retry" width={24} height={24} />
      </section>
      <button onClick={() => setUrl(favicon)}>Retry image</button>
      <section data-testid="empty">
        <Citation sources={[]} />
        <ListedSources sources={[]} />
        <Sources />
        <InlineMarkdownRenderer content="" />
      </section>
    </ThemeProvider>
  );
}
createRoot(document.getElementById("root")!).render(<Fixture />);
