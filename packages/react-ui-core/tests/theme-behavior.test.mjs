import {
  defaultDarkTheme,
  defaultLightTheme,
  THEME_MODE_ATTRIBUTE,
  THEME_MODE_STORAGE_KEY,
  ThemeProvider,
  useTheme,
  useThemeModePreference,
} from "@openuidev/react-ui-core";
import { JSDOM } from "jsdom";
import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { act, createElement as h } from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";

let dom, root, mediaListeners, darkSystem;
beforeEach(() => {
  dom = new JSDOM(
    '<!doctype html><html><head></head><body><main></main><aside id="portal"></aside></body></html>',
    { url: "https://consumer.test", pretendToBeVisual: true },
  );
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  darkSystem = false;
  mediaListeners = new Set();
  window.matchMedia = () => ({
    matches: darkSystem,
    addEventListener: (_, listener) => mediaListeners.add(listener),
    removeEventListener: (_, listener) => mediaListeners.delete(listener),
  });
  root = createRoot(document.querySelector("main"));
});
afterEach(async () => {
  await act(() => root.unmount());
  assert.equal(document.querySelectorAll("style[data-openui-theme]").length, 0);
  assert.equal(mediaListeners.size, 0);
  dom.window.close();
  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
});

function Probe({ id = "probe", portal = false }) {
  const { mode, theme, portalThemeClassName } = useTheme();
  const content = h(
    "output",
    {
      id,
      "data-mode": mode,
      "data-accent": theme.interactiveAccentDefault,
      className: portal ? portalThemeClassName : undefined,
    },
    theme.background,
  );
  return portal ? createPortal(content, document.getElementById("portal")) : content;
}
const mount = async (node) => act(() => root.render(node));
const probe = (id = "probe") => document.getElementById(id);
const brand = "oklch(0.6 0.2 260 / 1)";

test("default hook, mode changes and partial light/dark overrides retain the existing contract", async () => {
  await mount(h(Probe));
  assert.equal(probe().dataset.mode, "light");
  assert.equal(probe().textContent, defaultLightTheme.background);
  await mount(h(ThemeProvider, { lightTheme: { interactiveAccentDefault: brand } }, h(Probe)));
  assert.equal(probe().dataset.accent, brand);
  assert.equal(probe().textContent, defaultLightTheme.background);
  await mount(
    h(ThemeProvider, { mode: "dark", lightTheme: { interactiveAccentDefault: brand } }, h(Probe)),
  );
  assert.equal(probe().dataset.mode, "dark");
  assert.equal(probe().textContent, defaultDarkTheme.background);
  assert.equal(probe().dataset.accent, brand);
  const dark = "oklch(0.4 0.15 260 / 1)";
  await mount(
    h(
      ThemeProvider,
      {
        mode: "dark",
        lightTheme: { interactiveAccentDefault: brand },
        darkTheme: { interactiveAccentDefault: dark },
      },
      h(Probe),
    ),
  );
  assert.equal(probe().dataset.accent, dark);
  assert.equal(document.querySelectorAll("style[data-openui-theme]").length, 1);
  assert(
    document
      .querySelector("style[data-openui-theme]")
      .textContent.includes(`--openui-interactive-accent-default: ${dark};`),
  );
});

test("nested and explicitly independent providers retain their selectors and portal scope", async () => {
  await mount(
    h(
      "div",
      null,
      h(
        ThemeProvider,
        { mode: "dark", cssSelector: "#left", lightTheme: { interactiveAccentDefault: brand } },
        h(
          "section",
          { id: "left" },
          h(Probe, { id: "outer" }),
          h(
            ThemeProvider,
            { lightTheme: { interactiveAccentDefault: "oklch(0.5 0.1 120 / 1)" } },
            h(Probe, { id: "inner", portal: true }),
          ),
        ),
      ),
      h(
        ThemeProvider,
        { mode: "light", cssSelector: "#right" },
        h("section", { id: "right" }, h(Probe, { id: "independent" })),
      ),
    ),
  );
  assert.equal(probe("outer").dataset.mode, "dark");
  assert.equal(probe("inner").dataset.mode, "dark");
  assert.equal(probe("independent").dataset.mode, "light");
  assert.equal(probe("outer").dataset.accent, brand);
  const styles = [...document.querySelectorAll("style[data-openui-theme]")].map(
    (e) => e.textContent,
  );
  assert.equal(styles.length, 3);
  assert(styles.some((s) => s.startsWith("#left,")));
  assert(styles.some((s) => s.startsWith("#right,")));
  assert(
    styles.some(
      (s) => s.startsWith(".openui-theme-") && s.includes(`.${probe("inner").className}`),
    ),
  );
  assert.equal(document.querySelectorAll('div[style="display: contents;"]').length, 1);
});

let preferenceAPI;
function PreferenceProbe() {
  preferenceAPI = useThemeModePreference();
  return h("output", { id: "preference" }, `${preferenceAPI.preference}/${preferenceAPI.mode}`);
}
test("saved preference, OS changes and system reset preserve storage and document attributes", async () => {
  window.localStorage.setItem(THEME_MODE_STORAGE_KEY, JSON.stringify("dark"));
  await mount(h(PreferenceProbe));
  assert.equal(probe("preference").textContent, "dark/dark");
  assert.equal(document.documentElement.getAttribute(THEME_MODE_ATTRIBUTE), "dark");
  await act(() => preferenceAPI.setPreference("light"));
  assert.equal(window.localStorage.getItem(THEME_MODE_STORAGE_KEY), JSON.stringify("light"));
  await act(() => preferenceAPI.setPreference("system"));
  assert.equal(window.localStorage.getItem(THEME_MODE_STORAGE_KEY), null);
  assert.equal(document.documentElement.hasAttribute(THEME_MODE_ATTRIBUTE), false);
  await act(() => {
    darkSystem = true;
    for (const listener of mediaListeners) listener();
  });
  assert.equal(probe("preference").textContent, "system/dark");
  assert.equal(document.documentElement.style.colorScheme, "dark");
});

test("unavailable preference storage does not prevent rendering or mode changes", async () => {
  Object.defineProperty(window, "localStorage", {
    get() {
      throw new Error("Blocked");
    },
  });
  await mount(h(PreferenceProbe));
  assert.equal(probe("preference").textContent, "system/light");
  await act(() => preferenceAPI.setPreference("dark"));
  assert.equal(probe("preference").textContent, "dark/dark");
});

test("an explicit selector on a nested provider bypasses automatic wrappers", async () => {
  await mount(
    h(
      ThemeProvider,
      { mode: "dark", cssSelector: "#parent" },
      h(
        "section",
        { id: "parent" },
        h(ThemeProvider, { cssSelector: "#nested" }, h("section", { id: "nested" }, h(Probe))),
      ),
    ),
  );
  assert.equal(probe().dataset.mode, "dark");
  assert.equal(document.querySelectorAll('div[style="display: contents;"]').length, 0);
  assert(
    [...document.querySelectorAll("style[data-openui-theme]")].some((style) =>
      style.textContent.startsWith("#nested,"),
    ),
  );
});

test("deprecated theme remains an alias and lightTheme takes precedence with warnings", async (t) => {
  const warnings = t.mock.method(console, "warn", () => {});
  await mount(h(ThemeProvider, { theme: { interactiveAccentDefault: brand } }, h(Probe)));
  assert.equal(probe().dataset.accent, brand);
  assert(warnings.mock.calls.some((call) => String(call.arguments[0]).includes('"theme" prop')));
  const preferred = "oklch(0.4 0.12 170 / 1)";
  await mount(
    h(
      ThemeProvider,
      {
        theme: { interactiveAccentDefault: brand },
        lightTheme: { interactiveAccentDefault: preferred },
      },
      h(Probe),
    ),
  );
  assert.equal(probe().dataset.accent, preferred);
  assert(
    warnings.mock.calls.some((call) =>
      String(call.arguments[0]).includes('"lightTheme" takes precedence'),
    ),
  );
});
