// Node seam: `configureStyles({ order })` declares the app's whole layer order ahead of every
// component layer in a server render, since the server's tags go first in <head> (#180).
import { Button, configureStyles } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";

const defaultsTag = (html: string) =>
  /<style[^>]*data-precedence="openui-defaults"[^>]*>([\s\S]*?)<\/style>/.exec(html)?.[1] ?? "";
const componentTags = (html: string) =>
  [...html.matchAll(/<style[^>]*data-precedence="openui"[^>]*>([\s\S]*?)<\/style>/g)]
    .map((match) => match[1])
    .join("");

afterEach(() => configureStyles({ layer: undefined }));

it("declares the configured layer order first, before any component layer", () => {
  configureStyles({ layer: "openui", order: "theme, base, openui, components, utilities" });
  const html = renderToString(<Button>Save</Button>);

  expect(defaultsTag(html).startsWith("@layer theme, base, openui, components, utilities;")).toBe(
    true,
  );
  expect(html.indexOf("@layer theme, base")).toBeLessThan(html.indexOf("@layer openui{"));
  expect(componentTags(html)).toMatch(/^@layer openui\{/);
});

it("declares no order unless one is configured", () => {
  configureStyles({ layer: "openui" });
  expect(defaultsTag(renderToString(<Button>Save</Button>))).toMatch(/^@layer openui-defaults;/);
});

it("ignores an order that is not a list of cascade layer names", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    configureStyles({ layer: "openui", order: "theme, {base}" });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('order "theme, {base}"'));
    expect(defaultsTag(renderToString(<Button>Save</Button>))).toMatch(/^@layer openui-defaults;/);
  } finally {
    warn.mockRestore();
  }
});
