import * as Core from "@openuidev/react-ui-core";
import { useState } from "react";
import { createRoot } from "react-dom/client";
const variants = [
  "title-text",
  "number-title-text",
  "text-subtext",
  "highlight-text-number-subtext",
  "text",
  "highlight-text",
  "number",
  "highlight-number",
] as const;
function Content({ config }: { config: any }) {
  return (
    <>
      <Core.InlineHeader
        heading="**Heading**"
        description="Description with [link](https://example.com)"
      />
      <Core.Table containerClassName="table-container">
        <Core.TableHeader>
          <Core.TableRow>
            <Core.TableHead align="left">Name</Core.TableHead>
            <Core.TableHead align="right">Value</Core.TableHead>
          </Core.TableRow>
        </Core.TableHeader>
        <Core.TableBody>
          <Core.TableRow>
            <Core.TableCell align="left">Item</Core.TableCell>
            <Core.TableCell align="right">42</Core.TableCell>
          </Core.TableRow>
        </Core.TableBody>
        <Core.TableFooter>
          <Core.TableRow>
            <Core.TableCell>Total</Core.TableCell>
            <Core.TableCell>42</Core.TableCell>
          </Core.TableRow>
        </Core.TableFooter>
      </Core.Table>
      <div style={{ width: 300 }}>
        <Core.ScrollableTable>
          <Core.TableHeader>
            <Core.TableRow>
              {[0, 1, 2, 3].map((i) => (
                <Core.TableHead key={i} style={{ minWidth: 180 }}>
                  Column {i}
                </Core.TableHead>
              ))}
            </Core.TableRow>
          </Core.TableHeader>
          <Core.TableBody>
            <Core.TableRow>
              {[0, 1, 2, 3].map((i) => (
                <Core.TableCell key={i} style={{ minWidth: 180 }}>
                  Value {i}
                </Core.TableCell>
              ))}
            </Core.TableRow>
          </Core.TableBody>
        </Core.ScrollableTable>
      </div>
      <Core.CodeBlock language="javascript" codeString={"const value = 42;\nconsole.log(value);"} />
      <Core.MarkDownRenderer
        variant={config.variant}
        textMarkdown={
          "# Heading\n\nParagraph **strong** and *emphasis* with [safe link](https://example.com).\n\n- First\n- Second\n\n> Quoted text\n\n---\n\n| Name | Value |\n| :--- | ---: |\n| A | 42 |\n\n```js\nconst value = 42;\n```"
        }
      />
      <Core.InlineMarkdownRenderer
        content={"**Inline** ~~deleted~~\nnext [safe](https://example.com)"}
      />
      <Core.TextContentWrapper
        textMarkdown={"Paragraph\n\n- List\n- More\n\n**Rich** content, ~$886K and $literal$."}
        header={{ heading: "Wrapper", description: "Details" }}
        variant={config.variant}
      />
      <div id="typography">
        {variants.map((variant) => (
          <Core.TextBlockView
            key={variant}
            className={config.override ? "consumer-override" : undefined}
            primary="**Primary**"
            secondary="Secondary content with wrapping words"
            tertiary="Tertiary"
            variant={variant}
            type={config.type}
            size={config.size}
            align={config.align}
            secondaryTone={config.tone}
            secondaryMaxLines={config.clamp ? 2 : undefined}
          />
        ))}
      </div>
    </>
  );
}
function App() {
  const [config, setConfig] = useState({
    mode: "light",
    size: "sm",
    type: "text",
    align: "left",
    tone: undefined,
    variant: "card",
    clamp: false,
    custom: false,
  });
  (window as any).configure = setConfig;
  return (
    <>
      <div id="unrelated">Host remains unchanged</div>
      <Core.ThemeProvider
        mode={config.mode as any}
        lightTheme={config.custom ? { textNeutralPrimary: "#123456", spaceM: "13px" } : undefined}
      >
        <section id="zone" data-ready={JSON.stringify(config)}>
          <Content config={config} />
          <Core.ThemeProvider mode="dark">
            <div id="nested">
              <Core.TextBlockView primary="Nested" secondary="Secondary" />
            </div>
          </Core.ThemeProvider>
        </section>
      </Core.ThemeProvider>
    </>
  );
}
createRoot(document.getElementById("app")!).render(<App />);
