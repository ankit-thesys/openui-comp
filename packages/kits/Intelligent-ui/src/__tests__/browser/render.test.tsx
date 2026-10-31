import { afterEach, describe, expect, it, vi } from "vitest";
import { programs, small } from "../helpers/cases";
import { cleanup, renderProgram } from "../helpers/render";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** A Badge inside Text puts a div in a p, listed below as a known problem. */
const known = /cannot be a descendant|cannot contain a nested/;

describe("every program", () => {
  it.each(programs)("$id draws without errors", async ({ code }) => {
    const errors = vi.spyOn(console, "error");
    const container = await renderProgram(code);

    expect(container.renderErrors).toEqual([]);
    expect(container.querySelector("main")?.children.length).toBeGreaterThan(0);
    expect(container.textContent).not.toMatch(/\bNaN\b|\[object Object\]/);
    const unexpected = errors.mock.calls.map((call) => String(call[0])).filter((text) => !known.test(text));
    expect(unexpected).toEqual([]);
  });

  it.each(programs)("$id gives every element it styles a stable class", async ({ code }) => {
    const container = await renderProgram(code);
    const unnamed = [...container.querySelectorAll<Element>("main [class]")].filter((element) => {
      const classes = [...element.classList];
      return classes.length > 0 && classes.every((name) => /^go\d+$/.test(name));
    });
    expect(unnamed.map((element) => element.outerHTML.slice(0, 120))).toEqual([]);
  });

  it.each(programs)("$id draws in dark mode with no errors", async ({ code }) => {
    const container = await renderProgram(code, { theme: "dark" });
    expect(container.renderErrors).toEqual([]);
  });
});

describe("known problems", () => {
  // These pass while the problem exists and fail once it's fixed, which is the reminder to delete them.
  it.fails("a Badge inside Text is valid HTML", async () => {
    const container = await renderProgram(small.badgeInText);
    expect(container.querySelector("p div")).toBeNull();
  });
});
