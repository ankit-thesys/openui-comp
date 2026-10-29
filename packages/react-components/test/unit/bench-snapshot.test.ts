// Exercise the browser callback's CSSOM traversal without launching Chromium.
import { afterEach, expect, it, vi } from "vitest";
import { snapshotDeclaredStyles } from "../browser/bench/snapshot";

class StyleRule {
  constructor(
    public selectorText: string,
    declarations: Record<string, string>,
  ) {
    this.style = Object.assign(Object.keys(declarations), {
      getPropertyValue: (property: string) => declarations[property] ?? "",
    });
  }
  style: string[] & { getPropertyValue: (property: string) => string };
}
class GroupRule {
  constructor(public cssRules: (StyleRule | GroupRule)[]) {}
}
class MediaRule extends GroupRule {
  constructor(
    public conditionText: string,
    rules: StyleRule[],
  ) {
    super(rules);
  }
}
interface ElementFixture {
  classList: string[];
  inRoot: boolean;
  matches: (selector: string) => boolean;
  values: Record<string, string>;
  getAnimations: () => Animation[];
}

function browser(rules: (StyleRule | GroupRule)[], elements: ElementFixture[]) {
  const finish = vi.fn();
  const getAnimations = vi.fn(() => [{ finish }]);
  vi.stubGlobal("CSSStyleRule", StyleRule);
  vi.stubGlobal("CSSGroupingRule", GroupRule);
  vi.stubGlobal("CSSMediaRule", MediaRule);
  vi.stubGlobal("matchMedia", (condition: string) => ({ matches: condition === "screen" }));
  vi.stubGlobal("document", {
    getElementById: () => ({ sheet: { cssRules: rules } }),
    querySelectorAll: (selector: string) =>
      elements.filter(
        (element) =>
          element.classList.includes(selector.split(".").at(-1)!) &&
          (!selector.startsWith("#root ") || element.inRoot),
      ),
    getAnimations,
  });
  vi.stubGlobal("getComputedStyle", (element: ElementFixture) => ({
    getPropertyValue: (property: string) => element.values[property] ?? "",
  }));
  return { finish, getAnimations };
}
afterEach(() => vi.unstubAllGlobals());

it("keeps rule order, states, legacy selectors, layers and active media, including portal parts", () => {
  const matches = vi.fn((selector: string) =>
    [
      ".go1",
      ".go2[data-state=active]",
      ".ancestor .go1",
      ".go1:hover",
      ".go1:not([hidden])",
    ].includes(selector),
  );
  const element: ElementFixture = {
    classList: ["go2", "openui-mark", "go1"],
    inRoot: true,
    matches,
    values: { fill: "rgb(1, 2, 3)", opacity: "0.8", color: "rgb(4, 5, 6)", width: "480px" },
    getAnimations: vi.fn(() => []),
  };
  const portal = { ...element, classList: ["openui-portal", "go1", "go2"], inRoot: false };
  const { finish, getAnimations } = browser(
    [
      new StyleRule(".go1", { fill: "red", width: "50%" }),
      new StyleRule(".go2[data-state=active]", { width: "100%" }),
      new GroupRule([new StyleRule(".ancestor .go1", { color: "blue" })]),
      new MediaRule("screen", [new StyleRule(".go1:hover", { opacity: "0.8" })]),
      new MediaRule("print", [new StyleRule(".go1", { display: "none" })]),
      new StyleRule(".go1:not([hidden])", { fill: "green" }),
      new StyleRule(".go3", { display: "block" }),
    ],
    [element, portal],
  );
  const expected = {
    fill: "rgb(1, 2, 3)",
    color: "rgb(4, 5, 6)",
    opacity: "0.8",
    width: "declared 100%",
  };
  expect(snapshotDeclaredStyles(["openui-mark", "openui-portal"])).toEqual({
    "openui-mark #0": expected,
    "openui-portal #0": expected,
  });
  expect(getAnimations).toHaveBeenCalledTimes(1);
  expect(finish).toHaveBeenCalledTimes(1);
  expect(element.getAnimations).not.toHaveBeenCalled();
});

it("samples every mark without matching every unrelated rule against it", () => {
  const count = 1000;
  const elements = Array.from({ length: count }, (_, i) => ({
    classList: ["openui-mark", `go${i}`],
    inRoot: true,
    matches: vi.fn((selector: string) => selector === `.go${i}`),
    values: { fill: `color-${i}` },
    getAnimations: vi.fn(() => []),
  }));
  browser(
    elements.map((_, i) => new StyleRule(`.go${i}`, { fill: `color-${i}` })),
    elements,
  );
  const actual = snapshotDeclaredStyles(["openui-mark"]);
  expect(Object.keys(actual)).toHaveLength(count);
  for (const [i, element] of elements.entries()) {
    expect(actual[`openui-mark #${i}`]).toEqual(element.values);
    expect(element.matches).toHaveBeenCalledTimes(1);
  }
});
