// Node seam: under a style nonce, React keeps a hoisted tag's rules only when the tag carries the
// same nonce. configureStyles({ nonce }) supplies the current request's nonce to every server tag.
import { Button, configureStyles, ThemeProvider } from "@openuidev/react-components";
import { Writable } from "node:stream";
import type { ReactNode } from "react";
import { renderToPipeableStream } from "react-dom/server";
import { afterEach, expect, it } from "vitest";

function render(element: ReactNode, nonce: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let html = "";
    const sink = new Writable({
      write(chunk, _encoding, done) {
        html += chunk;
        done();
      },
    });
    sink.on("finish", () => resolve(html));
    const stream = renderToPipeableStream(
      <html>
        <head />
        <body>{element}</body>
      </html>,
      { nonce: { style: nonce }, onAllReady: () => stream.pipe(sink), onError: reject },
    );
  });
}

/** Each hoisted tag of `precedence`: its nonce and how much CSS React kept in it. */
const tags = (html: string, precedence: string) =>
  [...html.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)]
    .filter(([, attrs]) => attrs!.includes(`data-precedence="${precedence}"`))
    .map(([, attrs, text]) => ({ nonce: /nonce="([^"]*)"/.exec(attrs!)?.[1], css: text!.length }));

afterEach(() => configureStyles({}));

it("keeps component, token-default and theme rules under the request's style nonce", async () => {
  let current = "first";
  configureStyles({ nonce: () => current });
  for (const nonce of ["first", "second"]) {
    current = nonce;
    const html = await render(
      <ThemeProvider mode="dark">
        <Button>Save</Button>
      </ThemeProvider>,
      nonce,
    );
    for (const precedence of ["openui", "openui-defaults", "openui-theme"]) {
      const found = tags(html, precedence);
      expect(found.length, precedence).toBeGreaterThan(0);
      for (const tag of found) {
        expect(tag.nonce, precedence).toBe(nonce);
        expect(tag.css, `${precedence} keeps its rules`).toBeGreaterThan(0);
      }
    }
  }
});
