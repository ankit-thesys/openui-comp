import { afterEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { CardRow, FilterBar, ShellCard, type CardRowType } from "../..";
import { cases } from "../helpers/cases";
import { box, cleanup, renderCase, renderNode, renderProgram, settle } from "../helpers/render";

afterEach(async () => {
  cleanup();
  await page.viewport(1400, 900);
});

type Size = "small" | "medium" | "large";

async function row(width: number, type: CardRowType, sizes: Size[]) {
  await page.viewport(width, 900);
  const container = await renderNode(
    <CardRow type={type} count={sizes.length}>
      {sizes.map((size, i) => (
        <ShellCard key={i} size={size}>
          {size}
        </ShellCard>
      ))}
    </CardRow>,
  );
  await settle();
  const root = container.querySelector(".openui-dashboard-card-row")!;
  const cards = [...container.querySelectorAll(".openui-dashboard-shell-card")];
  const rootWidth = box(root).width;
  return {
    rootWidth,
    widths: cards.map((card) => box(card).width),
    /** How many cards sit on each line of the row. */
    lines: Object.values(
      cards.reduce<Record<number, number>>((lines, card) => {
        const top = Math.round(box(card).top);
        lines[top] = (lines[top] ?? 0) + 1;
        return lines;
      }, {}),
    ),
  };
}

describe("CardRow", () => {
  it.each([
    ["small, 4 cards", 1400, "small", ["small", "small", "small", "small"], [4]],
    ["small, 5 cards", 1400, "small", ["small", "small", "small", "small", "small"], [5]],
    [
      "small, 5 cards, 1200px",
      1200,
      "small",
      ["small", "small", "small", "small", "small"],
      [3, 2],
    ],
    ["small, 4 cards, 1200px", 1200, "small", ["small", "small", "small", "small"], [4]],
    ["small, 3 cards, 1000px", 1000, "small", ["small", "small", "small"], [2, 1]],
    ["medium, 3 cards", 1400, "medium", ["medium", "medium", "medium"], [3]],
    ["medium, 2 cards, 1000px", 1000, "medium", ["medium", "medium"], [2]],
    ["medium and large", 1400, "medium-large", ["medium", "large"], [2]],
    ["medium and large, 1000px", 1000, "medium-large", ["medium", "large"], [1, 1]],
    ["large", 1400, "large", ["large"], [1]],
  ] as const)("%s", async (_, width, type, sizes, lines) => {
    const result = await row(width, type, [...sizes]);
    expect(result.lines).toEqual([...lines]);
  });

  it("gives a large card more room than a medium card", async () => {
    const { widths } = await row(1400, "medium-large", ["medium", "large"]);
    expect(widths[1]!).toBeGreaterThan(widths[0]!);
  });

  it.each([
    ["small", ["small", "small", "small"]],
    ["medium", ["medium", "medium"]],
    ["medium-large", ["medium", "large"]],
    ["large", ["large"]],
  ] as const)("stacks %s cards at 700px", async (type, sizes) => {
    const { rootWidth, widths, lines } = await row(700, type, [...sizes]);
    expect(lines.every((count) => count === 1)).toBe(true);
    for (const width of widths) expect(width).toBe(rootWidth);
  });
});

describe("no sideways scroll", () => {
  it.each([1400, 984, 700, 400])("at %dpx", async (width) => {
    await page.viewport(width, 900);
    const overflowing: string[] = [];
    for (const { id, program } of cases) {
      await renderProgram(program);
      await settle(50);
      if (document.documentElement.scrollWidth > innerWidth) overflowing.push(id);
      cleanup();
    }
    expect(overflowing).toEqual([]);
  });
});

describe("FilterBar", () => {
  const filter = (name: string) => (
    <div key={name} data-filter={name} style={{ width: 180 }}>
      {name}
    </div>
  );

  async function bar(width: number) {
    await page.viewport(width, 900);
    const container = await renderNode(
      <FilterBar rightChildren={[filter("right")]}>{["a", "b", "c"].map(filter)}</FilterBar>,
    );
    await settle();
    const root = box(container.querySelector(".openui-dashboard-filter-bar")!);
    const filters = [...container.querySelectorAll("[data-filter]")].map(box);
    return { root, filters, tops: new Set(filters.map((item) => Math.round(item.top))) };
  }

  it("keeps everything on one line when it fits", async () => {
    const { tops, filters, root } = await bar(1400);
    expect(tops.size).toBe(1);
    expect(Math.round(filters.at(-1)!.right)).toBe(Math.round(root.right));
  });

  it("moves the right side to its own line, still at the right, when it doesn't fit", async () => {
    const { filters, root } = await bar(700);
    const right = filters.pop()!;
    expect(new Set(filters.map((item) => item.top)).size).toBe(1);
    expect(right.top).toBeGreaterThan(filters[0]!.bottom);
    expect(Math.round(right.right)).toBe(Math.round(root.right));
  });

  it("wraps its filters inside a narrow page", async () => {
    const { tops, filters, root } = await bar(400);
    expect(tops.size).toBeGreaterThan(2);
    for (const item of filters) expect(item.right).toBeLessThanOrEqual(root.right);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth);
  });

  it.each([
    ".openui-dashboard-filter-select-trigger--single",
    ".openui-dashboard-filter-select-trigger--multi",
  ])("opens %s without sideways scroll at 400px", async (trigger) => {
    await page.viewport(400, 900);
    const container = await renderCase("filters");
    await userEvent.click(container.querySelector<HTMLElement>(trigger)!);
    await settle(50);
    expect(container.querySelector(".openui-dashboard-filter-select-popover")).not.toBeNull();
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth);
  });
});

describe("charts", () => {
  const pie = (args: string) => `root = Dashboard([s])
s = Section([r])
r = CardRow([a])
a = MediumCard([PieChart(["A", "B", "C"], [3, 2, 1]${args})])`;

  it("stay within the dashboard's chart size on a full-width row", async () => {
    const container = await renderProgram(`root = Dashboard([s])
s = Section([r1, r2])
r1 = CardRow([a])
a = MediumCard([RadarChart(["A", "B", "C", "D"], [Series("x", [3, 2, 1, 4])])])
r2 = CardRow([b])
b = MediumCard([RadialChart(["A", "B"], [3, 2])])`);
    const svgs = [...container.querySelectorAll("[class*='chart-svg-wrapper'] svg")];
    expect(svgs).toHaveLength(2);
    for (const svg of svgs) expect(box(svg).height).toBe(296);
  });

  it("honour a pie chart's height", async () => {
    const container = await renderProgram(pie(`, "pie", "default", 200`));
    expect(box(container.querySelector(".openui-pie-chart-svg-wrapper svg")!).height).toBe(200);
  });

  it("don't keep empty space around a semi-circular pie", async () => {
    const container = await renderProgram(pie(`, "donut", "default", 296, "semiCircular"`));
    const wrapper = box(container.querySelector(".openui-pie-chart-svg-wrapper")!);
    const svg = box(container.querySelector(".openui-pie-chart-svg-wrapper svg")!);
    expect(svg.height).toBeLessThan(200);
    expect(wrapper.height).toBe(svg.height);
  });

  it("draw nothing outside their card", async () => {
    const container = await renderProgram(pie(`, "donut", "default", 296, "semiCircular"`));
    const content = box(container.querySelector(".openui-dashboard-shell-card-content")!);
    for (const mark of container.querySelectorAll("svg path")) {
      const rect = box(mark);
      if (!rect.width || !rect.height) continue;
      expect(rect.top).toBeGreaterThanOrEqual(content.top - 1);
      expect(rect.bottom).toBeLessThanOrEqual(content.bottom + 1);
    }
  });
});
