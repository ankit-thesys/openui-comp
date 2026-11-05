import { ThemeProvider } from "@openuidev/react-components";
import * as maplibre from "maplibre-gl";
import type { ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { commands, userEvent } from "vitest/browser";
import { Code } from "../../components/Code";
import { HtmlView } from "../../components/HtmlView";
import { MapView } from "../../components/Map";
import { rasterStyle, vectorStyle } from "../../components/Map/parts/basemap";
import { Popover } from "../../components/Popover";
import { RadioGroup } from "../../components/RadioGroup";
import { one, settle } from "../helpers/render";

const places = [
  { key: "a", label: "First", lat: 37.77, lng: -122.42, icon: null, order: 1 },
  { key: "b", label: "Second", lat: 37.8, lng: -122.45, icon: null, order: 2 },
];

let mounted: { root: Root; host: HTMLElement }[] = [];

function mount(ui: ReactNode, attributes: Record<string, string> = {}) {
  const host = document.body.appendChild(document.createElement("div"));
  for (const [name, value] of Object.entries(attributes)) host.setAttribute(name, value);
  const root = createRoot(host);
  mounted.push({ root, host });
  root.render(ui);
  return host;
}

/** Renders new UI into the last mounted host, as a theme switch re-renders the app. */
const rerender = (ui: ReactNode) => mounted.at(-1)!.root.render(ui);

beforeAll(async () => {
  await commands.isolate();
});

afterEach(() => {
  for (const { root, host } of mounted) {
    root.unmount();
    host.remove();
  }
  mounted = [];
  document.documentElement.removeAttribute("data-openui-theme");
  vi.restoreAllMocks();
});

describe("Map, following the theme", () => {
  /** Records every style the map is given; the first call is the one the constructor makes. */
  const watchStyles = () => vi.spyOn(maplibre.Map.prototype, "setStyle");

  const styleGiven = (spy: ReturnType<typeof watchStyles>, index = -1) => spy.mock.calls.at(index)?.[0];

  const inMode = (mode: "light" | "dark") => (
    <ThemeProvider mode={mode}>
      <MapView places={places} />
    </ThemeProvider>
  );

  it("switches to light on the first toggle after loading dark", async () => {
    const spy = watchStyles();
    mount(inMode("dark"));
    await vi.waitFor(() => expect(spy).toHaveBeenCalled(), { timeout: 5000 });
    await settle(300);
    expect(styleGiven(spy, 0)).toEqual(vectorStyle(true));
    spy.mockClear();
    rerender(inMode("light"));
    await settle(300);
    expect(styleGiven(spy)).toEqual(vectorStyle(false));
  });

  it("keeps raster tiles when the theme changes after falling back to them", async () => {
    const spy = watchStyles();
    mount(inMode("light"));
    await vi.waitFor(() => expect(spy).toHaveBeenCalled(), { timeout: 5000 });
    const instance = spy.mock.contexts[0] as maplibre.Map;
    instance.fire("error", { error: new Error("The vector tiles are down") });
    expect(styleGiven(spy)).toEqual(rasterStyle(false));
    spy.mockClear();
    rerender(inMode("dark"));
    await settle(300);
    expect(styleGiven(spy)).toEqual(rasterStyle(true));
  });
});

describe("Map, route status", () => {
  it("doesn't say the route is loading when there's only one place to route", async () => {
    const host = mount(<MapView places={places.slice(0, 1)} route />);
    await settle(200);
    expect(one(host, ".openui-intelligent-map-status").textContent).toBe("");
  });

  it("says so while two places are waiting for a route", async () => {
    const host = mount(<MapView places={places} route />);
    await settle(100);
    expect(one(host, ".openui-intelligent-map-status").textContent).toBe("Street route loading.");
  });
});

describe("following ThemeProvider's mode", () => {
  it("HtmlView gives its document the same colour scheme", async () => {
    const view = (mode: "light" | "dark") => (
      <ThemeProvider mode={mode}>
        <HtmlView html="<p>Hello</p>" />
      </ThemeProvider>
    );
    const host = mount(view("light"));
    await settle(200);
    expect(one<HTMLIFrameElement>(host, "iframe").srcdoc).toContain("color-scheme:light");
    rerender(view("dark"));
    await settle(200);
    expect(one<HTMLIFrameElement>(host, "iframe").srcdoc).toContain("color-scheme:dark");
  });
});

describe("Popover", () => {
  const panel = () => document.querySelector<HTMLElement>("[role=dialog]");

  it("carries a nested ThemeProvider's theme into its panel", async () => {
    const host = mount(
      <ThemeProvider mode="light">
        <ThemeProvider lightTheme={{ foreground: "#123456" }}>
          <Popover trigger="Open">
            <span>Inside</span>
          </Popover>
        </ThemeProvider>
      </ThemeProvider>,
    );
    await settle(100);
    await userEvent.click(one(host, ".openui-intelligent-popover-trigger"));
    await settle(200);
    expect(getComputedStyle(panel()!).getPropertyValue("--openui-foreground").trim()).toBe("#123456");
  });

  it("stays open while something inside it scrolls, and closes when the page does", async () => {
    const host = mount(
      <Popover trigger="Open">
        <div className="scroller" style={{ height: 40, overflow: "auto" }}>
          <div style={{ height: 400 }}>Tall</div>
        </div>
      </Popover>,
    );
    await settle(100);
    await userEvent.click(one(host, ".openui-intelligent-popover-trigger"));
    await settle(200);
    one(document.body, ".scroller").scrollTop = 100;
    await settle(200);
    expect(panel()).not.toBeNull();
    window.dispatchEvent(new Event("scroll"));
    await settle(200);
    expect(panel()).toBeNull();
  });
});

describe("Code", () => {
  const copyButton = (host: HTMLElement) => one(host, ".openui-intelligent-code-copy");

  it("says so when copying fails, with no unhandled rejection", async () => {
    const failures: unknown[] = [];
    const onFailure = (event: PromiseRejectionEvent) => {
      failures.push(event.reason);
      event.preventDefault();
    };
    window.addEventListener("unhandledrejection", onFailure);
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("Not allowed"));
    const host = mount(<Code code="x = 1" />);
    await settle(50);
    copyButton(host).click();
    await settle(100);
    window.removeEventListener("unhandledrejection", onFailure);
    expect(failures).toEqual([]);
    expect(copyButton(host).textContent).toContain("Couldn't copy");
    expect(copyButton(host).getAttribute("aria-label")).toBe("Couldn't copy code");
  });

  it("tells a screen reader it copied", async () => {
    vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    const host = mount(<Code code="x = 1" />);
    await settle(50);
    expect(copyButton(host).getAttribute("aria-label")).toBe("Copy code");
    copyButton(host).click();
    await settle(100);
    expect(copyButton(host).getAttribute("aria-label")).toBe("Copied");
  });

  it("keeps saying Copied for the full time after a second click", async () => {
    vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    const host = mount(<Code code="x = 1" />);
    await settle(50);
    copyButton(host).click();
    await settle(1000);
    copyButton(host).click();
    // 1.7s after the first click, when its timer would have ended; 0.7s after the second.
    await settle(700);
    expect(copyButton(host).textContent).toContain("Copied");
    await settle(1000);
    expect(copyButton(host).textContent).not.toContain("Copied");
  });
});

describe("RadioGroup", () => {
  const options = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
  ];

  for (const variant of ["list", "cards", "pills"] as const) {
    it(`tells a screen reader a ${variant} group is required and invalid, and why`, async () => {
      const host = mount(<RadioGroup variant={variant} options={options} value="" onChange={() => {}} required error="Pick one" />);
      await settle(100);
      const group = one(host, "[role=radiogroup]");
      expect(group.getAttribute("aria-required")).toBe("true");
      expect(group.getAttribute("aria-invalid")).toBe("true");
      const error = document.getElementById(group.getAttribute("aria-describedby") ?? "");
      expect(error?.textContent).toContain("Pick one");
    });

    it(`says nothing extra on a valid, optional ${variant} group`, async () => {
      const host = mount(<RadioGroup variant={variant} options={options} value="a" onChange={() => {}} />);
      await settle(100);
      const group = one(host, "[role=radiogroup]");
      expect(group.hasAttribute("aria-required")).toBe(false);
      expect(group.hasAttribute("aria-invalid")).toBe(false);
      expect(group.hasAttribute("aria-describedby")).toBe(false);
    });
  }
});
