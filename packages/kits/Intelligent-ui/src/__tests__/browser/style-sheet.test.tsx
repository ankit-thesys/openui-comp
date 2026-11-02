// First, so every rule below is written into the layer.
import { describe, expect, it } from "vitest";
import * as kit from "../../index";
import "../helpers/style-layer";

const sheet = (id: string) => document.getElementById(id)?.textContent ?? "";
const written = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("the kit's styles", () => {
  it("go in react-components' style tag, inside the app's layer", async () => {
    expect(kit.Badge).toBeTypeOf("function");
    await written();
    const shared = sheet("openui-styles");
    expect(shared).toContain("--_openui-intelligent-badge-fill");
    expect(shared.startsWith("@layer kit-test{")).toBe(true);
  });

  it("are all there is: no tag of the kit's own, and no global theme", async () => {
    await written();
    expect(sheet("_goober")).not.toContain("openui-intelligent");
    expect(getComputedStyle(document.documentElement).getPropertyValue("--openui-intelligent-ink")).toBe("");
  });
});

describe("the theme", () => {
  const ink = (element: Element) =>
    getComputedStyle(element).getPropertyValue("--openui-intelligent-ink").trim();

  it("gives way to an app's own colours, even when the app's CSS loads first", async () => {
    await written();
    // An app's stylesheet usually sits ahead of the kit's runtime tags in <head>.
    const app = document.createElement("style");
    app.textContent = ":root { --openui-intelligent-ink: rgb(0, 0, 255); }";
    document.head.prepend(app);
    try {
      expect(ink(document.documentElement)).toBe("rgb(0, 0, 255)");
    } finally {
      app.remove();
    }
  });


});
