// Source imports keep host overrides and the public library on the same shared contexts.
import { Renderer } from "@openuidev/react-lang";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { library, ThemeProvider } from "../../packages/libraries/dashboard-next/src/index";
import { CompareOverride, StateOverride } from "../../packages/libraries/dashboard-next/src/shared";
import { metricCatalog } from "./fixtures/metrics";
import { card, timeSeriesProgram, trendsCatalog, trendsFixtures } from "./fixtures/trends";

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
  // Recharts (ResponsiveContainer) and the panel grids (useWidth) measure with ResizeObserver
  // after mounting. Wait inside act, so those state updates land in it: outside act they log
  // "not wrapped in act" warnings, depending on when the observer fires.
  await act(async () => {
    await vi.waitFor(() => {
      const containers = host.querySelectorAll(".recharts-responsive-container");
      for (const container of containers) expect(container.querySelector("svg")).not.toBeNull();
    });
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
}
const program = (response: string) => <Renderer library={library} response={response} />;

for (const mode of ["light", "dark"] as const) {
  for (const fixture of trendsFixtures) {
    test(`${fixture.name} in a Card in ${mode}`, async () => {
      await draw(<ThemeProvider mode={mode}>{program(fixture.program)}</ThemeProvider>);
      expect(host.querySelector(".openui-dashboard-card")).not.toBeNull();
      expect(host.textContent).toContain(fixture.text);
      expect(host.querySelector("[data-state=invalid]")).toBeNull();
    });
  }

  for (const type of ["line", "area", "bar"] as const) {
    test(`${type} marks and previous values in ${mode}`, async () => {
      const response = timeSeriesProgram(type);
      const render = (compare: boolean) => (
        <ThemeProvider mode={mode}>
          <CompareOverride value={compare}>{program(response)}</CompareOverride>
        </ThemeProvider>
      );
      await draw(render(false));
      const marks = () => host.querySelectorAll(`.recharts-${type}`);
      // Unstacked areas have a texture layer and a wash layer for each series.
      expect(marks()).toHaveLength(type === "area" ? 4 : 2);
      expect(host.querySelectorAll(".recharts-reference-line")).toHaveLength(2);
      expect(host.textContent).toContain("Target · $25");
      expect(host.textContent).toContain("Launch");
      expect(host.querySelector("table")?.textContent).toContain("$40");
      await draw(render(true));
      expect(marks()).toHaveLength(4);
      if (type === "area") expect(host.querySelectorAll(".recharts-line")).toHaveLength(2);
      const previous = [...host.querySelectorAll(".openui-dashboard-legend-item")].find((entry) =>
        entry.textContent?.includes("Previous period"),
      );
      expect(previous).toBeDefined();
      expect(getComputedStyle(previous!).visibility).toBe("visible");
    });
  }

  test(`stacked shares and forecast in ${mode}`, async () => {
    await draw(
      <ThemeProvider mode={mode}>{program(timeSeriesProgram("area", "percent"))}</ThemeProvider>,
    );
    expect(host.textContent).toContain("100%");
    expect(host.querySelectorAll(".recharts-area")).toHaveLength(4);
    await draw(
      <ThemeProvider mode={mode}>{program(timeSeriesProgram("line", false, true))}</ThemeProvider>,
    );
    expect(host.querySelectorAll(".recharts-line")).toHaveLength(4);
    expect(host.querySelectorAll(".recharts-reference-area")).toHaveLength(1);
    expect(host.querySelectorAll(".recharts-line-curve[stroke-dasharray]")).toHaveLength(2);
    expect(host.textContent).toContain("Forecast");
  });

  test(`small panels and status cells in ${mode}`, async () => {
    await draw(
      <ThemeProvider mode={mode}>{program(trendsCatalog[1]!.variants[0]!.program)}</ThemeProvider>,
    );
    expect(host.querySelectorAll(".openui-dashboard-sm-cell")).toHaveLength(8);
    expect(host.querySelectorAll(".recharts-line")).toHaveLength(8);
    expect(host.textContent).toContain("509");
    await draw(
      <ThemeProvider mode={mode}>{program(trendsCatalog[2]!.variants[0]!.program)}</ThemeProvider>,
    );
    expect(
      host.querySelectorAll(".openui-dashboard-st-row:not(.openui-dashboard-st-axis)"),
    ).toHaveLength(5);
    expect(host.querySelectorAll(".openui-dashboard-st-cell")).toHaveLength(150);
    expect(host.textContent).toContain("90.0%");
    const cell = host.querySelector('[aria-label="Payments · Oct 17: Down"]')!;
    await act(async () => cell.dispatchEvent(new MouseEvent("mouseover", { bubbles: true })));
    expect(host.querySelector(".openui-dashboard-st-tip")?.textContent).toContain("Down");
    expect(host.querySelector(".openui-dashboard-st-tip")?.textContent).toContain(
      "Payments · Oct 17",
    );
  });

  for (const component of [
    'TimeSeries(["Jun"], [Series("Sales", [10])])',
    'SmallMultiples(["Jun"], [Series("Sales", [10])])',
    'StatusTimeline(["API"], [["up"]], ["Jun"])',
  ]) {
    for (const [state, copy] of [
      ["loading", "Loading"],
      // A Card shows each state's full title (his STATE_COPY); the short forms are for Kpi tiles.
      ["empty", "No data for this period"],
      ["error", "This data didn’t load"],
      ["no-results", "No matching data"],
    ] as const) {
      test(`${component.split("(")[0]} ${state} through a Card in ${mode}`, async () => {
        await draw(
          <ThemeProvider mode={mode}>
            <StateOverride value={state}>
              {program(card(`Card("Trend", [${component}], "full")`))}
            </StateOverride>
          </ThemeProvider>,
        );
        const frame = host.querySelector(".openui-dashboard-card-body .openui-dashboard-state")!;
        expect(frame.getAttribute("data-state")).toBe(state);
        expect(frame.querySelector(".openui-dashboard-state-layer")?.textContent).toContain(copy);
        expect(
          getComputedStyle(frame.querySelector(".openui-dashboard-state-content")!).visibility,
        ).toBe("hidden");
        // Empty, error and no-results sit in a quiet well that marks the content area.
        const well = getComputedStyle(frame.querySelector(".openui-dashboard-state-layer")!);
        if (state === "loading") expect(well.backgroundColor).toBe("rgba(0, 0, 0, 0)");
        else expect(well.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
      });
    }
  }

  for (const component of [
    'TimeSeries(["Jun"], [Series("Sales", [null])])',
    'SmallMultiples(["Jun"], [Series("Sales", [null])])',
    "StatusTimeline([], [])",
  ]) {
    test(`empty data for ${component.split("(")[0]} in ${mode}`, async () => {
      await draw(
        <ThemeProvider mode={mode}>
          {program(card(`Card("Empty", [${component}], "full")`))}
        </ThemeProvider>,
      );
      expect(host.querySelector(".openui-dashboard-empty")?.textContent).toContain("No data");
      expect(host.querySelector("[data-state=invalid]")).toBeNull();
    });
  }
}

for (const mode of ["light", "dark"] as const) {
  for (const type of ["line", "area", "bar"] as const) {
    for (const [goodWhen, tone] of [
      ["up", "good"],
      ["down", "bad"],
      ["neutral", "neutral"],
    ] as const) {
      test(`${type} tooltip compares formatted values, goodWhen ${goodWhen} in ${mode}`, async () => {
        const response = card(
          `Card("Conversion", [TimeSeries(["Jun", "Jul"], [Series("Paid", [18, 20], [16, 17])], "${type}", "percent", false, null, "${goodWhen}")], "full")`,
        );
        const render = (compare: boolean) => (
          <ThemeProvider mode={mode}>
            <CompareOverride value={compare}>{program(response)}</CompareOverride>
          </ThemeProvider>
        );
        await draw(render(false));
        const openTooltip = async () => {
          const chart = host.querySelector(".recharts-wrapper")!;
          await act(async () =>
            chart.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })),
          );
          await vi.waitFor(() =>
            expect(host.querySelector(".openui-dashboard-tooltip")).not.toBeNull(),
          );
        };
        await openTooltip();
        expect(host.querySelector(".openui-dashboard-tooltip")?.textContent).toContain("18%");
        expect(host.querySelector(".openui-dashboard-tooltip")?.textContent).not.toContain(
          "Previous period",
        );
        expect(host.querySelector(".openui-dashboard-tooltip .openui-dashboard-delta")).toBeNull();
        await draw(render(true));
        await openTooltip();
        const tooltip = host.querySelector(".openui-dashboard-tooltip")!;
        expect(tooltip.textContent).toContain("18%");
        expect(tooltip.textContent).toContain("16%");
        expect(tooltip.textContent).toContain("Previous period");
        expect(tooltip.textContent).toContain("+2 pts");
        expect(tooltip.querySelector(`.openui-dashboard-delta-${tone}`)).not.toBeNull();
      });
    }
  }

  test(`mixed marks, gaps and interval bands in ${mode}`, async () => {
    await draw(
      <ThemeProvider mode={mode}>
        {program(
          card(
            'Card("Orders", [TimeSeries(["Jun", "Jul", "Aug"], [Series("Orders", [10, null, 30]), Series("Average", [12, 18, 24], null, "line", [10, 16, 22], [14, 20, 26])], "bar", "number")], "full")',
          ),
        )}
      </ThemeProvider>,
    );
    expect(host.querySelectorAll(".recharts-bar-rectangle")).toHaveLength(2);
    expect(host.querySelectorAll(".recharts-line")).toHaveLength(2);
    expect(host.querySelectorAll(".recharts-area")).toHaveLength(1);
    expect(host.querySelector(".openui-dashboard-summary-edge")).not.toBeNull();
    expect(host.querySelector("table")?.textContent).toContain("—");
  });
}

test("Reference lines and Markers draw labelled chips on the plot", async () => {
  await draw(
    program(
      card(
        `Card("Conversion", [TimeSeries(["Jun", "Jul", "Aug", "Sep"], [Series("Paid", [18, 20, 19, 22])], "line", "percent", false, [Reference("Target", 21)], null, [Marker("Deploy v2.4", "Aug")])], "full")`,
      ),
    ),
  );
  // One horizontal target line and one vertical event line, each with its chip.
  expect(host.querySelectorAll(".recharts-reference-line")).toHaveLength(2);
  const chips = [...host.querySelectorAll(".recharts-reference-line text")].map(
    (t) => t.textContent,
  );
  expect(chips).toEqual(["Target · 21%", "Deploy v2.4"]);
});

test("his Stat catalog entry puts the Stat beside its TimeSeries, and stacks them when narrow", async () => {
  // His original Stat entry: Stat, then a TimeSeries, in one half-width Card.
  const response = metricCatalog[1]!.variants[0]!.program;
  host.style.width = "1200px";
  await draw(program(response));
  const body = host.querySelector<HTMLElement>(".openui-dashboard-card-body")!;
  expect(body.textContent).toContain("18.4K");
  expect(body.querySelector(".recharts-surface")).not.toBeNull();
  // Wide: one grid. The legend shares the Stat's row, at its foot (the delta line), on the
  // right; the plot spans the row below.
  expect(getComputedStyle(body).display).toBe("grid");
  const stat = body.querySelector<HTMLElement>(".openui-dashboard-stat")!;
  const legend = body.querySelector<HTMLElement>(
    ".openui-dashboard-chart > .openui-dashboard-legend",
  )!;
  const plot = body.querySelector<HTMLElement>(".openui-dashboard-chart-plot")!;
  const statBox = stat.getBoundingClientRect();
  const legendBox = legend.getBoundingClientRect();
  expect(legendBox.top).toBeGreaterThanOrEqual(statBox.top);
  expect(Math.abs(legendBox.bottom - statBox.bottom)).toBeLessThan(2);
  expect(legendBox.left).toBeGreaterThan(statBox.right);
  expect(plot.getBoundingClientRect().top).toBeGreaterThan(stat.getBoundingClientRect().bottom - 1);
  // A narrow card (under 480px) stacks them.
  host.style.width = "400px";
  await draw(program(response));
  expect(getComputedStyle(host.querySelector(".openui-dashboard-card-body")!).display).toBe("flex");
});
