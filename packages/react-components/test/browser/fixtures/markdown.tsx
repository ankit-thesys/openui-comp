import { InlineMarkdownRenderer, MarkDownRenderer, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import remarkGfm from "remark-gfm";
import { markdown } from "../../fixtures/markdown";

const customTypography = new URLSearchParams(location.search).has("custom-font");
createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    lightTheme={customTypography ? { textBodyDefault: "400 18px/2 Arial" } : undefined}
  >
    <div data-testid="markdown">
      <MarkDownRenderer
        textMarkdown={markdown}
        options={{ remarkPlugins: [remarkGfm], urlTransform: (url) => url }}
      />
      <MarkDownRenderer variant="card" textMarkdown="Card paragraph" />
      <MarkDownRenderer variant="sunk" textMarkdown="Sunk paragraph" />
    </div>
    <div data-testid="custom">
      <MarkDownRenderer
        textMarkdown={"Custom [link](https://example.com) and `code`."}
        options={{
          components: {
            p: ({ children }) => <section data-testid="custom-paragraph">{children}</section>,
            a: ({ href, children }) => (
              <a href={href} data-testid="custom-link">
                {children}
              </a>
            ),
            code: ({ children }) => <kbd data-testid="custom-code">{children}</kbd>,
          },
        }}
      />
    </div>
    <span data-testid="inline">
      <InlineMarkdownRenderer content="Inline **markdown**" />
    </span>
  </ThemeProvider>,
);
