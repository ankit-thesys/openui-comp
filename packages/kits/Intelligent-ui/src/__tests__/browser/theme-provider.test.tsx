import { ThemeProvider } from "@openuidev/react-components";
import { Renderer } from "@openuidev/react-lang";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { IntelligentUiThemeProvider } from "../../components/IntelligentUiThemeProvider";
import { library } from "../../lib";
import { byText, cleanup, renderProgram, settle, style } from "../helpers/render";

const page = `root = Col([Title("Report"), Badge("Done", "success"), Badge("Late", "danger")])`;
const badgeInk = (scope: HTMLElement, text: string) => style(byText(scope, text).closest(".openui-intelligent-badge")!).color;

const roots: Root[] = [];
afterEach(() => {
  cleanup();
  for (const root of roots.splice(0)) root.unmount();
  document.querySelectorAll("[data-test-host]").forEach((host) => host.remove());
});

describe("IntelligentUiThemeProvider", () => {
  it("gives the library's root the source app's status colours, light and dark", async () => {
    let scope = await renderProgram(page);
    expect(badgeInk(scope, "Done")).toBe("rgb(0, 128, 93)");
    expect(badgeInk(scope, "Late")).toBe("rgb(193, 50, 44)");
    cleanup();
    scope = await renderProgram(page, { theme: "dark" });
    expect(badgeInk(scope, "Done")).toBe("rgb(91, 207, 156)");
  });

  it("is added once, however deep the Cols go", async () => {
    const scope = await renderProgram(`root = Col([Col([Col([Text("Deep")])])])`);
    expect(scope.querySelectorAll(".openui-intelligent-theme")).toHaveLength(1);
  });

  it("wraps only the program's root, never a Col inside a Card", async () => {
    const scope = await renderProgram(`root = Card([Title("Hi"), inner])\ninner = Col([Text("In a card")])`);
    expect(scope.querySelectorAll(".openui-intelligent-theme")).toHaveLength(0);
    // The Card's spacing reaches the Col, its direct child.
    expect(style(scope.querySelector(".openui-intelligent-card > .openui-intelligent-col")!).marginTop).not.toBe("0px");
  });

  it("keeps an app's own token over the kit's default", async () => {
    const scope = await renderProgram(page, { overrides: { textSuccessPrimary: "rgb(1, 2, 3)" } });
    expect(badgeInk(scope, "Done")).toBe("rgb(1, 2, 3)");
    expect(badgeInk(scope, "Late")).toBe("rgb(193, 50, 44)");
  });

  it("keeps an app's brand rather than resetting it to react-components' defaults", async () => {
    const scope = await renderProgram(page, { overrides: { textNeutralPrimary: "rgb(29, 78, 216)" } });
    expect(style(byText(scope, "Report")).color).toBe("rgb(29, 78, 216)");
  });

  it("lets a light and a dark output share a page", async () => {
    const mount = (mode: "light" | "dark") => {
      const host = document.body.appendChild(document.createElement("div"));
      host.setAttribute("data-test-host", mode);
      const root = createRoot(host);
      roots.push(root);
      root.render(
        <ThemeProvider mode={mode} cssSelector={`[data-test-host="${mode}"]`}>
          <Renderer response={page} library={library} isStreaming={false} />
        </ThemeProvider>,
      );
      return host;
    };
    const [light, dark] = [mount("light"), mount("dark")];
    await settle(300);
    expect(badgeInk(light, "Done")).toBe("rgb(0, 128, 93)");
    expect(badgeInk(dark, "Done")).toBe("rgb(91, 207, 156)");
  });

  it("can be used on its own, with a mode and the kit's theme", async () => {
    const host = document.body.appendChild(document.createElement("div"));
    host.setAttribute("data-test-host", "own");
    const root = createRoot(host);
    roots.push(root);
    root.render(
      <IntelligentUiThemeProvider mode="dark" darkTheme={{ textDangerPrimary: "rgb(250, 0, 0)" }}>
        <Renderer response={page} library={library} isStreaming={false} />
      </IntelligentUiThemeProvider>,
    );
    await settle(300);
    expect(badgeInk(host, "Late")).toBe("rgb(250, 0, 0)");
    expect(badgeInk(host, "Done")).toBe("rgb(91, 207, 156)");
    expect(host.querySelectorAll(".openui-intelligent-theme")).toHaveLength(1);
  });
});
