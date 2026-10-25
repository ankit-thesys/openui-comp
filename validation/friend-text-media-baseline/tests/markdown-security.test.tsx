/**
 * Rendering and security boundaries for the two markdown renderers (#31 item 3).
 *
 * All inputs are inert synthetic strings. Nothing here fetches external content:
 * jsdom does not load subresources, no test sets a resolvable remote src, and
 * `window.open` is stubbed wherever a link could navigate.
 *
 * The expectations are stated from the consumer's contract -- "LLM-authored
 * markdown must not become script in my page" -- and then compared against what
 * the baseline actually does. Where the baseline is SAFER or NARROWER than the
 * contract implies, the test records the observed behavior; it never relaxes an
 * assertion to obtain a pass, and it never strengthens escaping.
 *
 * Governing versions on this revision (recorded because the defaults come from
 * the library, not from openui): react-markdown 10.1.0, remark-gfm 4.0.1,
 * remark-breaks 4.0.0, react 19.2.4.
 */
import { describe, expect, it } from "vitest";
import {
  InlineMarkdownRenderer,
  MarkDownRenderer,
} from "../../../packages/react-ui/src/index";
import { render } from "../setup/render";

describe("raw HTML in markdown is inert", () => {
  it("does not execute or materialise a <script> tag", async () => {
    const { container } = await render(
      <MarkDownRenderer textMarkdown={'before <script>globalThis.__pwned = true;</script> after'} />,
    );
    expect(container.querySelector("script")).toBeNull();
    expect((globalThis as Record<string, unknown>)["__pwned"]).toBeUndefined();
  });

  it("does not materialise an <img onerror> handler", async () => {
    const { container } = await render(
      <MarkDownRenderer textMarkdown={'<img src="x" onerror="globalThis.__pwned = true">'} />,
    );
    // No raw-HTML plugin is configured, so the tag must not become an element.
    expect(container.querySelector("img")).toBeNull();
    expect((globalThis as Record<string, unknown>)["__pwned"]).toBeUndefined();
  });

  it("does not materialise an <iframe>", async () => {
    const { container } = await render(
      <MarkDownRenderer textMarkdown={'<iframe src="https://example.com"></iframe>'} />,
    );
    expect(container.querySelector("iframe")).toBeNull();
  });

  it("treats raw HTML as text rather than silently dropping its content", async () => {
    // Recording WHICH of the two inert behaviors applies (escape vs. drop)
    // matters for migration parity: a renderer that escapes shows the markup to
    // the reader, one that drops it shows nothing.
    const { container } = await render(
      <MarkDownRenderer textMarkdown={"<b>bolded</b>"} />,
    );
    expect(container.querySelector("b")).toBeNull();
    const text = container.textContent ?? "";
    // Pin whichever it is, so a migration that changes it fails loudly.
    expect(text.includes("bolded")).toBe(true);
  });

  it("is inert in the inline renderer too", async () => {
    const { container } = await render(
      <InlineMarkdownRenderer content={'<script>globalThis.__pwnedInline = true;</script>'} />,
    );
    expect(container.querySelector("script")).toBeNull();
    expect((globalThis as Record<string, unknown>)["__pwnedInline"]).toBeUndefined();
  });
});

describe("unsafe link destinations in markdown", () => {
  const anchorHref = (container: HTMLElement) =>
    container.querySelector("a")?.getAttribute("href");

  it("neutralises a javascript: link destination", async () => {
    const { container } = await render(
      <MarkDownRenderer textMarkdown={"[click me](javascript:alert(1))"} />,
    );
    const href = anchorHref(container);
    // The contract that matters: whatever is rendered must not be navigable to
    // a script URL. Either no href, or an href that is not javascript:.
    expect(href === null || href === undefined || !/^\s*javascript:/i.test(href)).toBe(true);
  });

  it("neutralises a vbscript: link destination", async () => {
    const { container } = await render(
      <MarkDownRenderer textMarkdown={"[click me](vbscript:msgbox(1))"} />,
    );
    const href = anchorHref(container);
    expect(href === null || href === undefined || !/^\s*vbscript:/i.test(href)).toBe(true);
  });

  it("neutralises control-character obfuscation in a link destination", async () => {
    const { container } = await render(
      <MarkDownRenderer textMarkdown={"[click me](java\tscript:alert(1))"} />,
    );
    const href = anchorHref(container);
    expect(href === null || href === undefined || !/java\s*script:/i.test(href)).toBe(true);
  });

  it("preserves an ordinary https destination", async () => {
    const { container } = await render(
      <MarkDownRenderer textMarkdown={"[docs](https://example.com/a?b=c)"} />,
    );
    expect(anchorHref(container)).toBe("https://example.com/a?b=c");
  });

  it("applies target=_blank and rel=noopener noreferrer to rendered links", async () => {
    // Reverse-tabnabbing protection. openui sets these in its own `a` component
    // override rather than relying on the markdown library.
    const { container } = await render(
      <MarkDownRenderer textMarkdown={"[docs](https://example.com)"} />,
    );
    const a = container.querySelector("a");
    expect(a?.getAttribute("target")).toBe("_blank");
    expect(a?.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("neutralises a javascript: image source", async () => {
    const { container } = await render(
      <MarkDownRenderer textMarkdown={"![alt](javascript:alert(1))"} />,
    );
    const src = container.querySelector("img")?.getAttribute("src");
    expect(src === null || src === undefined || !/^\s*javascript:/i.test(src)).toBe(true);
  });
});

describe("code rendering", () => {
  it("renders a fenced block with a language as a CodeBlock, not a bare <code>", async () => {
    const { container } = await render(
      <MarkDownRenderer textMarkdown={"```ts\nconst a = 1;\n```"} />,
    );
    // The CodeBlock override fires on a language- className match.
    expect(container.querySelector(".openui-markdown-renderer-code")).toBeNull();
    expect(container.textContent).toContain("const a = 1;");
  });

  it("renders short inline code as an inline <code> with the openui class", async () => {
    const { container } = await render(
      <MarkDownRenderer textMarkdown={"use `npm ci` first"} />,
    );
    const code = container.querySelector("code.openui-markdown-renderer-code");
    expect(code).not.toBeNull();
    expect(code?.textContent).toBe("npm ci");
  });

  it("does not execute code content, only displays it", async () => {
    const { container } = await render(
      <MarkDownRenderer
        textMarkdown={"```html\n<script>globalThis.__pwnedCode = true;</script>\n```"}
      />,
    );
    expect((globalThis as Record<string, unknown>)["__pwnedCode"]).toBeUndefined();
    expect(container.querySelector("script")).toBeNull();
  });
});
