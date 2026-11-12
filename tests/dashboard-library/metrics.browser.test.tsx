// The host extras (StateOverride, CompareOverride) are internal, so this file renders the library
// from source too: one copy of the shared contexts for the overrides to reach.
import { Renderer } from "@openuidev/react-lang";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { library, ThemeProvider } from "../../packages/libraries/dashboard/src/index";
import { CompareOverride } from "../../packages/libraries/dashboard/src/shared/compare";
import {
  StateOverride,
  type ViewState,
} from "../../packages/libraries/dashboard/src/shared/viewState";
import { kpis, metricsProgram } from "./fixtures/metrics";

let host: HTMLDivElement;
let root: Root;
let errors: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div");
  host.style.width = "1200px";
  document.body.append(host);
  root = createRoot(host);
  errors = vi.spyOn(console, "error");
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  const calls = [...errors.mock.calls];
  errors.mockRestore();
  expect(calls).toEqual([]);
});
async function draw(children: ReactNode) {
  await act(async () => root.render(children));
}
const renderProgram = (response = metricsProgram) => (
  <Renderer library={library} response={response} />
);

for (const mode of ["light", "dark"] as const) {
  test(`Kpis leads a Card with Stat in ${mode}`, async () => {
    await draw(<ThemeProvider mode={mode}>{renderProgram()}</ThemeProvider>);
    expect(
      host
        .querySelector(".openui-dashboard-section")
        ?.firstElementChild?.classList.contains("openui-dashboard-kpis"),
    ).toBe(true);
    for (const text of ["$412.6K", "238 ms", "3.1%", "60%", "18.4K", "this week"]) {
      expect(host.textContent).toContain(text);
    }
    const delta = (label: string) =>
      host.querySelector(`[aria-label="${label}"] .openui-dashboard-delta`)!;
    expect(delta("Revenue").classList.contains("openui-dashboard-delta-good")).toBe(true);
    expect(delta("Latency").classList.contains("openui-dashboard-delta-good")).toBe(true);
    expect(delta("Errors").classList.contains("openui-dashboard-delta-bad")).toBe(true);
    expect(delta("Capacity").classList.contains("openui-dashboard-delta-neutral")).toBe(true);
    expect(getComputedStyle(delta("Errors")).color).toBe(
      mode === "light" ? "rgb(200, 44, 55)" : "rgb(241, 131, 140)",
    );
    expect(getComputedStyle(host.querySelector(".openui-dashboard-card-headline")!).fontSize).toBe(
      "26px",
    );
    expect(host.querySelector(".openui-dashboard-state[data-state=invalid]")).toBeNull();
  });

  for (const [state, copy] of [
    ["loading", "Loading"],
    ["empty", "No data"],
    ["no-results", "No results"],
    ["error", "Didn’t load"],
  ] as const) {
    test(`${state} in tiles and Card in ${mode}`, async () => {
      await draw(
        <ThemeProvider mode={mode}>
          <StateOverride value={state}>{renderProgram()}</StateOverride>
        </ThemeProvider>,
      );
      const tile = host.querySelector(".openui-dashboard-kpi .openui-dashboard-state")!;
      const card = host.querySelector(".openui-dashboard-card-body .openui-dashboard-state")!;
      expect(tile.getAttribute("data-state")).toBe(state);
      expect(card.getAttribute("data-state")).toBe(state);
      expect(tile.querySelector(".openui-dashboard-state-layer")?.textContent).toContain(copy);
      expect(
        getComputedStyle(tile.querySelector(".openui-dashboard-state-content")!).visibility,
      ).toBe("hidden");
      expect(
        getComputedStyle(card.querySelector(".openui-dashboard-state-content")!).visibility,
      ).toBe("hidden");
    });
  }
}

test("compare override draws the previous sparkline", async () => {
  await draw(<CompareOverride value={false}>{renderProgram()}</CompareOverride>);
  expect(host.querySelectorAll(".openui-dashboard-kpi-spark polyline")).toHaveLength(1);
  await draw(<CompareOverride value={true}>{renderProgram()}</CompareOverride>);
  expect(host.querySelectorAll(".openui-dashboard-kpi-spark polyline")).toHaveLength(2);
});

for (const state of [
  null,
  "loading",
  "empty",
  "error",
  "refreshing",
  "partial",
] as const satisfies readonly (ViewState | null)[]) {
  test(`past six KPIs compact, state ${state}`, async () => {
    await draw(<StateOverride value={state}>{renderProgram(kpis(8))}</StateOverride>);
    expect(host.querySelectorAll(".openui-dashboard-kpi-compact")).toHaveLength(8);
    expect(host.querySelector(".openui-dashboard-kpi-spark")).toBeNull();
    expect(host.querySelector(".openui-dashboard-kpi-hint")).toBeNull();
    const hidden = state === "loading" || state === "empty" || state === "error";
    expect(
      host.querySelectorAll(".openui-dashboard-kpi-compact-meta .openui-dashboard-delta"),
    ).toHaveLength(hidden ? 0 : 8);
  });
}

for (const mode of ["light", "dark"] as const) {
  test(`Goal previous ticks follow Compare, scale and clamp in ${mode}`, async () => {
    const response = `root = Dashboard([Section("", [Row([Card("Targets", [
      Goal("Sales", 60, 100, "number", 0.5, null, 40),
      Goal("Passed", 200, 100, "number", 0.5, null, 150),
      Goal("Beyond", 60, 100, "number", null, null, 120),
      Goal("Negative", 60, 100, "number", null, null, -10),
      Goal("No target", 5, 0, "number", null, null, 3),
      Goal("No previous", 60, 100)
    ], "full")])])])`;
    const view = (enabled: boolean) => (
      <ThemeProvider mode={mode}>
        <CompareOverride value={enabled}>{renderProgram(response)}</CompareOverride>
      </ThemeProvider>
    );
    await draw(view(false));
    expect(host.querySelector(".openui-dashboard-goal-prev")).toBeNull();
    await draw(view(true));
    const ticks = [...host.querySelectorAll<HTMLElement>(".openui-dashboard-goal-prev")];
    expect(ticks.map((tick) => tick.style.left)).toEqual(["40%", "75%", "100%", "0%"]);
    const pace = host.querySelector<HTMLElement>(".openui-dashboard-goal-pace")!;
    expect(pace.style.left).toBe("50%");
    expect(getComputedStyle(ticks[0]!).backgroundColor).not.toBe(
      getComputedStyle(pace).backgroundColor,
    );
    expect(getComputedStyle(ticks[0]!).opacity).toBe("0.7");
    const hoverTrack = async () => {
      const track = host.querySelector(".openui-dashboard-goal-track")!;
      const box = track.getBoundingClientRect();
      await act(async () => {
        track.dispatchEvent(
          new MouseEvent("mousemove", {
            bubbles: true,
            clientX: box.left + 10,
            clientY: box.top + 2,
          }),
        );
        await new Promise(requestAnimationFrame);
      });
    };
    await hoverTrack();
    expect(host.querySelector(".openui-dashboard-tooltip")?.textContent).toContain(
      "Previous period40",
    );
    await draw(view(false));
    await hoverTrack();
    expect(host.querySelector(".openui-dashboard-goal-prev")).toBeNull();
    expect(host.querySelector(".openui-dashboard-tooltip")?.textContent).not.toContain(
      "Previous period",
    );
  });
}

// A generated program can repeat a label or leave one empty (a list of topics under one heading,
// two Kpis both called "Total"). Every row still draws, and React sees no duplicate keys: the
// afterEach fails on any console.error, React's duplicate-key warning included.
test("repeated and empty labels draw every row without duplicate keys", async () => {
  await draw(
    renderProgram(
      `root = Dashboard([Section("", [Kpis([Kpi("Total", 12, "number"), Kpi("Total", 30, "number")]), Row([Card("Topics", [KeyValues([{label: "Topics", value: "blog"}, {label: "", value: "browser"}, {label: "", value: "compiler"}])], "half"), Card("Mix", [Donut(["Web", "Web", "Mobile"], [40, 35, 25], "number", "Total")], "half")])])])`,
    ),
  );
  expect(host.querySelectorAll(".openui-dashboard-kv-row")).toHaveLength(3);
  expect(host.querySelectorAll(".openui-dashboard-kpi-cell")).toHaveLength(2);
});

// Dates from an API (2012-04-23T16:37:11.912Z) read as a day in KeyValues and a Kpi's text
// value, the way a Table date column shows them; the full value stays in the tooltip.
test("KeyValues and Kpi text read ISO dates as a day and keep the full value on hover", async () => {
  await draw(
    renderProgram(
      `root = Dashboard([Section("", [Kpis([Kpi("First published", "2012-04-23")]), Row([Card("Package", [KeyValues([{label: "First published", value: "2012-04-23"}, {label: "Last push", value: "2012-04-23T12:00:00"}, {label: "Latest version", value: "4.18.1"}])], "full")])])])`,
    ),
  );
  const values = [...host.querySelectorAll(".openui-dashboard-kv-value")];
  expect(values.map((value) => value.textContent)).toEqual([
    "Apr 23, 2012",
    "Apr 23, 2012",
    "4.18.1",
  ]);
  expect(values[1]?.getAttribute("title")).toBe("2012-04-23T12:00:00");
  expect(host.querySelector(".openui-dashboard-kpi-text-value")?.textContent).toBe("Apr 23, 2012");
});
