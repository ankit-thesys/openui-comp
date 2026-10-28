import { MarkDownRenderer } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import remarkGfm from "remark-gfm";
import { expect, it } from "vitest";

it("defaults to clear and always emits the markdown variant modifier", () => {
  for (const variant of [undefined, "clear", "card", "sunk"] as const) {
    const html = renderToString(
      <MarkDownRenderer variant={variant} className="consumer-markdown" textMarkdown="Paragraph" />,
    );
    const classes = html.match(/^<div class="([^"]*)"/)![1]!.split(" ");
    expect(classes).toEqual(
      expect.arrayContaining([
        "openui-markdown-renderer",
        `openui-markdown-renderer--variant-${variant ?? "clear"}`,
        "consumer-markdown",
      ]),
    );
    expect(
      classes.filter((name) => name.startsWith("openui-markdown-renderer--variant-")),
    ).toHaveLength(1);
  }
});

it("keeps stable classes on the elements markdown replaces", () => {
  const html = renderToString(
    <MarkDownRenderer
      options={{ remarkPlugins: [remarkGfm] }}
      textMarkdown={
        "`inline` [link](https://example.com)\n\n```js\nconst x = 1;\n```\n\n| A |\n| - |\n| B |"
      }
    />,
  );
  for (const [tag, part] of [
    ["code", "code"],
    ["a", "link"],
    ["div", "code-block"],
    ["table", "table"],
    ["div", "table-container"],
  ]) {
    expect(html).toMatch(
      new RegExp(`<${tag}[^>]* class="[^"]*\\bopenui-markdown-renderer-${part}(?= |")`),
    );
  }
  expect(html).not.toContain("openui-mark-down-renderer-markdown-");
});

it("lets caller components win over defaults, including tables and code blocks", () => {
  const html = renderToString(
    <MarkDownRenderer
      textMarkdown={
        "[Link](https://example.com) `inline`\n\n```js\nblock\n```\n\n| A |\n| --- |\n| B |"
      }
      options={{
        remarkPlugins: [remarkGfm],
        components: {
          p: ({ children }) => <section>{children}</section>,
          a: ({ href, children }) => (
            <a href={href} data-consumer="link">
              {children}
            </a>
          ),
          code: ({ children }) => <kbd>{children}</kbd>,
          table: () => <div data-consumer="table">Custom table</div>,
        },
      }}
    />,
  );
  expect(html).toContain(
    '<section><a href="https://example.com" data-consumer="link">Link</a> <kbd>inline</kbd></section>',
  );
  expect(html).toContain("<pre><kbd>block\n</kbd></pre>");
  expect(html).toContain('<div data-consumer="table">Custom table</div>');
  expect(html).not.toContain("openui-markdown-renderer-code");
  expect(html).not.toContain("openui-markdown-renderer-link");
  expect(html).not.toContain("openui-markdown-renderer-table");
});
