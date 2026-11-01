// CodeBlock's public class props, server-rendered through the package's public exports.
import { CodeBlock, getComponentStyles } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

const importedCss = getComponentStyles();

const classesOf = (html: string, marker: string) =>
  [...html.matchAll(/class="([^"]*)"/g)]
    .map((match) => match[1]!.split(/\s+/))
    .find((names) => names.includes(marker));

describe("CodeBlock class props", () => {
  it("adds className to the wrapper next to its own classes", () => {
    const html = renderToString(<CodeBlock language="text" codeString="x" className="app-code" />);
    expect(classesOf(html, "app-code")).toContain("openui-code-block");
  });

  it("keeps the default highlighter class unless one is given", () => {
    const html = renderToString(<CodeBlock language="text" codeString="x" />);
    expect(html).toContain("openui-code-block-syntax-highlighter");
  });

  it("leaves the default frame free of inline styles so consumer CSS can override it", () => {
    const html = renderToString(<CodeBlock language="javascript" codeString="const x = 1;" />);
    const frame = html.match(
      /<div[^>]*class="[^"]*openui-code-block-syntax-highlighter[^>]*>/,
    )?.[0];
    expect(frame).toBeDefined();
    expect(frame).not.toContain("style=");
    // The frame migration must not disable the vendor's code and token theme.
    expect(html).toContain("color:#9cdcfe");
    expect(html).toContain("color:#569CD6");
  });

  it("preserves explicit theme maps through the vendor API", () => {
    const html = renderToString(
      <CodeBlock
        language="text"
        codeString="x"
        theme={{
          'pre[class*="language-"]': { color: "red", padding: "12px" },
        }}
      />,
    );
    expect(html).toContain('style="color:red;padding:12px"');
  });

  it("replaces the highlighter class with syntaxHighlighterClassName", () => {
    const html = renderToString(
      <CodeBlock language="text" codeString="x" syntaxHighlighterClassName="app-highlighter" />,
    );
    expect(html).toContain("app-highlighter");
    expect(html).not.toContain("openui-code-block-syntax-highlighter");
    // Replacing the class opts out of frame rules, retaining the vendor's theme and margin.
    expect(html).toContain("margin:.5em 0");
  });
});

it("registers CodeBlock's flat copy-button state rules on import, with no render-time additions", () => {
  expect(importedCss).toContain("--_openui-code-block-copy-button-opacity");
  const html = renderToString(<CodeBlock language="text" codeString="x" />);
  expect(html).toContain('data-state="idle"');
  expect(html).not.toContain("openui-code-block-root");
  const generated = [...html.matchAll(/\bgo\d+\b/g)].map(([name]) => name);
  expect(generated.length).toBeGreaterThan(0);
  for (const name of generated) expect(importedCss).toMatch(new RegExp(`\\.${name}(?![0-9])`));
  expect(importedCss).toMatch(/\[data-state="?copied"?\]/);
  expect(getComponentStyles()).toBe(importedCss);
});
