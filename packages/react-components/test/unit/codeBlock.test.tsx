// CodeBlock's public class props, server-rendered through the package's public exports.
import { CodeBlock } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

const classesOf = (html: string, marker: string) =>
  [...html.matchAll(/class="([^"]*)"/g)]
    .map((match) => match[1]!.split(/\s+/))
    .find((names) => names.includes(marker));

describe("CodeBlock class props", () => {
  it("adds className to the wrapper next to its own classes", () => {
    const html = renderToString(<CodeBlock language="text" codeString="x" className="app-code" />);
    expect(classesOf(html, "app-code")).toContain("openui-code-block-wrapper");
  });

  it("keeps the default highlighter class unless one is given", () => {
    const html = renderToString(<CodeBlock language="text" codeString="x" />);
    expect(html).toContain("openui-code-block-syntax-highlighter");
  });

  it("replaces the highlighter class with syntaxHighlighterClassName", () => {
    const html = renderToString(
      <CodeBlock language="text" codeString="x" syntaxHighlighterClassName="app-highlighter" />,
    );
    expect(html).toContain("app-highlighter");
    expect(html).not.toContain("openui-code-block-syntax-highlighter");
  });
});
