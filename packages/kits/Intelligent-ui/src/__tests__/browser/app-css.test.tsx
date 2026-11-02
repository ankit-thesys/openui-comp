import { afterEach, describe, expect, it } from "vitest";
import { appCss, blue, page, read, removeAppCss, restyle, restyled } from "../helpers/app-css";
import { cleanup, renderProgram } from "../helpers/render";

afterEach(() => {
  cleanup();
  removeAppCss();
});

const kitLook = { button: "999px", title: "oklch(0.097 0 0)", card: "14px", badge: "oklch(0.097 0 0)", select: "10px" };

// Without a layer, the kit's rules carry the specificity they need to beat react-components'.
describe("without a layer, the app's own CSS", () => {
  it("loses with a single class when it loads first, as an app's stylesheet usually does", async () => {
    const scope = await renderProgram(page, { bare: true });
    await appCss(restyle);
    expect(read(scope)).toMatchObject(kitLook);
  });

  // The kit's rules weigh two classes (its own and react-components'), so a match has to load later.
  it("wins with two classes when it loads after the kit", async () => {
    const doubled = restyle.replace(/\.(openui-intelligent-[a-z-]+)/g, ".$1.$1");
    const scope = await renderProgram(page, { bare: true });
    await appCss(doubled, "after");
    expect(read(scope)).toEqual(restyled);
  });

  it("loses from any layer", async () => {
    const scope = await renderProgram(page, { bare: true });
    await appCss(`@layer app { ${restyle} }`);
    expect(read(scope)).toMatchObject(kitLook);
  });
});

describe("without a layer, the theme", () => {
  it("takes the app's ink from :root", async () => {
    const scope = await renderProgram(page, { bare: true, themeOnRoot: true });
    await appCss(`:root { --openui-intelligent-ink: ${blue}; }`);
    expect(read(scope)).toMatchObject({ title: blue, badge: blue, buttonFill: blue });
  });

  it("takes react-components' text colour", async () => {
    const scope = await renderProgram(page, { bare: true });
    await appCss(`:root { --openui-text-neutral-primary: ${blue}; }`);
    expect(read(scope)).toMatchObject({ title: blue, badge: blue, buttonFill: blue });
  });

  it("takes the app's dark ink", async () => {
    const amber = "rgb(255, 200, 0)";
    const scope = await renderProgram(page, { bare: true, theme: "dark" });
    await appCss(`[data-theme="dark"] { --openui-intelligent-ink: ${amber}; }`);
    expect(read(scope)).toMatchObject({ title: amber, badge: amber, buttonFill: amber });
  });
});
