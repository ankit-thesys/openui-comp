// Use the public library from source so the host overrides share its contexts.
import { Renderer } from "@openuidev/react-lang";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { library, ThemeProvider } from "../../packages/libraries/dashboard/src/index";
import type { Shape } from "../../packages/libraries/dashboard/src/maps/atlas";
import { CompareOverride, StateOverride } from "../../packages/libraries/dashboard/src/shared";
import { mapsFixtures } from "./fixtures/maps";

// Keep real atlas geometry for rendering; intercept only the asset boundary for loading/failure.
const atlasControl = vi.hoisted(() => ({ load: null as null | (() => Promise<Shape[]>) }));
vi.mock("../../packages/libraries/dashboard/src/maps/atlas", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../packages/libraries/dashboard/src/maps/atlas")>();
  return {
    ...actual,
    loadShapes: (region: "world" | "us") => atlasControl.load?.() ?? actual.loadShapes(region),
  };
});

let host: HTMLDivElement;
let root: Root;
let errors: ReturnType<typeof vi.spyOn>;
beforeEach(async () => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  atlasControl.load = null;
  // Resolve the real assets before drawing, keeping their asynchronous updates inside act.
  const actual = await vi.importActual<
    typeof import("../../packages/libraries/dashboard/src/maps/atlas")
  >("../../packages/libraries/dashboard/src/maps/atlas");
  await Promise.all([actual.loadShapes("world"), actual.loadShapes("us")]);
  host = document.createElement("div");
  host.style.width = "1200px";
  document.body.append(host);
  root = createRoot(host);
  errors = vi.spyOn(console, "error");
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  atlasControl.load = null;
  const calls = [...errors.mock.calls];
  errors.mockRestore();
  expect(calls).toEqual([]);
});
async function draw(children: ReactNode) {
  await act(async () => root.render(children));
}
/** Waits a frame at a time inside act, so async updates (an atlas import) commit before each check. */
async function settle(check: () => void) {
  await vi.waitFor(async () => {
    await act(async () => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    });
    check();
  });
}
const card = (content: string) =>
  `root = Dashboard([Section("", [Row([Card("Places", [${content}], "full")])])])`;
const dashboard = (response: string, isStreaming = false) => (
  <Renderer library={library} response={response} isStreaming={isStreaming} />
);
const rows = () => [...host.querySelectorAll<HTMLElement>(".openui-dashboard-rank-row")];
const map = () => host.querySelector<SVGSVGElement>(".openui-dashboard-geo-stage > svg")!;
const names = () =>
  rows().map((row) => row.querySelector(".openui-dashboard-rank-name")!.textContent);
async function click(element: Element) {
  await act(async () => element.dispatchEvent(new MouseEvent("click", { bubbles: true })));
}
async function hover(element: Element, type = "mousemove") {
  await act(async () => {
    element.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX: 300, clientY: 200 }));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
}

const geo =
  'GeoMap("world", ["US", "DE", "Atlantis"], [1200, 300, 100], "currency", [1000, 400, 100], "down")';
const point =
  'PointMap("world", ["London", "Berlin", "Tokyo"], [51.51, 52.52, 35.68], [-0.13, 13.4, 139.69], [1200, 300, 100], "currency", "Cost", ["Office", "Office", "Store"], [1000, 400, 100], "down")';

for (const mode of ["light", "dark"] as const) {
  for (const fixture of mapsFixtures) {
    test(`${fixture.name} catalog through a Card in ${mode}`, async () => {
      await draw(<ThemeProvider mode={mode}>{dashboard(fixture.program)}</ThemeProvider>);
      expect(host.querySelector(".openui-dashboard-card-title")!.textContent).toBe(
        fixture.name === "GeoMap" ? "Signups by country" : "Headcount by office",
      );
      expect(host.textContent).toContain(fixture.text);
      expect(rows()).toHaveLength(10);
      expect(map().querySelectorAll(":scope > path").length).toBeGreaterThan(150);
      const land = map().querySelector('path[fill="var(--openui-dashboard-map-land)"]')!;
      expect(getComputedStyle(land).fill).toBe(
        mode === "light" ? "rgb(239, 239, 239)" : "rgb(35, 35, 35)",
      );
      // The colour or size key sits under the map, inside the map column, so the ranked list
      // beside it runs to the bottom of the card body.
      const column = host.querySelector(".openui-dashboard-geo-map")!;
      const key = column.querySelector(":scope > .openui-dashboard-geo-legend")!;
      expect(key).not.toBeNull();
      const list = host.querySelector(".openui-dashboard-geo-side")!.getBoundingClientRect();
      expect(list.bottom).toBeCloseTo(key.getBoundingClientRect().bottom, 0);
      expect(list.bottom).toBeCloseTo(
        host.querySelector(".openui-dashboard-geo-body")!.getBoundingClientRect().bottom,
        0,
      );
      if (fixture.name === "GeoMap") {
        // Regions with data carry the bars' dot texture, 6 screen pixels whatever the map's scale;
        // regions without data stay plain.
        const pattern = map().querySelector("pattern")!;
        const scale = 760 / map().getBoundingClientRect().width;
        expect(Number(pattern.getAttribute("width"))).toBeCloseTo(6 * scale, 1);
        const textured = [...map().querySelectorAll(":scope > g > path")];
        expect(textured).toHaveLength(10);
        expect(textured.every((path) => path.getAttribute("fill") === `url(#${pattern.id})`)).toBe(
          true,
        );
        expect(names().slice(0, 3)).toEqual(["United States", "India", "United Kingdom"]);
        expect(rows()[0]!.textContent).toContain("+7.9%");
      } else {
        // Each place has a faded area mark and a solid centre.
        expect(map().querySelectorAll(".recharts-symbols")).toHaveLength(20);
        expect(map().querySelectorAll("text").length).toBeLessThanOrEqual(8);
        expect(map().querySelectorAll("text").length).toBeGreaterThan(0);
        expect(host.querySelectorAll("table tbody tr")).toHaveLength(10);
        expect(host.querySelectorAll(".openui-dashboard-size-step")).toHaveLength(3);
      }
      expect(host.querySelector("[data-state=invalid]")).toBeNull();
    });
  }

  test(`GeoMap shares, sorting, aliases and linked hover in ${mode}`, async () => {
    await draw(
      <ThemeProvider mode={mode}>
        <CompareOverride value={true}>{dashboard(card(geo))}</CompareOverride>
      </ThemeProvider>,
    );
    expect(names()).toEqual(["United States", "Germany", "Atlantisnot on map"]);
    expect(rows()[0]!.textContent).toContain("$1,200");
    expect(rows()[0]!.querySelector(".openui-dashboard-delta-bad")!.textContent).toBe("+20%");
    expect(rows()[1]!.querySelector(".openui-dashboard-delta-good")!.textContent).toBe("-25%");
    await hover(rows()[0]!);
    expect(host.querySelector(".openui-dashboard-tooltip")!.textContent).toContain(
      "Previous$1,000",
    );
    expect(host.querySelector(".openui-dashboard-tooltip")!.textContent).toContain(
      "Share of total75%",
    );
    expect(map().querySelector('path[pointer-events="none"]')).not.toBeNull();
    const outlined = map().querySelector('path[pointer-events="none"]')!.getAttribute("d");
    await hover(rows()[0]!, "mouseout");
    const country = [...map().querySelectorAll(":scope > path")].find(
      (path) => path.getAttribute("d") === outlined,
    )!;
    await hover(country);
    expect(rows()[0]!.hasAttribute("data-linked")).toBe(true);
    expect(host.querySelector(".openui-dashboard-tooltip")!.textContent).toContain("United States");
    await hover(country, "mouseout");
    const share = host.querySelector('[role="radio"][aria-checked="false"]')!;
    expect(share.textContent).toBe("% of total");
    await click(share);
    expect(rows()[0]!.textContent).toContain("75.0%");
    expect(rows()[0]!.querySelector(".openui-dashboard-delta")!.textContent).toBe("+8.3 pts");
    await click(host.querySelector(".openui-dashboard-sort-toggle")!);
    expect(names()).toEqual(["Atlantisnot on map", "Germany", "United States"]);
    expect(getComputedStyle(host.querySelector(".openui-dashboard-geo")!).display).toBe("flex");
    expect(getComputedStyle(host.querySelector(".openui-dashboard-geo-side")!).marginTop).toBe(
      "0px",
    );
  });

  test(`PointMap groups, previous costs and linked hover in ${mode}`, async () => {
    await draw(
      <ThemeProvider mode={mode}>
        <CompareOverride value={true}>{dashboard(card(point))}</CompareOverride>
      </ThemeProvider>,
    );
    expect(rows()).toHaveLength(3);
    expect(map().querySelectorAll(".recharts-symbols")).toHaveLength(6);
    expect(host.querySelector(".openui-dashboard-size-key")!.getAttribute("aria-label")).toBe(
      "Cost: 100 to 1200",
    );
    expect(host.querySelector(".openui-dashboard-legend")!.textContent).toContain("OfficeStore");
    expect(rows()[0]!.textContent).toContain("$1,200");
    expect(rows()[1]!.querySelector(".openui-dashboard-delta-good")!.textContent).toBe("-25%");
    await hover(rows()[0]!);
    const tip = host.querySelector(".openui-dashboard-tooltip")!;
    expect(tip.textContent).toContain("London · Office");
    expect(tip.textContent).toContain("Previous$1,000");
    expect(tip.textContent).toContain("Cost+20%$1,200");
    expect(map().querySelector('circle[pointer-events="none"]')).not.toBeNull();
    await hover(rows()[0]!, "mouseout");
    const symbols = [...map().querySelectorAll(".recharts-symbols")];
    await hover(symbols[4]!, "mouseover");
    expect(rows()[2]!.hasAttribute("data-linked")).toBe(true);
    expect(host.querySelector(".openui-dashboard-tooltip")!.textContent).toContain("Tokyo · Store");
    await hover(symbols[4]!, "mouseout");
    const store = [...host.querySelectorAll(".openui-dashboard-legend-item")].find(
      (item) => item.textContent === "Store",
    )!;
    await hover(store, "mouseover");
    expect(Number(symbols[1]!.getAttribute("fill-opacity"))).toBeCloseTo(0.35);
    expect(Number(symbols[5]!.getAttribute("fill-opacity"))).toBe(1);
    await hover(store, "mouseout");
    await click(host.querySelector(".openui-dashboard-sort-toggle")!);
    expect(names()).toEqual(["Tokyo", "Berlin", "London"]);
  });

  for (const [name, content] of [
    ["GeoMap", geo],
    ["PointMap", point],
  ] as const) {
    for (const [state, copy] of [
      ["loading", "Loading"],
      ["empty", "No data for this period"],
      ["error", "This data didn’t load"],
      ["no-results", "No matching data"],
    ] as const) {
      test(`${name} Card ${state} in ${mode}`, async () => {
        await draw(
          <ThemeProvider mode={mode}>
            <StateOverride value={state}>{dashboard(card(content))}</StateOverride>
          </ThemeProvider>,
        );
        const frame = host.querySelector(".openui-dashboard-card-body > .openui-dashboard-state")!;
        expect(frame.getAttribute("data-state")).toBe(state);
        expect(frame.querySelector(".openui-dashboard-state-layer")!.textContent).toContain(copy);
        expect(
          getComputedStyle(frame.querySelector(".openui-dashboard-state-content")!).visibility,
        ).toBe("hidden");
      });
    }

    test(`${name} own empty and streaming states in ${mode}`, async () => {
      const empty =
        name === "GeoMap" ? 'GeoMap("world", [], [])' : 'PointMap("world", [], [], [], [])';
      await draw(<ThemeProvider mode={mode}>{dashboard(card(empty))}</ThemeProvider>);
      expect(
        host.querySelector(".openui-dashboard-card .openui-dashboard-empty")!.textContent,
      ).toContain("No data for this period");
      await draw(<ThemeProvider mode={mode}>{dashboard(card(empty), true)}</ThemeProvider>);
      expect(host.querySelector(".openui-dashboard-card [data-state=loading]")).not.toBeNull();
      expect(
        host
          .querySelector(".openui-dashboard-card .openui-dashboard-empty")!
          .getAttribute("data-state"),
      ).toBe("loading");
      // Streaming completion fills the same component without changing its hook order.
      await draw(<ThemeProvider mode={mode}>{dashboard(card(content))}</ThemeProvider>);
      expect(rows()).toHaveLength(3);
      expect(map()).not.toBeNull();
    });

    test(`${name} empty data reflects an active filter in ${mode}`, async () => {
      const empty =
        name === "GeoMap" ? 'GeoMap("world", [], [])' : 'PointMap("world", [], [], [], [])';
      // The dashboard's own FilterBar: picking a place that has nothing means the filters hid it.
      const response = `$places = "all"\n${card(empty).replace(
        "Dashboard([",
        'Dashboard([FilterBar([ChipFilter("places", [{value: "all", label: "All places"}, {value: "none", label: "Nowhere"}], $places)]), ',
      )}`;
      const state = () =>
        host
          .querySelector(".openui-dashboard-card .openui-dashboard-empty")!
          .getAttribute("data-state");
      const chip = (label: string) =>
        click(
          [...host.querySelectorAll('[role="radio"]')].find((node) => node.textContent === label)!,
        );
      await draw(<ThemeProvider mode={mode}>{dashboard(response)}</ThemeProvider>);
      expect(state()).toBe("empty");
      await chip("Nowhere");
      expect(state()).toBe("no-results");
      const emptyState = host.querySelector(".openui-dashboard-card .openui-dashboard-empty")!;
      expect(emptyState.textContent).toContain("No matching data");
      expect(emptyState.textContent).toContain("Try changing or clearing a filter.");
      await chip("All places");
      expect(state()).toBe("empty");
    });

    test(`${name} asset loading, failure and remount retry in ${mode}`, async () => {
      let reject!: (reason: Error) => void;
      const pending = new Promise<Shape[]>((_resolve, fail) => {
        reject = fail;
      });
      atlasControl.load = () => pending;
      await draw(<ThemeProvider mode={mode}>{dashboard(card(content))}</ThemeProvider>);
      expect(host.querySelector(".openui-dashboard-geo-map [role=status]")!.textContent).toContain(
        "Loading map",
      );
      await act(async () => reject(new Error("Atlas unavailable")));
      expect(
        host.querySelector(".openui-dashboard-geo-map [data-state=error]")!.textContent,
      ).toContain("The map didn’t load");
      expect(host.textContent).toContain("The values are in the list.");
      // GeoMap can rank without its atlas; PointMap still exposes all raw values in its SR table.
      expect(
        name === "GeoMap" ? rows().length : host.querySelectorAll("table tbody tr").length,
      ).toBe(3);
      atlasControl.load = null;
      await draw(
        <ThemeProvider key="retry" mode={mode}>
          {dashboard(card(content))}
        </ThemeProvider>,
      );
      // The failed import was dropped, so this mount fetches the atlas again.
      await settle(() => expect(map()).not.toBeNull());
      expect(rows()).toHaveLength(3);
    });
  }
}

test("US state aliases, top N and an initial share view", async () => {
  await draw(
    dashboard(card('GeoMap("us", ["NY", "CA", "TX"], [10, 60, 30], null, null, null, 2, "total")')),
  );
  expect(names()).toEqual(["California", "Texas"]);
  expect(rows()[0]!.textContent).toContain("60%");
  expect(host.querySelector("[role=radio][aria-checked=true]")!.textContent).toBe("% of total");
  expect(host.querySelector(".openui-dashboard-view-label")!.textContent).toBe("Show");
  expect(map().querySelectorAll(":scope > path")).toHaveLength(56);
});

test("negative regions keep counts and do not offer shares", async () => {
  await draw(
    dashboard(
      card('GeoMap("world", ["US", "DE"], [-10, 20], "currency", null, null, null, "total")'),
    ),
  );
  expect(host.querySelector('[aria-label="Show regions as"]')).toBeNull();
  expect(rows()[1]!.textContent).toContain("-$10");
});

test("US PointMap names places outside the projection", async () => {
  await draw(
    dashboard(
      card('PointMap("us", ["New York", "London"], [40.71, 51.51], [-74.01, -0.13], [50, 30])'),
    ),
  );
  expect(names()).toEqual(["New York"]);
  expect(map().querySelectorAll(".recharts-symbols")).toHaveLength(2);
  expect(host.querySelector("[role=note]")!.textContent).toContain(
    "1 place not on the map: London",
  );
  expect(host.querySelectorAll("table tbody tr")).toHaveLength(2);
});

test("maps keep supplied changes with Compare mode off, as in the source", async () => {
  await draw(
    <CompareOverride value={false}>{dashboard(card(`${geo}, ${point}`))}</CompareOverride>,
  );
  expect(host.querySelectorAll(".openui-dashboard-rank-row .openui-dashboard-delta")).toHaveLength(
    6,
  );
});
