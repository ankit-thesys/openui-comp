// Node seam: the built package, imported by its public name, renders on the server.
// Run after `pnpm build`: `pnpm test`.
import { Button } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

describe("built package in Node", () => {
  it("server-renders a Button with its stable class", () => {
    const html = renderToString(<Button>Save</Button>);

    expect(html).toMatch(/^<button[^>]*class="[^"]*\bopenui-button-root\b/);
    expect(html).toContain(">Save</button>");
  });
});
