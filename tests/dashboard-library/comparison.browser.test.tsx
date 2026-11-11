// Source entry point keeps the public library and internal host overrides on the same contexts.
import { Renderer } from "@openuidev/react-lang";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { comparisonGroup } from "../../packages/libraries/dashboard-next/src/groups/comparison";
import { library, ThemeProvider } from "../../packages/libraries/dashboard-next/src/index";
import { CompareOverride, StateOverride } from "../../packages/libraries/dashboard-next/src/shared";
import { comparisonFixtures } from "./fixtures/comparison";

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
const card = (content: string) =>
  `root = Dashboard([Section("", [Row([Card("Comparison", [${content}], "full")])])])`;
const render = (response: string, isStreaming = false) => (
  <Renderer library={library} response={response} isStreaming={isStreaming} />
);
async function hover(row: HTMLElement) {
  const box = row.getBoundingClientRect();
  await act(async () => {
    row.dispatchEvent(
      new MouseEvent("mousemove", {
        bubbles: true,
        clientX: box.left + 20,
        clientY: box.top + 10,
      }),
    );
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
}
const rowCount = (selector: string) => host.querySelectorAll(selector).length;

const cases = [
  { name: "Bars", selector: ".recharts-bar-rectangle", count: 5, value: "$2.4M" },
  { name: "Leaderboard", selector: ".openui-dashboard-rank-row", count: 6, value: "8,420" },
  { name: "Dumbbell", selector: ".openui-dashboard-hrow", count: 6, value: "27.4%" },
  { name: "Distribution", selector: ".openui-dashboard-hrow", count: 8, value: "62 ms" },
  { name: "Intervals", selector: ".openui-dashboard-hrow", count: 6, value: "6.8%" },
];
const emptyComponents = [
  'Bars([], [Series("Revenue", [])])',
  "Leaderboard([], [])",
  "Dumbbell([], [], [])",
  "Distribution([], [], [], [], [], [])",
  "Intervals([], [], [], [])",
];

for (const mode of ["light", "dark"] as const) {
  for (const [i, fixture] of comparisonFixtures.entries()) {
    const spec = cases[i]!;
    test(`${fixture.name} renders its catalog in ${mode}`, async () => {
      await draw(<ThemeProvider mode={mode}>{render(fixture.program)}</ThemeProvider>);
      expect(host.querySelector(".openui-dashboard-card")).not.toBeNull();
      expect(host.textContent).toContain(fixture.text);
      expect(host.textContent).toContain(spec.value);
      await expect.poll(() => rowCount(spec.selector)).toBe(spec.count);
      expect(host.querySelector("[data-state=invalid]")).toBeNull();
      if (fixture.name === "Distribution" || fixture.name === "Dumbbell") {
        expect(
          getComputedStyle(host.querySelector(".openui-dashboard-rowchart-rows")!).display,
        ).toBe("grid");
      }
    });

    for (const [state, copy] of [
      ["loading", "Loading"],
      ["empty", "No data for this period"],
      ["error", "This data didn’t load"],
      ["no-results", "No matching data"],
    ] as const) {
      test(`${fixture.name} Card shows ${state} in ${mode}`, async () => {
        await draw(
          <ThemeProvider mode={mode}>
            <StateOverride value={state}>{render(fixture.program)}</StateOverride>
          </ThemeProvider>,
        );
        const frame = host.querySelector(".openui-dashboard-card-body > .openui-dashboard-state")!;
        expect(frame.getAttribute("data-state")).toBe(state);
        expect(frame.querySelector(".openui-dashboard-state-layer")?.textContent).toContain(copy);
        expect(
          getComputedStyle(frame.querySelector(".openui-dashboard-state-content")!).visibility,
        ).toBe("hidden");
        if (state === "no-results")
          expect(frame.textContent).toContain("Try changing or clearing a filter.");
      });
    }

    test(`${fixture.name} with no categories shows empty through a Card in ${mode}`, async () => {
      await draw(<ThemeProvider mode={mode}>{render(card(emptyComponents[i]!))}</ThemeProvider>);
      const empty = host.querySelector(".openui-dashboard-card-body .openui-dashboard-empty")!;
      expect(empty.getAttribute("data-state")).toBe("empty");
      expect(empty.textContent).toContain("No data for this period");
      expect(host.querySelector("[data-state=invalid]")).toBeNull();
    });
  }

  test(`Bars Compare mode adds previous bars in ${mode}`, async () => {
    const program = card(
      'Bars(["North", "South"], [Series("Sales", [1200, 2400], [1000, 2100])], "currency")',
    );
    await draw(
      <ThemeProvider mode={mode}>
        <CompareOverride value={false}>{render(program)}</CompareOverride>
      </ThemeProvider>,
    );
    await expect.poll(() => rowCount(".recharts-bar-rectangle")).toBe(2);
    await draw(
      <ThemeProvider mode={mode}>
        <CompareOverride value={true}>{render(program)}</CompareOverride>
      </ThemeProvider>,
    );
    // Both categories get a previous bar: North's and South's.
    await expect.poll(() => rowCount(".recharts-bar-rectangle")).toBe(4);
    expect(host.textContent).toContain("Previous period");
    expect(host.textContent).toContain("$1,200");
  });

  test(`Bars tooltip reads each category's previous value from the keyboard in ${mode}`, async () => {
    // Vertical bars: recharts' keyboard navigation steps through categories along the x axis
    // only, so in horizontal Bars (categories down the y axis, his default) arrow keys stay on
    // the first category, as in his library.
    const program = card(
      'Bars(["North", "South"], [Series("Sales", [1200, 2400], [1000, 2100])], "currency", "vertical")',
    );
    await draw(
      <ThemeProvider mode={mode}>
        <CompareOverride value={true}>{render(program)}</CompareOverride>
      </ThemeProvider>,
    );
    await expect.poll(() => rowCount(".recharts-bar-rectangle")).toBe(4);
    // Keyboard focus on a category exposes its current and previous values in the tooltip.
    const chart = host.querySelector<HTMLElement>('.recharts-wrapper [tabindex="0"]')!;
    expect(chart).not.toBeNull();
    await act(async () => {
      chart.focus();
    });
    await expect.poll(() => host.textContent).toContain("$1,000");
    await act(async () => {
      chart.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    });
    await expect.poll(() => host.textContent).toContain("$2,100");
  });

  test(`Leaderboard keeps its previous values and sorts in ${mode}`, async () => {
    await draw(
      <ThemeProvider mode={mode}>
        <CompareOverride value={true}>
          {render(
            card(
              'Leaderboard(["Low", "High", "Middle"], [100, 300, 200], "number", [80, 350, 180], "down", 2)',
            ),
          )}
        </CompareOverride>
      </ThemeProvider>,
    );
    expect(rowCount(".openui-dashboard-rank-row")).toBe(2);
    expect(host.querySelector(".openui-dashboard-rank-name")?.textContent).toBe("High");
    expect(
      host.querySelector(".openui-dashboard-rank-row .openui-dashboard-delta-good"),
    ).not.toBeNull();
    await act(async () =>
      host.querySelector<HTMLButtonElement>(".openui-dashboard-sort-toggle")!.click(),
    );
    expect(host.querySelector(".openui-dashboard-rank-name")?.textContent).toBe("Middle");
    const high = [...host.querySelectorAll<HTMLElement>(".openui-dashboard-rank-row")].find((row) =>
      row.textContent?.includes("High"),
    )!;
    await hover(high);
    await expect.poll(() => host.textContent).toContain("Previous");
    expect(host.textContent).toContain("350");
  });

  test(`diverging Bars distinguish signs with textures in ${mode}`, async () => {
    await draw(
      <ThemeProvider mode={mode}>
        {render(
          card(
            'Bars(["Ahead", "Behind"], [Series("Variance", [12, -8])], "number", null, null, null, null, ["Above plan", "Below plan"])',
          ),
        )}
      </ThemeProvider>,
    );
    await expect.poll(() => rowCount(".recharts-bar-rectangle")).toBe(2);
    expect(host.textContent).toContain("Above plan");
    expect(host.textContent).toContain("Below plan");
    const fills = [...host.querySelectorAll(".recharts-bar-rectangle path")].map((mark) =>
      mark.getAttribute("fill"),
    );
    expect(fills[0]).toContain("div-tex-0");
    expect(fills[1]).toContain("div-tex-1");
  });

  test(`grouped Bars show previous ticks and reference lines in ${mode}`, async () => {
    const program = card(
      'Bars(["North", "South"], [Series("Sales", [20, 30], [18, 35]), Series("Returns", [5, 8], [7, 6])], "number", "vertical", false, "down", [Reference("Target", 25)])',
    );
    await draw(
      <ThemeProvider mode={mode}>
        <CompareOverride value={true}>{render(program)}</CompareOverride>
      </ThemeProvider>,
    );
    await expect.poll(() => rowCount(".recharts-bar-rectangle")).toBe(4);
    expect(
      host.querySelectorAll('.recharts-bar-rectangle line[stroke-dasharray="2 2"]'),
    ).toHaveLength(4);
    expect(host.textContent).toContain("Target · 25");
    expect(host.textContent).toContain("Previous period");
    expect(host.textContent).toContain("Sales");
    expect(host.textContent).toContain("Returns");
  });

  test(`percent Bars stack categories in ${mode}`, async () => {
    await draw(
      <ThemeProvider mode={mode}>
        {render(
          card(
            'Bars(["North", "South"], [Series("New", [20, 30]), Series("Returning", [80, 70])], "number", "vertical", "percent")',
          ),
        )}
      </ThemeProvider>,
    );
    await expect.poll(() => rowCount(".recharts-bar-rectangle")).toBe(4);
    expect(host.textContent).toContain("100%");
    expect(host.textContent).toContain("North");
    expect(host.textContent).toContain("South");
  });

  test(`Intervals neutral mode names clear effects without judging direction in ${mode}`, async () => {
    await draw(
      <ThemeProvider mode={mode}>
        {render(
          card(
            'Intervals(["Lower", "Higher", "Uncertain"], [-3, 4, 0], [-5, 2, -1], [-1, 6, 1], "number", 0, "Reference", "neutral")',
          ),
        )}
      </ThemeProvider>,
    );
    const legend = host.querySelector(".openui-dashboard-legend")!;
    expect(legend.textContent).toContain("Clear effect");
    expect(legend.textContent).toContain("No clear effect");
    expect(legend.textContent).not.toContain("Better");
    expect(legend.textContent).not.toContain("Worse");
  });

  test(`GoodWhen reverses Dumbbell and Intervals in ${mode}`, async () => {
    await draw(
      <ThemeProvider mode={mode}>
        {render(
          card(
            'Dumbbell(["Latency", "Errors"], [100, 100], [80, 120], "ms", "Before", "After", "down")',
          ),
        )}
      </ThemeProvider>,
    );
    const rows = host.querySelectorAll(".openui-dashboard-hrow");
    expect(rows[0]?.querySelector(".openui-dashboard-delta-good")).not.toBeNull();
    expect(rows[1]?.querySelector(".openui-dashboard-delta-bad")).not.toBeNull();
    await draw(
      <ThemeProvider mode={mode}>
        {render(
          card(
            'Intervals(["Lower", "Higher", "Uncertain"], [-3, 4, 0], [-5, 2, -1], [-1, 6, 1], "percent", 0, "No effect", "down")',
          ),
        )}
      </ThemeProvider>,
    );
    expect(rowCount(".openui-dashboard-hrow")).toBe(3);
    for (const copy of ["Better", "Worse", "No clear effect", "No effect"])
      expect(host.textContent).toContain(copy);
    const first = host.querySelector<HTMLElement>(".openui-dashboard-hrow")!;
    await hover(first);
    await expect.poll(() => host.textContent).toContain("Better");
    expect(host.textContent).toContain("-3%");
  });
}

test("Comparison's Series and Reference copies drop out once Trends registers its own", () => {
  const names = (group: { components: readonly { name: string }[] }) =>
    group.components.map((component) => component.name);
  expect(names(comparisonGroup(new Set(["TimeSeries", "Series", "Reference"])))).toEqual([
    "Bars",
    "Leaderboard",
    "Dumbbell",
    "Distribution",
    "Intervals",
  ]);
  // Without Trends, as on this branch, Comparison brings them.
  expect(names(comparisonGroup(new Set()))).toEqual([
    "Bars",
    "Leaderboard",
    "Dumbbell",
    "Distribution",
    "Intervals",
    "Series",
    "Reference",
  ]);
});

test("Bars from a Query load, come back empty, fail, or are emptied by a filter, as a reader sees", async () => {
  let respond!: (data: unknown) => void;
  let fail!: (error: Error) => void;
  const sales = (args: Record<string, unknown>) =>
    new Promise((resolve, reject) => {
      respond = resolve;
      fail = reject;
      void args;
    });
  const program = `$plan = "all"
data = Query("sales", {plan: $plan}, {labels: [], values: []})
root = Dashboard([FilterBar([ChipFilter("plan", [{value: "all", label: "All"}, {value: "team", label: "Team"}], $plan)]), Section("", [Row([Card("Sales", [Bars(data.labels, [Series("Sales", data.values)], "currency")], "full")])])])`;
  await draw(<Renderer library={library} response={program} toolProvider={{ sales }} />);
  const body = () => host.querySelector('[aria-label="Sales"] .openui-dashboard-card-body')!;
  const state = () => body().querySelector("[data-state]")?.getAttribute("data-state");
  // Fetching: a skeleton.
  await expect.poll(state).toBe("loading");
  // Nothing for the starting filters: "no data", not a filter problem.
  await act(async () => respond({ labels: [], values: [] }));
  await expect.poll(state).toBe("empty");
  expect(body().textContent).toContain("No data for this period");
  // The reader picks a plan that has nothing: the filters hid everything.
  await act(async () =>
    [...host.querySelectorAll<HTMLElement>('[role="radio"]')]
      .find((node) => node.textContent === "Team")!
      .click(),
  );
  await act(async () => respond({ labels: [], values: [] }));
  await expect.poll(state).toBe("no-results");
  expect(body().textContent).toContain("Try changing or clearing a filter.");
  // Back to All, and the query fails: the data didn't load.
  await act(async () =>
    [...host.querySelectorAll<HTMLElement>('[role="radio"]')]
      .find((node) => node.textContent === "All")!
      .click(),
  );
  await act(async () => fail(new Error("Fixture data unavailable")));
  await expect.poll(state).toBe("error");
  expect(body().textContent).toContain("This data didn’t load");
  // react-lang logs the failed query; that is the only console error this test allows.
  expect(errors.mock.calls.map(([message]) => String(message))).toEqual(['Query "sales" failed:']);
  errors.mockClear();
});
