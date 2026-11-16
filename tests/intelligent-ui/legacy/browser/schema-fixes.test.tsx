import { afterEach, describe, expect, it } from "vitest";
import { library } from "../../lib";
import { cleanup, renderProgram } from "../helpers/render";

afterEach(cleanup);

const spec = library.toSpec() as unknown as {
  components: Record<string, { signature: string }>;
};
const SHAPES = ["Circle", "Ellipse", "Rect", "Line", "Path", "Polyline", "Polygon", "SvgText"];

describe("the schema says what fits where", () => {
  it("types an Svg's and a G's children as shapes", () => {
    for (const shape of SHAPES) {
      expect(spec.components["Svg"]!.signature).toContain(shape);
      expect(spec.components["G"]!.signature).toContain(shape);
    }
    expect(spec.components["Svg"]!.signature).toContain("G");
    expect(spec.components["Svg"]!.signature).not.toContain("Node[]");
  });
});

describe("nothing a program writes disappears", () => {
  it("draws a shape that sits outside an Svg", async () => {
    const host = await renderProgram('root = Col([Text("Above"), Circle(50, 50, 30, "info")])');
    const circle = host.querySelector("circle")!;
    expect(circle.closest("svg")).not.toBeNull();
    expect(circle.getBoundingClientRect().width).toBeGreaterThan(0);
  });

  it("shows page components given to an Svg, below the drawing", async () => {
    const host = await renderProgram('root = Svg([Circle(50, 50, 30), Text("A caption for the drawing")], "0 0 100 100", 120, 120)');
    const text = [...host.querySelectorAll<HTMLElement>(".openui-intelligent-text")].find((e) => e.textContent?.includes("A caption"))!;
    expect(text).toBeTruthy();
    expect(text.closest("svg")).toBeNull();
    expect(text.getBoundingClientRect().height).toBeGreaterThan(0);
  });

  it("shows a MapMarker that sits outside a Map as a labelled place", async () => {
    const host = await renderProgram('root = Col([MapMarker("Ferry Building", 37.79, -122.39)])');
    expect(host.textContent).toContain("Ferry Building");
  });

  it("keeps a Badge inside Text valid HTML: no block inside a paragraph", async () => {
    const warnings: string[] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => warnings.push(String(args[0]));
    try {
      const host = await renderProgram('root = Text(["Status: ", Badge("Live", "success")])');
      expect(host.querySelector("p div, p p")).toBeNull();
      expect(host.textContent).toContain("Live");
      expect(warnings.filter((w) => /descendant|nested/.test(w))).toEqual([]);
    } finally {
      console.error = original;
    }
  });

  it("still uses a paragraph for plain text", async () => {
    const host = await renderProgram('root = Text("Just words")');
    expect(host.querySelector("p.openui-intelligent-text")).not.toBeNull();
  });
});
