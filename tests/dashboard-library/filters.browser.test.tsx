import { Renderer } from "@openuidev/react-lang";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { library, ThemeProvider } from "../../packages/libraries/dashboard/src/index";
import { StateOverride } from "../../packages/libraries/dashboard/src/shared/viewState";
import { filtersFixtures } from "./fixtures/filters";

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
async function click(element: Element) {
  await act(async () => (element as HTMLElement).click());
}
const render = (program: string, streaming = false) => (
  <Renderer library={library} response={program} isStreaming={streaming} />
);
const option = (text: string) =>
  [...document.querySelectorAll('[role="option"]')].find((node) => node.textContent === text)!;
const choices = '[{value: "all", label: "All"}, {value: "team", label: "Team"}]';
const program = (filter: string, variable = '$plan = "all"') => `${variable}
values = {all: 1200, team: 3400}
root = Dashboard([FilterBar([${filter}]), Section("", [Kpis([Kpi("Revenue", values[$plan], "currency", 1000, "up", null, [1, 2, 3], [1, 1, 2])]), Row([Card("Sales", [Stat(values[$plan], "currency", 1000)], "full")])])`;

for (const mode of ["light", "dark"] as const) {
  for (const fixture of filtersFixtures) {
    test(`${fixture.name} catalog in ${mode}`, async () => {
      await draw(<ThemeProvider mode={mode}>{render(fixture.program)}</ThemeProvider>);
      expect(host.textContent).toContain(fixture.text);
      expect(host.querySelector('[data-state="invalid"]')).toBeNull();
    });
  }
  for (const kind of ["PeriodPicker", "ChipFilter", "SelectFilter"] as const) {
    test(`${kind} updates dependent Kpi and Card in ${mode}`, async () => {
      const filter =
        kind === "SelectFilter"
          ? `SelectFilter("plan", "Plan", ${choices}, $plan)`
          : `${kind}("plan", ${choices}, $plan)`;
      await draw(<ThemeProvider mode={mode}>{render(program(filter))}</ThemeProvider>);
      expect(host.querySelector('[aria-label="Revenue"]')?.textContent).toContain("$1,200");
      if (kind === "SelectFilter") {
        await click(host.querySelector(".openui-dashboard-filter-button")!);
        expect(document.querySelectorAll('[role="option"]')).toHaveLength(2);
        await click(option("Team"));
      } else {
        expect(host.querySelectorAll('[role="radio"]')).toHaveLength(2);
        await click(host.querySelectorAll('[role="radio"]')[1]!);
      }
      expect(host.querySelector('[aria-label="Revenue"]')?.textContent).toContain("$3,400");
      expect(host.querySelector('[aria-label="Sales"]')?.textContent).toContain("$3,400");
    });
  }
  test(`CompareToggle turns previous sparkline on and off in ${mode}`, async () => {
    await draw(<ThemeProvider mode={mode}>{render(program("CompareToggle()"))}</ThemeProvider>);
    expect(host.querySelectorAll(".openui-dashboard-kpi-spark polyline")).toHaveLength(1);
    await click(host.querySelector(".openui-dashboard-filter-button")!);
    await click(option("Previous period"));
    expect(host.querySelectorAll(".openui-dashboard-kpi-spark polyline")).toHaveLength(2);
    await click(host.querySelector(".openui-dashboard-filter-button")!);
    await click(option("None"));
    expect(host.querySelectorAll(".openui-dashboard-kpi-spark polyline")).toHaveLength(1);
  });
  test(`calendar is themed and applies a custom range in ${mode}`, async () => {
    const response =
      'root = Dashboard([FilterBar([DateRangeFilter("range", "2026-01-01..2026-01-10")])])';
    await draw(<ThemeProvider mode={mode}>{render(response)}</ThemeProvider>);
    expect(host.textContent).toContain("Jan 1 – Jan 10, 2026");
    await click(host.querySelector(".openui-dashboard-filter-button")!);
    const panel = document.querySelector(".openui-dashboard-popover")!;
    expect(host.contains(panel)).toBe(false);
    expect(getComputedStyle(panel).getPropertyValue("--openui-dashboard-page").trim()).toBe(
      mode === "light" ? "#ffffff" : "#141414",
    );
    expect(getComputedStyle(panel).backgroundColor).toBe(
      getComputedStyle(host.querySelector(".openui-dashboard-filter-button")!).backgroundColor,
    );
    expect(panel.querySelectorAll(".openui-dashboard-cal-day")).toHaveLength(31);
    expect(panel.querySelectorAll('[role="option"]')).toHaveLength(5);
    await click(panel.querySelector('[data-day="2026-01-02"]')!);
    await click(panel.querySelector('[data-day="2026-01-05"]')!);
    await click(panel.querySelector(".openui-dashboard-button-primary")!);
    expect(host.textContent).toContain("Jan 2 – Jan 5, 2026");
    expect(document.querySelector(".openui-dashboard-popover")).toBeNull();
  });
  test(`multi-select keeps the last choice and restores all in ${mode}`, async () => {
    await draw(
      <ThemeProvider mode={mode}>
        {render(`root = Dashboard([FilterBar([MultiSelectFilter("plans", "Plan", ${choices})])])`)}
      </ThemeProvider>,
    );
    await click(host.querySelector(".openui-dashboard-filter-button")!);
    const inputs = [
      ...document.querySelectorAll<HTMLInputElement>(".openui-dashboard-multi input"),
    ];
    expect(inputs).toHaveLength(2);
    expect(inputs.every((input) => input.checked)).toBe(true);
    await click(inputs[0]!);
    expect(inputs[1]!.disabled).toBe(true);
    expect(host.textContent).toContain("Team");
    await click(document.querySelector(".openui-dashboard-multi-foot button")!);
    expect(inputs.every((input) => input.checked)).toBe(true);
    expect(host.textContent).toContain("All");
  });
  for (const [state, text] of [
    ["loading", "Loading"],
    ["empty", "No data"],
    // A Card shows each state's full title (his STATE_COPY); "Didn’t load" and "No results"
    // are the short forms for Kpi tiles.
    ["error", "This data didn’t load"],
    ["no-results", "No matching data"],
  ] as const) {
    test(`filter and dependent Card ${state} in ${mode}`, async () => {
      await draw(
        <ThemeProvider mode={mode}>
          <StateOverride value={state}>
            {render(program(`ChipFilter("plan", ${choices}, $plan)`))}
          </StateOverride>
        </ThemeProvider>,
      );
      expect(
        host.querySelector(".openui-dashboard-card-body .openui-dashboard-state-layer")
          ?.textContent,
      ).toContain(text);
      expect(host.querySelectorAll('[role="radio"]')).toHaveLength(2);
    });
  }
}

test("Card header controls switch data and keyboard arrows select chips", async () => {
  await draw(
    render(`$plan = "all"
values = {all: 1200, team: 3400}
root = Dashboard([Section("", [Row([Card("Sales", [Stat(values[$plan], "currency")], "full", null, [ChipFilter("plan", ${choices}, $plan), SelectFilter("plan", "Plan", ${choices}, $plan)])])])])`),
  );
  await act(async () =>
    host
      .querySelector('[role="radio"]')!
      .dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })),
  );
  expect(host.querySelector(".openui-dashboard-card-body")?.textContent).toContain("$3,400");
});

test("streaming locks filters", async () => {
  await draw(
    render(
      program(
        `PeriodPicker("plan", ${choices}, $plan), ChipFilter("plan", ${choices}, $plan), SelectFilter("plan", "Plan", ${choices}, $plan), DateRangeFilter("range"), MultiSelectFilter("multi", "Plan", ${choices}), SearchFilter("q"), CompareToggle()`,
      ),
      true,
    ),
  );
  const controls = [
    ...host.querySelectorAll<HTMLButtonElement | HTMLInputElement>(
      ".openui-dashboard-filterbar-items button, .openui-dashboard-filterbar-items input",
    ),
  ];
  expect(controls.length).toBeGreaterThan(7);
  expect(controls.every((control) => control.disabled)).toBe(true);
});

test("SearchFilter writes its variable and clears the dependent value", async () => {
  await draw(
    render(`$q = ""
root = Dashboard([FilterBar([SearchFilter("q", "Search campaigns", $q)]), Section("", [Kpis([Kpi("Query", $q)])])])`),
  );
  const input = host.querySelector<HTMLInputElement>('input[type="search"]')!;
  expect(input.getAttribute("aria-label")).toBe("Search campaigns");
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(
      input,
      "Revenue",
    );
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  expect(host.querySelector('[aria-label="Query"]')?.textContent).toContain("Revenue");
  await click(host.querySelector('[aria-label="Clear search"]')!);
  expect(input.value).toBe("");
  expect(document.activeElement).toBe(input);
});

test("Compare choices use their bound Previous data and name the delta", async () => {
  await draw(
    render(`$compare = "off"
previous = {off: 80, prev: 80, yoy: 50}
root = Dashboard([FilterBar([CompareToggle(null, false, [{value: "prev", label: "Last month"}, {value: "yoy", label: "Last year"}], "compare", $compare)]), Section("", [Row([Card("Revenue", [Stat(100, "currency", previous[$compare], "up")])])])])`),
  );
  await click(host.querySelector(".openui-dashboard-filter-button")!);
  await click(option("Last year"));
  expect(host.querySelector(".openui-dashboard-card-body")?.textContent).toContain("+100%");
  expect(host.querySelector(".openui-dashboard-card-body")?.textContent?.toLowerCase()).toContain(
    "last year",
  );
  await click(host.querySelector(".openui-dashboard-filter-button")!);
  await click(option("Last month"));
  expect(host.querySelector(".openui-dashboard-card-body")?.textContent).toContain("+25%");
});

test("Escape closes a portalled menu and returns focus to its trigger", async () => {
  await draw(render(program(`SelectFilter("plan", "Plan", ${choices}, $plan)`)));
  const trigger = host.querySelector<HTMLButtonElement>(".openui-dashboard-filter-button")!;
  await click(trigger);
  expect(document.activeElement?.getAttribute("role")).toBe("option");
  await act(async () =>
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })),
  );
  expect(document.querySelector(".openui-dashboard-popover")).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

test("a filter reloads the Query that reads its $variable", async () => {
  const asked: unknown[] = [];
  const metrics = async (args: Record<string, unknown>) => {
    asked.push(args["plan"]);
    return { value: args["plan"] === "team" ? 3400 : 1200 };
  };
  await draw(
    <Renderer
      library={library}
      toolProvider={{ metrics }}
      response={`$plan = "all"
data = Query("metrics", {plan: $plan}, {value: 0})
root = Dashboard([FilterBar([ChipFilter("plan", ${choices}, $plan)]), Section("", [Row([Card("Sales", [Stat(data.value, "currency")], "full")])])])`}
    />,
  );
  const sales = () => host.querySelector('[aria-label="Sales"]')?.textContent;
  await expect.poll(sales).toContain("$1,200");
  await click([...host.querySelectorAll('[role="radio"]')].find((n) => n.textContent === "Team")!);
  await expect.poll(sales).toContain("$3,400");
  expect(asked).toContain("team");
});

const darkInk = "rgb(250, 250, 250)";
test("a portalled menu carries the dark theme and the dashboard's base styles", async () => {
  await draw(
    <ThemeProvider mode="dark">
      {render(program(`SelectFilter("plan", "Plan", ${choices}, $plan)`))}
    </ThemeProvider>,
  );
  await click(host.querySelector(".openui-dashboard-filter-button")!);
  const popover = document.querySelector<HTMLElement>(".openui-dashboard-popover")!;
  expect(host.contains(popover)).toBe(false);
  expect(getComputedStyle(popover).backgroundColor).toBe("rgb(21, 21, 21)");
  expect(getComputedStyle(option("Team")).color).toBe(darkInk);
  // Border-box, as inside the dashboard: the menu is exactly its set width.
  expect(getComputedStyle(popover).boxSizing).toBe("border-box");
  expect(popover.getBoundingClientRect().width).toBe(parseFloat(popover.style.width));
});

test("a portalled menu carries the provider's overrides", async () => {
  await draw(
    <ThemeProvider mode="dark" darkTheme={{ surface: "#234567" }}>
      {render(program(`SelectFilter("plan", "Plan", ${choices}, $plan)`))}
    </ThemeProvider>,
  );
  await click(host.querySelector(".openui-dashboard-filter-button")!);
  const popover = document.querySelector<HTMLElement>(".openui-dashboard-popover")!;
  expect(getComputedStyle(popover).backgroundColor).toBe("rgb(35, 69, 103)");
  expect(getComputedStyle(popover).colorScheme).toBe("dark");
});

test("a narrow FilterBar opens a themed sheet whose filters still drive the cards", async () => {
  host.style.width = "480px";
  await draw(
    <ThemeProvider mode="dark">
      {render(program(`ChipFilter("plan", ${choices}, $plan)`))}
    </ThemeProvider>,
  );
  const menu = host.querySelector<HTMLElement>(".openui-dashboard-filterbar-menu")!;
  expect(getComputedStyle(menu).display).not.toBe("none");
  await click(menu);
  const sheet = document.querySelector<HTMLElement>('.openui-dashboard-sheet[role="dialog"]')!;
  expect(host.contains(sheet)).toBe(false);
  expect(getComputedStyle(sheet).color).toBe(darkInk);
  await click([...sheet.querySelectorAll('[role="radio"]')].find((n) => n.textContent === "Team")!);
  expect(host.querySelector('[aria-label="Sales"]')?.textContent).toContain("$3,400");
  await click(sheet.querySelector('[aria-label="Close"]')!);
  expect(document.querySelector(".openui-dashboard-sheet")).toBeNull();
});

test("arrow keys move through a menu and across the calendar", async () => {
  await draw(
    render(`root = Dashboard([FilterBar([DateRangeFilter("range", "2026-01-01..2026-01-10")])])`),
  );
  await click(host.querySelector(".openui-dashboard-filter-button")!);
  const key = async (target: Element, name: string) =>
    act(async () => {
      target.dispatchEvent(new KeyboardEvent("keydown", { key: name, bubbles: true }));
    });
  // The presets are a menu: ArrowDown moves to the next one.
  const presets = [
    ...document.querySelectorAll<HTMLElement>(".openui-dashboard-range-presets [role='option']"),
  ];
  await act(async () => presets[0]!.focus());
  await key(presets[0]!, "ArrowDown");
  expect(document.activeElement).toBe(presets[1]);
  // The calendar is a grid with one tab stop: arrows move it a day or a week.
  const grid = document.querySelector<HTMLElement>(".openui-dashboard-cal-grid")!;
  const stop = grid.querySelector<HTMLElement>('[tabindex="0"]')!;
  await act(async () => stop.focus());
  const day = stop.dataset["day"]!;
  const shift = (by: number) => {
    const [y, m, d] = day.split("-").map(Number);
    const date = new Date(y!, m! - 1, d! + by);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };
  await key(stop, "ArrowRight");
  expect((document.activeElement as HTMLElement).dataset["day"]).toBe(shift(1));
  await key(document.activeElement!, "ArrowDown");
  expect((document.activeElement as HTMLElement).dataset["day"]).toBe(shift(8));
});
