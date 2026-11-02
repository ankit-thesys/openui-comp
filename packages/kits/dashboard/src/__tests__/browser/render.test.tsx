import { afterEach, describe, expect, it, vi } from "vitest";
import { cases } from "../helpers/cases";
import { cleanup, renderProgram } from "../helpers/render";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("rendering", () => {
  it.each(cases)("$id draws without errors", async ({ program }) => {
    const errors = vi.spyOn(console, "error");
    const container = await renderProgram(program);

    expect(container.querySelector(".openui-dashboard")).not.toBeNull();
    expect(container.textContent).not.toMatch(/\bNaN\b|\[object Object\]/);
    expect(errors.mock.calls.map((call) => String(call[0]))).toEqual([]);
  });

  it.each(cases)("$id gives every element it styles a stable class", async ({ program }) => {
    const container = await renderProgram(program);
    const unnamed = [...container.querySelectorAll<Element>("[class]")].filter((element) => {
      const classes = [...element.classList];
      return classes.length > 0 && classes.every((name) => /^go\d+$/.test(name));
    });
    expect(unnamed.map((element) => element.outerHTML.slice(0, 120))).toEqual([]);
  });

  it("draws every chart type in the charts program", async () => {
    const container = await renderProgram(cases.find(({ id }) => id === "charts")!.program);
    for (const name of ["area", "radar", "radial", "scatter"]) {
      expect(
        container.querySelector(`.openui-${name}-chart-svg, .openui-${name}-chart-svg-wrapper`),
        name,
      ).not.toBeNull();
    }
    expect(container.querySelectorAll("svg path, svg circle, svg rect").length).toBeGreaterThan(20);
  });
});
