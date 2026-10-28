// Node seam: getComponentStyles() gives every server response the CSS its markup uses.
// Styles register while components render, so a server renders first and collects afterwards.
// Ported from #73's node --test file.
import { Button, getComponentStyles, ThemeProvider } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

const generatedClasses = (html: string) =>
  [...html.matchAll(/class="([^"]*)"/g)]
    .flatMap((match) => match[1]!.split(" "))
    .filter((name) => /^go\d+$/.test(name));

const expectStylesFor = (html: string, css: string) => {
  const classes = generatedClasses(html);
  expect(classes.length).toBeGreaterThan(0);
  for (const name of classes) expect(css).toMatch(new RegExp(`\\.${name}(?![0-9])`));
};

describe("getComponentStyles", () => {
  it("returns the full stylesheet on every call, including rules registered by the render", () => {
    const html = renderToString(
      <ThemeProvider>
        <Button>Send</Button>
      </ThemeProvider>,
    );
    const first = getComponentStyles();
    const second = getComponentStyles();

    expect(second).toBe(first);
    expectStylesFor(html, first);
  });

  it("keeps a response's rules when another request collects first", () => {
    // Request A renders, then request B renders and collects before A does.
    const htmlA = renderToString(<Button variant="tertiary">A</Button>);
    const htmlB = renderToString(
      <Button variant="secondary" size="small" tone="destructive">
        B
      </Button>,
    );
    const cssB = getComponentStyles();
    const cssA = getComponentStyles();

    expectStylesFor(htmlB, cssB);
    expectStylesFor(htmlA, cssA);
  });

  it("never returns an empty string, so the browser can adopt the <style> it is inlined into", () => {
    // Goober writes into the first text node of an existing #_goober; an empty element has none.
    expect(getComponentStyles().length).toBeGreaterThan(0);
  });
});
