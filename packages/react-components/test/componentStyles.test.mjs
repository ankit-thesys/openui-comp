// Run after `pnpm run build`: exercises the built ESM entry like a server would.
import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { Button, Card, getComponentStyles, ThemeProvider } from "../dist/index.mjs";

const render = () =>
  renderToString(
    createElement(
      ThemeProvider,
      null,
      createElement(Button, { variant: "primary" }, "Send"),
      createElement(Card, null, "Body"),
    ),
  );

const classesIn = (html) => [...html.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(" "));

test("every server render gets the full component stylesheet", () => {
  const first = getComponentStyles();
  const firstHtml = render();
  const second = getComponentStyles();
  const secondHtml = render();
  const third = getComponentStyles();

  assert.ok(first.length > 10_000, `first stylesheet is ${first.length} bytes`);
  assert.equal(second, first);
  assert.equal(third, first);
  assert.equal(secondHtml, firstHtml);

  const gooberClasses = classesIn(secondHtml).filter((c) => /^go\d+$/.test(c));
  assert.ok(gooberClasses.length > 0, "rendered markup has Goober classes");
  for (const c of gooberClasses) assert.ok(third.includes(`.${c}`), `stylesheet has .${c}`);
});
