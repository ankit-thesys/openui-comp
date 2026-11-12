// Use the public source entry so the internal host overrides and filter reporter share its
// contexts, as in metrics.browser.test.tsx. Every specimen still renders through library/Renderer.
import { Renderer } from "@openuidev/react-lang";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { library, ThemeProvider } from "../../packages/libraries/dashboard/src/index";

let host: HTMLDivElement;
let root: Root;
let errors: ReturnType<typeof vi.spyOn>;
let expectRendererReport = false;
beforeEach(() => {
  expectRendererReport = false;
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
  // The Renderer reports a program's errors with one console.error. A test that feeds it a
  // broken program or a failing query on purpose says so; any other console.error fails the test.
  const isReport = (call: unknown[]) => String(call[0]).startsWith("[openui] Rendered with");
  expect(calls.filter((call) => !isReport(call))).toEqual([]);
  expect(calls.some(isReport)).toBe(expectRendererReport);
});
async function draw(children: ReactNode) {
  await act(async () => root.render(children));
}
// Regression tests for the layout and formatting bugs found in live tests of 1.0.0
// (opendashboards.com and the sales demo). Each block names the finding it covers.

const dashboard = (rows: string, program = "") => (
  <Renderer library={library} response={`${program}root = Dashboard([Section("", [${rows}])])`} />
);
async function frames(count = 4) {
  for (let i = 0; i < count; i++)
    await act(async () => {
      await new Promise(requestAnimationFrame);
    });
}
const height = (element: Element | null) => element!.getBoundingClientRect().height;
const texts = () =>
  [...host.querySelectorAll("svg text")].map((text) => text.textContent).filter(Boolean);
const regions = (n: number) =>
  `Column("Region", [${Array.from({ length: n }, (_, i) => `"Region ${i + 1}"`).join(", ")}], "primary"), Column("Net sales", [${Array.from({ length: n }, (_, i) => 1000 * (i + 1)).join(", ")}], "number", "currency")`;

// 1. A lone card stretched to the Row's height: a 4-row Table sat in a 560px card.
for (const mode of ["light", "dark"] as const) {
  test(`a card of content that sizes itself fits it, in ${mode}`, async () => {
    await draw(
      <ThemeProvider mode={mode}>
        {dashboard(`Row([Card("Regions", [Table([${regions(4)}])], "full")])`)}
      </ThemeProvider>,
    );
    const row = host.querySelector(".openui-dashboard-row")!;
    expect(row.hasAttribute("data-fit")).toBe(true);
    const card = host.querySelector(".openui-dashboard-card")!;
    // Header, title and four 36px rows: well short of the 560px it used to take.
    expect(height(card)).toBeLessThan(300);
    const body = card.querySelector(".openui-dashboard-card-body")!;
    expect(
      body.getBoundingClientRect().bottom -
        host.querySelector("table")!.getBoundingClientRect().bottom,
    ).toBeLessThan(1);
  });
}

test("an explicit Row height doesn't stretch cards that size themselves", async () => {
  await draw(dashboard(`Row([Card("Regions", [Table([${regions(4)}])], "full")], 560)`));
  expect(height(host.querySelector(".openui-dashboard-card"))).toBeLessThan(300);
});

test("a Donut card fits its arc and legend, with no gap above the arc", async () => {
  await draw(dashboard(`Row([Card("Share", [Donut(["A", "B", "C"], [50, 30, 20])], "half")])`));
  await frames();
  const body = host.querySelector(".openui-dashboard-card-body")!;
  const arc = host.querySelector("svg.recharts-surface")!;
  expect(arc.getBoundingClientRect().top - body.getBoundingClientRect().top).toBeLessThan(1);
  expect(height(host.querySelector(".openui-dashboard-card"))).toBeLessThan(400);
});

test("a row mixing a Table with a chart takes its height from the table's rows", async () => {
  const chart = `Card("Trend", [TimeSeries(["a", "b"], [Series("s", [1, 2])])], "half")`;
  const rowHeight = () =>
    getComputedStyle(host.querySelector(".openui-dashboard-row")!).getPropertyValue(
      "--openui-dashboard-row-h",
    );
  // Four rows fit beside a chart's usual 400px.
  await draw(dashboard(`Row([Card("T", [Table([${regions(4)}])], "half"), ${chart}])`));
  expect(host.querySelector(".openui-dashboard-row")!.hasAttribute("data-fit")).toBe(false);
  expect(rowHeight()).toBe("400px");
  // A full page of ten rows and a pager: 103 + 10 × 36 + 36 = 499px, so the next step, 560.
  await draw(dashboard(`Row([Card("T", [Table([${regions(12)}])], "half"), ${chart}])`));
  expect(rowHeight()).toBe("560px");
  const [table, trend] = [...host.querySelectorAll(".openui-dashboard-card")];
  expect(height(table!)).toBe(height(trend!));
});

// 2. Tables in half-width cards: the columns past the edge scroll, and the arrows that scroll
//    them sat above the header, far from the clipped column.
test("a table too wide for its card puts its scroll arrows under it, beside the pager", async () => {
  host.style.width = "900px";
  await draw(
    dashboard(
      `Row([Card("Top products", [Table([Column("Product", ["Wireless Headphones Pro", "Smart Watch Series 5", "Laptop Stand", "USB-C Hub"], "primary"), Column("Category", ["Audio", "Wearables", "Accessories", "Accessories"], "chip"), Column("Orders", [1240, 980, 1430, 770], "number"), Column("Net sales", [1242000, 938000, 251000, 129000], "number", "currency"), Column("Units", [3100, 2800, 3900, 2050], "number")], 2)], "half"), Card("B", [Stat(5)], "half")])`,
    ),
  );
  await frames();
  const wrap = host.querySelector<HTMLElement>(".openui-dashboard-table-wrap")!;
  expect(wrap.scrollWidth).toBeGreaterThan(wrap.clientWidth);
  const foot = host.querySelector(".openui-dashboard-table-foot")!;
  const stepper = foot.querySelector('[aria-label="Scroll columns"]')!;
  expect(foot.querySelector("nav.openui-dashboard-table-pager")).not.toBeNull();
  expect(stepper.getBoundingClientRect().top).toBeGreaterThanOrEqual(
    host.querySelector("table")!.getBoundingClientRect().bottom,
  );
  await act(async () =>
    foot.querySelector<HTMLButtonElement>('[aria-label="Scroll right"]')!.click(),
  );
  // The smooth scroll's events update the stepper's state, so it runs out inside act().
  await act(async () => {
    await new Promise((done) => setTimeout(done, 600));
  });
  expect(wrap.scrollLeft).toBeGreaterThan(0);
});

// 3. Series colours repeated: slot 7 was a second violet beside slot 1.
for (const mode of ["light", "dark"] as const) {
  test(`seven series get seven distinct colours in ${mode}`, async () => {
    const names = ["direct", "organic", "paid", "social", "email", "affiliate", "referral"];
    await draw(
      <ThemeProvider mode={mode}>
        {dashboard(
          `Row([Card("Traffic", [TimeSeries(["Mon", "Tue", "Wed"], [${names.map((name, i) => `Series("${name}", [${i + 1}, ${i + 2}, ${i + 3}])`).join(", ")}], "line")], "full")])`,
        )}
      </ThemeProvider>,
    );
    await frames();
    const root = host.querySelector(".openui-dashboard-root")!;
    const token = (n: number) =>
      getComputedStyle(root).getPropertyValue(`--openui-dashboard-series-${n}`).trim();
    expect(token(7)).toBe(mode === "light" ? "#a0522d" : "#b8693a");
    const colours = Array.from({ length: 8 }, (_, i) => token(i + 1));
    expect(new Set(colours).size).toBe(8);
    const strokes = [...host.querySelectorAll(".recharts-line-curve")].map((line) =>
      line.getAttribute("stroke"),
    );
    expect(strokes).toContain("var(--openui-dashboard-series-7)");
    expect(new Set(strokes).size).toBe(7);
  });
}

// 4. Cohorts headers ran together ("Month Month Month") in narrow cards.
test("Cohorts period headers never overlap in a narrow card; the grid scrolls instead", async () => {
  host.style.width = "900px";
  await draw(
    dashboard(
      `Row([Card("Retention", [Cohorts(["Jan 2026", "Feb 2026", "Mar 2026"], ["Month 0", "Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"], [100, 60, 50, 40, 35, 30, 28, 100, 62, 51, 42, 36, 33, 100, 58, 49, 41, 38], [1200, 1100, 900])], "half"), Card("B", [Stat(1)], "half")])`,
    ),
  );
  const heads = [...host.querySelectorAll<HTMLElement>(".openui-dashboard-cohort th")].slice(2);
  expect(heads).toHaveLength(7);
  for (const head of heads) expect(head.scrollWidth).toBeLessThanOrEqual(head.clientWidth);
  const wrap = host.querySelector<HTMLElement>(".openui-dashboard-cohort-wrap")!;
  expect(wrap.scrollWidth).toBeGreaterThan(wrap.clientWidth);
});

test("Heatmap column labels never overlap in a narrow card; the grid scrolls instead", async () => {
  host.style.width = "900px";
  const hours = Array.from({ length: 24 }, (_, h) => `"${h % 12 || 12} ${h < 12 ? "AM" : "PM"}"`);
  await draw(
    dashboard(
      `Row([Card("Traffic", [Heatmap(["Mon", "Tue"], [${hours.join(", ")}], [${Array.from({ length: 48 }, (_, i) => i % 9).join(", ")}])], "half"), Card("B", [Stat(1)], "half")])`,
    ),
  );
  const heads = [...host.querySelectorAll<HTMLElement>(".openui-dashboard-heat th")].slice(1);
  expect(heads).toHaveLength(24);
  for (const head of heads) expect(head.scrollWidth).toBeLessThanOrEqual(head.clientWidth);
  const wrap = host.querySelector<HTMLElement>(".openui-dashboard-cohort-wrap")!;
  expect(wrap.scrollWidth).toBeGreaterThan(wrap.clientWidth);
});

// 5a. Chart axes printed ISO text.
test("chart axes and tooltips read dates and months as dates", async () => {
  await draw(
    dashboard(
      `Row([Card("Daily", [TimeSeries(["2025-05-12", "2025-05-13", "2025-05-14"], [Series("Orders", [10, 12, 9])])], "full"), Card("Monthly", [Bars(["2025-11", "2025-12", "2026-01"], [Series("Orders", [10, 12, 9])], "number", "vertical")], "full")])`,
    ),
  );
  await frames();
  expect(texts()).toEqual(
    expect.arrayContaining(["May 12, 2025", "May 14, 2025", "Nov 2025", "Jan 2026"]),
  );
  expect(texts().join(" ")).not.toMatch(/\d{4}-\d{2}/);
});

// 5b. The demo's data returns en-US locale datetimes ("10/01/2025, 12:00:00 AM").
test("en-US locale datetimes read as days in a Kpi hint and a Table column, and sort as dates", async () => {
  await draw(
    dashboard(
      `Kpis([Kpi("Orders", 412, "number", null, null, "10/01/2025, 12:00:00 AM")]), Row([Card("Orders", [Table([Column("Day", ["10/01/2025, 12:00:00 AM", "9/30/2025, 12:00:00 AM", "10/02/2025, 12:00:00 AM"]), Column("Orders", [5, 7, 9], "number")])], "full")])`,
    ),
  );
  expect(host.querySelector(".openui-dashboard-kpi-hint")!.textContent).toBe("Oct 1, 2025");
  const days = () =>
    [...host.querySelectorAll("tbody tr")].map((row) => row.querySelector("td")!.textContent);
  expect(days()).toEqual(["Oct 1, 2025", "Sep 30, 2025", "Oct 2, 2025"]);
  expect(host.querySelector("tbody time")!.getAttribute("datetime")).toBe("2025-10-01");
  await act(async () => host.querySelector<HTMLButtonElement>("th button")!.click());
  // By date: as text, "10/01" would sort before "9/30".
  expect(days()).toEqual(["Sep 30, 2025", "Oct 1, 2025", "Oct 2, 2025"]);
});

// 6. A derived KPI showed "$0.00" while the others were loading.
test("a Kpi worked out from query results shows its loading bar until the data arrives", async () => {
  let resolve!: (data: unknown) => void;
  const pending = new Promise((done) => {
    resolve = done;
  });
  await draw(
    <Renderer
      library={library}
      toolProvider={{ sales: () => pending }}
      response={`data = Query("sales", {}, {revenue: null, orders: null})
root = Dashboard([Section("", [Kpis([Kpi("Revenue", data.revenue, "currency"), Kpi("Average order value", data.revenue / data.orders, "currency-precise")])])])`}
    />,
  );
  await expect
    .poll(() => host.querySelectorAll('.openui-dashboard-kpi [data-state="loading"]').length)
    .toBe(2);
  // The tile keeps its content in the DOM to hold its size, hidden: nothing reads "$0.00".
  for (const value of host.querySelectorAll(".openui-dashboard-kpi-value"))
    expect(getComputedStyle(value).visibility).toBe("hidden");
  await act(async () => resolve({ revenue: 1000, orders: 4 }));
  await expect.poll(() => host.textContent).toContain("$250.00");
  expect(host.querySelectorAll('.openui-dashboard-kpi [data-state="loading"]')).toHaveLength(0);
});

// 7. A paged Table's last page shrank the card and shifted its column widths.
test("a paged Table keeps its height and column widths from page to page", async () => {
  await draw(
    dashboard(
      `Row([Card("Customers", [Table([Column("Customer", ["Northwind Traders International", "Contoso Pharmaceuticals", "Adventure Works Cycles", "Fabrikam Residences", "Ann"], "primary"), Column("Status", ["Active", "Churned", "Active", "Trial", "Active"], "badge"), Column("Net sales", [4200000, 380000, 51000, 2900, 1], "number", "currency")], 4)], "full")])`,
    ),
  );
  await frames();
  const card = host.querySelector(".openui-dashboard-card")!;
  const widths = () =>
    [...host.querySelectorAll("th")].map((th) => Math.round(th.getBoundingClientRect().width));
  const pager = () =>
    host.querySelector("nav.openui-dashboard-table-pager")!.getBoundingClientRect().top;
  const [firstWidths, firstHeight, firstPager] = [widths(), height(card), pager()];
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Next page"]')!.click());
  await frames(2);
  expect(host.querySelectorAll("tbody tr")).toHaveLength(1);
  expect(widths()).toEqual(firstWidths);
  expect(height(card)).toBe(firstHeight);
  expect(pager()).toBe(firstPager);
  // The sizer row that holds the widths is hidden from view and from screen readers.
  const sizer = host.querySelector(".openui-dashboard-table-sizer")!;
  expect(sizer.getAttribute("aria-hidden")).toBe("true");
  expect(height(sizer)).toBe(0);
});

// 8b. Bar axes counted in odd steps ($950K, $1.9M, $2.85M).
test("bar value axes step in round numbers", async () => {
  await draw(
    dashboard(
      `Row([Card("Sales", [Bars(["North", "South", "East", "West"], [Series("Net sales", [3700000, 2100000, 1800000, 950000])], "currency")], "full")])`,
    ),
  );
  await frames();
  expect(texts()).toEqual(expect.arrayContaining(["$0", "$1M", "$2M", "$3M", "$4M"]));
  expect(texts()).not.toContain("$950K");
});

// 8c. The "100% of target" chip sat on the lines.
test("a reference chip moves to the end of its line when the data crowds the start", async () => {
  await draw(
    dashboard(
      `Row([Card("Attainment", [TimeSeries(["Jan", "Feb", "Mar", "Apr", "May"], [Series("Attainment", [100, 103, 110, 118, 125])], "line", "percent", null, [Reference("100% of target", 100)])], "full")])`,
    ),
  );
  await frames();
  const chip = [...host.querySelectorAll("svg text")]
    .find((text) => text.textContent?.startsWith("100% of target"))!
    .closest("g")!
    .querySelector("rect")!
    .getBoundingClientRect();
  const plot = host.querySelector(".recharts-cartesian-grid")!.getBoundingClientRect();
  expect(Math.abs(chip.right - plot.right)).toBeLessThan(2);
});

// 8d. A margin written as a number with a "%" suffix changed by "+21.8%" instead of points.
test("a percent-suffixed Kpi changes in points", async () => {
  await draw(dashboard(`Kpis([Kpi("Gross margin", 10.6, {type: "number", suffix: "%"}, 8.7)])`));
  expect(host.querySelector(".openui-dashboard-kpi .openui-dashboard-delta")!.textContent).toBe(
    "+1.9 pts",
  );
});
