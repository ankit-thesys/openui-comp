// First, so every rule the kit writes goes into the app's layer.
import "../helpers/style-layer";
import { afterEach, describe, expect, it } from "vitest";
import { appCss, blue, page, read, removeAppCss, restyle, restyled } from "../helpers/app-css";
import { cleanup, renderProgram } from "../helpers/render";

afterEach(() => {
  cleanup();
  removeAppCss();
});

const kitLook = { button: "999px", title: "oklch(0.097 0 0)", card: "14px", badge: "oklch(0.097 0 0)", select: "10px" };

describe("with the kit in the app's layer, the app's own CSS", () => {
  it("wins with a single class, wherever it loads", async () => {
    for (const where of ["before", "after"] as const) {
      const scope = await renderProgram(page, { bare: true });
      await appCss(restyle, where);
      expect(read(scope), where).toEqual(restyled);
      cleanup();
      removeAppCss();
    }
  });

  it("wins from a layer the app orders after the kit's", async () => {
    const scope = await renderProgram(page, { bare: true });
    await appCss(`@layer kit-test, app; @layer app { ${restyle} }`);
    expect(read(scope)).toEqual(restyled);
  });

  it("loses from a layer the app orders before the kit's", async () => {
    const scope = await renderProgram(page, { bare: true });
    await appCss(`@layer app, kit-test; @layer app { ${restyle} }`);
    expect(read(scope)).toMatchObject(kitLook);
  });

  // Unlayered CSS beats every layer, so a page reset outside a layer beats the kit too.
  it("takes a solid Button's fill with an unlayered reset, and keeps it from a reset in an earlier layer", async () => {
    const reset = "button { background: transparent; }";
    let scope = await renderProgram(page, { bare: true });
    await appCss(reset);
    expect(read(scope).buttonFill).toBe("rgba(0, 0, 0, 0)");
    cleanup();
    removeAppCss();

    scope = await renderProgram(page, { bare: true });
    await appCss(`@layer reset, kit-test; @layer reset { ${reset} }`);
    expect(read(scope).buttonFill).toBe("oklch(0.097 0 0)");
  });
});

describe("with the kit in the app's layer, the theme", () => {
  it("takes the app's ink from :root", async () => {
    const scope = await renderProgram(page, { bare: true, themeOnRoot: true });
    await appCss(`:root { --openui-intelligent-ink: ${blue}; }`);
    expect(read(scope)).toMatchObject({ title: blue, badge: blue, buttonFill: blue });
  });

  it("takes react-components' text colour, so one token recolours both", async () => {
    const scope = await renderProgram(page, { bare: true });
    await appCss(`:root { --openui-text-neutral-primary: ${blue}; }`);
    expect(read(scope)).toMatchObject({ title: blue, badge: blue, buttonFill: blue });
  });

  it("takes the app's ink on a wrapper, for one part of the page", async () => {
    const scope = await renderProgram(page, { bare: true });
    scope.classList.add("brand");
    await appCss(`.brand { --openui-intelligent-ink: ${blue}; }`);
    expect(read(scope)).toMatchObject({ title: blue, badge: blue, buttonFill: blue });
  });

  // A [data-theme] wrapper sets the kit's ink again, so a light island in a dark page still reads.
  it("keeps its own ink inside a [data-theme] wrapper, unless the app sets it there too", async () => {
    let scope = await renderProgram(page, { bare: true });
    await appCss(`:root { --openui-intelligent-ink: ${blue}; }`);
    expect(read(scope).title).toBe("oklch(0.097 0 0)");
    cleanup();
    removeAppCss();

    scope = await renderProgram(page, { bare: true });
    await appCss(`:root, [data-theme="light"] { --openui-intelligent-ink: ${blue}; }`);
    expect(read(scope).title).toBe(blue);
  });

  it("takes the app's dark ink", async () => {
    const amber = "rgb(255, 200, 0)";
    const scope = await renderProgram(page, { bare: true, theme: "dark" });
    expect(read(scope).title).toBe("rgb(236, 236, 236)");
    await appCss(`[data-theme="dark"] { --openui-intelligent-ink: ${amber}; }`);
    expect(read(scope)).toMatchObject({ title: amber, badge: amber, buttonFill: amber });
  });
});
