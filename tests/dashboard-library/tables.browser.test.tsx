// Use the public source entry so the internal host overrides and filter reporter share its
// contexts, as in metrics.browser.test.tsx. Every specimen still renders through library/Renderer.
import {
  defineComponent,
  reactive,
  Renderer,
  useStateField,
  type ComponentRenderProps,
} from "@openuidev/react-lang";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { z } from "zod/v4";
import { library, ThemeProvider } from "../../packages/libraries/dashboard-next/src/index";
import {
  CompareOverride,
  StateOverride,
  useReportFilter,
} from "../../packages/libraries/dashboard-next/src/shared";
import { tablesCatalog } from "./fixtures/tables";

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
async function click(selector: string) {
  const button = host.querySelector<HTMLButtonElement>(selector)!;
  expect(button).not.toBeNull();
  await act(async () => button.click());
}
const card = (content: string) =>
  `root = Dashboard([Section("", [Row([Card("Details", [${content}], "full")])])])`;
const dashboard = (response: string) => <Renderer library={library} response={response} />;
const catalog = (index: number) => dashboard(tablesCatalog[index]!.variants[0]!.program);
const tableRows = () => [...host.querySelectorAll<HTMLTableRowElement>("tbody tr")];
const firstCells = () => tableRows().map((row) => row.cells[0]?.textContent);

// #219 owns the real filters. This host-only filter exercises the same reactive binding and
// shared filter registry without registering or implementing another ticket's components.
const filterSchema = z.object({ value: reactive(z.string()) });
const TestRegionFilter = defineComponent({
  name: "TestRegionFilter",
  props: filterSchema,
  description: "Test host's region filter",
  component: function TestRegionFilterView({
    props,
  }: ComponentRenderProps<z.infer<typeof filterSchema>>) {
    const field = useStateField("region", props.value);
    useReportFilter("region", field.value);
    return (
      <button type="button" onClick={() => field.setValue(field.value === "all" ? "eu" : "all")}>
        {field.value === "all" ? "Only Europe" : "All regions"}
      </button>
    );
  },
});
const queryLibrary = library.extend({
  components: { add: [{ component: TestRegionFilter, slots: ["Dashboard.children"] }] },
});
const queryProgram = (filter = false) => `$region = "all"
data = Query("accounts", {region: $region}, {rows: []})
root = Dashboard([${filter ? "TestRegionFilter($region), " : ""}Section("", [Row([Card("Accounts", [Table([Column("Account", data.rows.name, "primary"), Column("Revenue", data.rows.revenue, "number", "currency")])], "full")])])])`;

for (const mode of ["light", "dark"] as const) {
  const themed = (children: ReactNode) => <ThemeProvider mode={mode}>{children}</ThemeProvider>;

  test(`catalog Table and Column show rows, formats, totals and trends in ${mode}`, async () => {
    await draw(themed(catalog(0)));
    expect(tableRows()).toHaveLength(6);
    expect(host.querySelectorAll("thead th")).toHaveLength(7);
    for (const text of [
      "Campaigns",
      "Brand search",
      "Learning",
      "$12,400",
      "$20.30",
      "+1.2 pts",
      "-0.8 pts",
      "$64,400",
      "2,451",
    ]) {
      expect(host.textContent).toContain(text);
    }
    expect(host.querySelectorAll("tbody .openui-dashboard-cell-bar-fill")).toHaveLength(6);
    expect(host.querySelectorAll("tbody .openui-dashboard-kpi-spark polyline")).toHaveLength(6);
    expect(host.querySelectorAll("tbody .openui-dashboard-status-shape")).toHaveLength(6);
    expect(getComputedStyle(host.querySelector(".openui-dashboard-table")!).fontSize).toBe("13px");
    const negative = host.querySelector(".openui-dashboard-delta-bad")!;
    expect(getComputedStyle(negative).color).toBe(
      mode === "light" ? "rgb(200, 44, 55)" : "rgb(241, 131, 140)",
    );
    expect(host.querySelector("[data-state=invalid]")).toBeNull();
  });

  for (const compare of [false, true]) {
    test(`KeyValues Previous values give changes with compare ${compare} in ${mode}`, async () => {
      await draw(themed(<CompareOverride value={compare}>{catalog(1)}</CompareOverride>));
      expect(host.querySelectorAll("dl dt")).toHaveLength(5);
      for (const text of [
        "Active accounts",
        "2,847",
        "$14,400",
        "11.4",
        "108.4%",
        "Revenue team",
        "+5.4%",
        "+0.6 pts",
      ]) {
        expect(host.textContent).toContain(text);
      }
      // Faithful to the source: fact-row changes are shown in both modes; the raw previous
      // number is not an extra column, and text rows never get a delta.
      expect(host.querySelectorAll("dl .openui-dashboard-delta")).toHaveLength(4);
      expect(host.querySelector("dl > div:last-child .openui-dashboard-delta")).toBeNull();
    });
  }

  test(`KeyValues respects GoodWhen, neutral and missing values in ${mode}`, async () => {
    await draw(
      themed(
        dashboard(
          card(`KeyValues([
            {label: "Latency", value: 238, format: "ms", previous: 280, goodWhen: "down"},
            {label: "Errors", value: 3.1, format: "percent", previous: 2.9, goodWhen: "down"},
            {label: "Capacity", value: 60, previous: 55, goodWhen: "neutral"},
            {label: "Unknown", value: null}, {label: "Owner", value: ""}
          ])`),
        ),
      ),
    );
    const rows = host.querySelectorAll(".openui-dashboard-kv-row");
    expect(rows[0]?.textContent).toContain("-15%238 ms");
    expect(rows[0]?.querySelector(".openui-dashboard-delta-good")).not.toBeNull();
    expect(rows[1]?.querySelector(".openui-dashboard-delta-bad")).not.toBeNull();
    expect(rows[2]?.querySelector(".openui-dashboard-delta-neutral")).not.toBeNull();
    expect(rows[3]?.textContent).toBe("Unknown—");
    expect(rows[4]?.textContent).toBe("Owner—");
  });

  test(`catalog Goal draws targets, pace and limit overrun in ${mode}`, async () => {
    await draw(themed(catalog(2)));
    expect(host.querySelectorAll(".openui-dashboard-goal")).toHaveLength(4);
    for (const text of [
      "New ARR",
      "$1.84M",
      "$2.5M",
      "36.2%",
      "420 ms",
      "500 ms",
      "2.3%",
      "Ahead of pace",
      "Within limit",
      "Over limit",
    ]) {
      expect(host.textContent).toContain(text);
    }
    expect(host.querySelectorAll(".openui-dashboard-goal-track")).toHaveLength(4);
    expect(host.querySelectorAll(".openui-dashboard-goal-fill")).toHaveLength(5);
    expect(host.querySelectorAll(".openui-dashboard-goal-pace")).toHaveLength(2);
    expect(host.querySelectorAll(".openui-dashboard-goal-mark")).toHaveLength(1);
    const overrun = host.querySelector<HTMLElement>(".openui-dashboard-goal-beyond")!;
    expect(overrun.dataset["state"]).toBe("over");
    expect(parseFloat(overrun.style.width)).toBeCloseTo((0.3 / 2.3) * 100);
    const ahead = host.querySelector(".openui-dashboard-goal-fill[data-state=ahead]")!;
    expect(getComputedStyle(ahead).backgroundColor).toBe(
      mode === "light" ? "rgb(22, 183, 111)" : "rgb(44, 233, 138)",
    );
  });

  test(`Goal handles behind pace, past target, clamped pace and no target in ${mode}`, async () => {
    await draw(
      themed(
        dashboard(
          card(`Goal("Behind", 20, 100, "number", 0.5),
            Goal("Passed", 120, 100, "number", 2),
            Goal("Unset", 5, 0), Goal("Neutral", 10, 100),
            Goal("Early", 10, 100, "number", -1)`),
        ),
      ),
    );
    expect(host.textContent).toContain("Behind pace");
    expect(host.textContent).toContain("Past target");
    expect(host.textContent).toContain("No target set");
    const goals = host.querySelectorAll(".openui-dashboard-goal");
    expect(goals[0]?.querySelector(".openui-dashboard-status-warning")).not.toBeNull();
    expect(goals[2]?.querySelector(".openui-dashboard-goal-mark")).toBeNull();
    expect(goals[3]?.querySelector(".openui-dashboard-goal-state")).toBeNull();
    expect(goals[4]?.querySelector<HTMLElement>(".openui-dashboard-goal-pace")?.style.left).toBe(
      "0%",
    );
    const track = goals[1]!.querySelector(".openui-dashboard-goal-track")!;
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
    const tip = goals[1]!.querySelector(".openui-dashboard-tooltip")!;
    expect(tip.textContent).toContain("Target100");
    expect(tip.textContent).toContain("Expected by now100");
    expect(tip.textContent).toContain("Value120");
  });

  for (const content of ["Table([])", 'Table([Column("Account", [])])', "KeyValues([])"]) {
    test(`${content} draws empty through Card in ${mode}`, async () => {
      await draw(themed(dashboard(card(content))));
      const empty = host.querySelector(".openui-dashboard-card .openui-dashboard-empty")!;
      expect(empty.getAttribute("data-state")).toBe("empty");
      expect(empty.textContent).toContain("No data for this period");
      expect(host.querySelector("[data-state=invalid]")).toBeNull();
    });
  }

  for (const [state, text] of [
    ["loading", "Loading"],
    ["empty", "No data for this period"],
    ["error", "This data didn’t load"],
    ["no-results", "No matching data"],
  ] as const) {
    test(`Card with Table displays the host's ${state} state in ${mode}`, async () => {
      await draw(themed(<StateOverride value={state}>{catalog(0)}</StateOverride>));
      const frame = host.querySelector(".openui-dashboard-card-body > .openui-dashboard-state")!;
      expect(frame.getAttribute("data-state")).toBe(state);
      expect(frame.querySelector(".openui-dashboard-state-layer")?.textContent).toContain(text);
      expect(
        getComputedStyle(frame.querySelector(".openui-dashboard-state-content")!).visibility,
      ).toBe("hidden");
    });
  }

  test(`Query loading and empty states are drawn by Table inside Card in ${mode}`, async () => {
    let resolve!: (data: unknown) => void;
    const pending = new Promise((done) => {
      resolve = done;
    });
    await draw(
      themed(
        <Renderer
          library={library}
          response={queryProgram()}
          toolProvider={{ accounts: () => pending }}
        />,
      ),
    );
    const empty = () => host.querySelector(".openui-dashboard-card .openui-dashboard-empty")!;
    await expect.poll(() => empty()?.getAttribute("data-state")).toBe("loading");
    expect(empty().textContent).toContain("Loading");
    expect(empty().getAttribute("aria-busy")).toBe("true");
    await act(async () => resolve({ rows: [] }));
    await expect.poll(() => empty()?.getAttribute("data-state")).toBe("empty");
    expect(empty().textContent).toContain("No data for this period");
    expect(empty().textContent).toContain("Try a longer date range.");
  });

  test(`Query error is drawn by Table inside Card in ${mode}`, async () => {
    await draw(
      themed(
        <Renderer
          library={library}
          response={queryProgram()}
          toolProvider={{
            accounts: async () => {
              throw new Error("Accounts unavailable");
            },
          }}
        />,
      ),
    );
    const empty = () => host.querySelector(".openui-dashboard-card .openui-dashboard-empty")!;
    await expect.poll(() => empty()?.getAttribute("data-state")).toBe("error");
    expect(empty().textContent).toContain("This data didn’t load");
    expect(empty().textContent).toContain("Try fetching the data again.");
    expect(host.querySelector("[data-state=invalid]")).toBeNull();
  });

  test(`a filter hiding all Query rows draws no results inside Card in ${mode}`, async () => {
    const accounts = vi.fn(async ({ region }: Record<string, unknown>) => ({
      rows: region === "all" ? [{ name: "Acme", revenue: 12400 }] : [],
    }));
    await draw(
      themed(
        <Renderer
          library={queryLibrary}
          response={queryProgram(true)}
          toolProvider={{ accounts }}
        />,
      ),
    );
    await expect.poll(() => host.querySelector("tbody")?.textContent).toContain("Acme");
    expect(host.textContent).toContain("$12,400");
    await click("button");
    const empty = () => host.querySelector(".openui-dashboard-card .openui-dashboard-empty")!;
    await expect.poll(() => empty()?.getAttribute("data-state")).toBe("no-results");
    expect(empty().textContent).toContain("No matching data");
    expect(empty().textContent).toContain("Try changing or clearing a filter.");
    expect(accounts).toHaveBeenLastCalledWith({ region: "eu" });
    await click("button");
    await expect.poll(() => host.querySelector("tbody")?.textContent).toContain("Acme");
    expect(host.querySelector(".openui-dashboard-empty")).toBeNull();
    expect(accounts).toHaveBeenLastCalledWith({ region: "all" });
  });
}

test("Table sorts, pages, groups, searches and totals the matching rows", async () => {
  const table = (search = "", group = "") =>
    card(`Table([
      Column("Account", ["Echo", "Alpha", "Delta", "Bravo", "Charlie"], "primary"),
      Column("Revenue", [20, 40, null, 10, 30], "number", "currency", null, null, "sum"),
      Column("Seats", [2, 4, 0, 1, 3], "number", null, null, null, "average"),
      Column("Plan", ["Team", "Enterprise", "Team", "Enterprise", "Team"], "chip")
    ], 2, true, "${search}", "${group}")`);
  await draw(dashboard(table()));
  expect(firstCells()).toEqual(["Echo", "Alpha"]);
  expect(host.querySelector("tfoot")?.textContent).toContain("$100");
  expect(host.querySelector("tfoot")?.textContent).toContain("2");
  expect(host.querySelector<HTMLButtonElement>('[aria-label="Previous page"]')?.disabled).toBe(
    true,
  );
  await click('[aria-label="Next page"]');
  expect(firstCells()).toEqual(["Delta", "Bravo"]);
  await click("th:nth-child(2) button");
  expect(firstCells()).toEqual(["Alpha", "Charlie"]);
  expect(host.querySelector("th:nth-child(2)")?.getAttribute("aria-sort")).toBe("descending");
  await click("th:nth-child(2) button");
  expect(firstCells()).toEqual(["Bravo", "Echo"]);
  await click('[aria-label="Page 3"]');
  expect(firstCells()).toEqual(["Delta"]); // Missing values stay last in both sort directions.
  expect(host.querySelector<HTMLButtonElement>('[aria-label="Next page"]')?.disabled).toBe(true);
  await draw(dashboard(table("Enterprise")));
  expect(firstCells()).toEqual(["Bravo", "Alpha"]);
  expect(host.querySelector("tfoot")?.textContent).toBe("Total$502.5");
  expect(host.querySelector("nav")).toBeNull();
  await draw(dashboard(table("", "Plan")));
  expect(host.querySelector(".openui-dashboard-group-label")?.textContent).toBe("Enterprise2");
  expect(
    tableRows().filter((row) => !row.classList.contains("openui-dashboard-table-group")),
  ).toHaveLength(2);
  await draw(dashboard(table("  ALPHA  ")));
  expect(host.querySelector("tbody")?.textContent).toContain("Alpha");
  await draw(dashboard(table("missing")));
  expect(host.querySelector(".openui-dashboard-empty")?.textContent).toContain(
    "No rows match “missing”",
  );
  expect(host.textContent).toContain("Try a different search.");
});

test("all Column kinds preserve their text, marks and formatting", async () => {
  await draw(
    dashboard(
      card(`Table([
        Column("Primary", ["Acme", "Beta"], "primary"),
        Column("Text", ["Note", null], "text"),
        Column("Number", [35, 27.4], "number", "percent"),
        Column("Bar", [12, 6], "bar"),
        Column("Delta", [-0.03, 0], "delta", "percent", null, "down"),
        Column("Status", ["Good", "Other"], "badge", null, {Good: "good"}),
        Column("Trend", [[1, 3, 2], [2, null, 4]], "sparkline"),
        Column("Tags", [["Team", "US"], ["EU"]], "chip"),
        Column("Date", ["2026-11-08", "not a date"], "date"),
        Column("Progress", [120, -5], "progress"),
        Column("Health", [["good", "warning", "bad", null], ["good"]], "states"),
        Column("Website", ["https://example.com/", "example.org"], "link"),
        Column("Owner", ["Mira Shah", "Kai"], "person")
      ])`),
    ),
  );
  expect(host.querySelectorAll("th")).toHaveLength(13);
  expect(tableRows()).toHaveLength(2);
  for (const text of [
    "Acme",
    "Note",
    "—",
    "35.0%",
    "27.4%",
    "-0.03 pts",
    "not a date",
    "Mira Shah",
  ]) {
    expect(host.textContent).toContain(text);
  }
  expect(host.querySelector(".openui-dashboard-delta-good")?.textContent).toBe("-0.03 pts");
  expect(host.querySelector(".openui-dashboard-delta-neutral")?.textContent).toBe("0.0 pts");
  expect(host.querySelectorAll(".openui-dashboard-cell-chip")).toHaveLength(5);
  expect(host.querySelectorAll(".openui-dashboard-kpi-status-dots > span")).toHaveLength(5);
  expect(host.querySelector('[aria-label="1 of 4 good"]')).not.toBeNull();
  expect(host.querySelectorAll(".openui-dashboard-kpi-spark polyline")).toHaveLength(2);
  const cells = tableRows()[0]!.cells;
  expect(cells[9]?.querySelector<HTMLElement>(".openui-dashboard-cell-bar-fill")?.style.width).toBe(
    "100%",
  );
  expect(
    tableRows()[1]!.cells[9]?.querySelector<HTMLElement>(".openui-dashboard-cell-bar-fill")?.style
      .width,
  ).toBe("0%");
  expect(host.querySelector("time")?.getAttribute("datetime")).toBe("2026-11-08");
  expect(host.querySelector("time")?.textContent).toContain("Nov 8");
  const links = host.querySelectorAll<HTMLAnchorElement>(".openui-dashboard-cell-link");
  expect(links[0]?.textContent).toBe("example.com");
  expect(links[0]?.target).toBe("_blank");
  expect(links[0]?.rel).toBe("noopener noreferrer");
  expect(links[1]?.href).toBe("https://example.org/");
  expect(
    [...host.querySelectorAll(".openui-dashboard-avatar")].map((node) => node.textContent),
  ).toEqual(["M", "K"]);
  expect(host.querySelector("th:nth-child(7) button")).toBeNull();
  expect(host.querySelector("th:nth-child(11) button")).toBeNull();
});

test("long Table pagination keeps endpoints and gaps around the current page", async () => {
  const names = Array.from({ length: 20 }, (_, i) => `Account ${i + 1}`);
  await draw(dashboard(card(`Table([Column("Account", ${JSON.stringify(names)})], 1)`)));
  expect(host.querySelectorAll(".openui-dashboard-pager-gap")).toHaveLength(1);
  await click('[aria-label="Page 20"]');
  expect(firstCells()).toEqual(["Account 20"]);
  await click('[aria-label="Page 16"]');
  await click('[aria-label="Page 15"]');
  expect(host.querySelectorAll(".openui-dashboard-pager-gap")).toHaveLength(2);
  expect(host.querySelector('[aria-current="page"]')?.textContent).toBe("15");
  expect(host.querySelector("nav")?.getAttribute("aria-label")).toBe("Rows 15–15 of 20");
});
