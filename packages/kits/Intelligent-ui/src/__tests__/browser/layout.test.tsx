import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { program, programs, small } from "../helpers/cases";
import { box, cleanup, one, renderProgram, settle, style } from "../helpers/render";

afterEach(async () => {
  cleanup();
  await page.viewport(1280, 900);
});

describe("at phone width", () => {
  it.each(programs)("$id doesn't scroll sideways", async ({ code }) => {
    await page.viewport(390, 800);
    await renderProgram(code);
    const { scrollWidth, clientWidth } = document.documentElement;
    expect(scrollWidth - clientWidth).toBeLessThanOrEqual(1);
  });

  it("stacks a Grid", async () => {
    await page.viewport(390, 800);
    const container = await renderProgram(small.grid);
    const cards = [...container.querySelectorAll(".openui-intelligent-card")];
    expect(box(cards[1]!).top).toBeGreaterThan(box(cards[0]!).bottom - 1);
  });

  it("stacks radio cards", async () => {
    await page.viewport(390, 800);
    const container = await renderProgram(small.radioCards);
    const tops = [...container.querySelectorAll(".openui-option-cards-card")].map((card) => Math.round(box(card).top));
    expect(new Set(tops).size).toBe(3);
  });
});

describe("at desktop width", () => {
  it("puts a Grid's children side by side", async () => {
    const container = await renderProgram(small.grid);
    const cards = [...container.querySelectorAll(".openui-intelligent-card")];
    expect(Math.round(box(cards[0]!).top)).toBe(Math.round(box(cards[1]!).top));
    expect(box(cards[1]!).left).toBeGreaterThan(box(cards[0]!).right - 1);
  });

  it("keeps a Card's contents inside it", async () => {
    const container = await renderProgram(`root = Card([Card([Text("Inner")]), Input($a, "Name")])\n$a = ""`);
    const outer = one(container, ".openui-intelligent-card");
    for (const child of outer.querySelectorAll(".openui-intelligent-card, input")) {
      expect(box(child).right).toBeLessThanOrEqual(box(outer).right);
    }
  });

  it("keeps a chart inside its card", async () => {
    const container = await renderProgram(program("chart"));
    await settle(300);
    const outer = one(container, ".openui-intelligent-card");
    const chart = one(container, "[class*=chart]");
    expect(box(chart).right).toBeLessThanOrEqual(box(outer).right + 1);
    expect(box(chart).height).toBeGreaterThan(100);
  });

  it("gives a Map a real size", async () => {
    const container = await renderProgram(program("map"));
    const canvas = one(container, ".maplibregl-canvas");
    expect(box(canvas).width).toBeGreaterThan(300);
    expect(box(canvas).height).toBeGreaterThan(200);
  });
});

describe("HtmlView", () => {
  it("sandboxes its content so it can't reach the host page", async () => {
    const container = await renderProgram(program("html"));
    const frame = one<HTMLIFrameElement>(container, "iframe");
    expect(frame.sandbox.contains("allow-scripts")).toBe(true);
    expect(frame.sandbox.contains("allow-same-origin")).toBe(false);
    expect(box(frame).height).toBeGreaterThan(100);
    expect(style(frame).display).not.toBe("none");
  });
});
