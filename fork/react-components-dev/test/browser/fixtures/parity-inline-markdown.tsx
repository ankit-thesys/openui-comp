import { CardSourceContext, InlineMarkdownRenderer, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { InlineExamples, inlineText, source, useParityReady } from "./citations-sources-shared";

function Fixture() {
  useParityReady(6);
  return (
    <CardSourceContext.Provider value={[source]}>
      <section data-case="inline">
        <InlineMarkdownRenderer content={inlineText} />
      </section>
      <section data-case="flattened">
        <InlineMarkdownRenderer content={"# Heading\n\n- First\n- Second\n\nParagraph"} />
      </section>
      <InlineExamples />
    </CardSourceContext.Provider>
  );
}
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    <Fixture />
  </ThemeProvider>,
);
