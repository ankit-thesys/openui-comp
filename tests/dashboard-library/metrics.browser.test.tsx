// The host extras (StateOverride, CompareOverride) are internal, so this file renders the library
// from source too: one copy of the shared contexts for the overrides to reach.
import { Renderer } from "@openuidev/react-lang";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { library, ThemeProvider } from "../../packages/libraries/dashboard-next/src/index";
import {
  CompareOverride,
  StateOverride,
  type ViewState,
} from "../../packages/libraries/dashboard-next/src/shared";
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
