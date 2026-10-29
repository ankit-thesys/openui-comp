// Derived data attributes are public API (ADR Q18 amendment): each one the README's "Derived data
// attributes" table documents is pinned here, with its values and when it is absent. Booleans are
// absent when false. Run after build. Attributes that need layout, events or a portal are pinned in
// browser specs: scroll buttons' `data-side` and tables' `data-scrollable` (lists-tables), tooltip
// `data-positioned`, `data-layout` and `data-last` (chart-foundations), Select viewport
// `data-position` (select-calendar), carousel `data-mask` beyond "none" (card-blocks.parity-details,
// media), Image and ImageBlock `data-error` (media), CalendarHeatmap `data-ghost` and `data-dimmed`
// and HeatmapChart `data-empty` (other-charts).
import {
  AreaChart,
  BarChart,
  Calendar,
  CalendarHeatmap,
  Callout,
  Carousel,
  CarouselContent,
  CarouselItem,
  CompositeCardBlock,
  ContextCardBlock,
  DatePicker,
  EditableTable,
  FormControl,
  Hint,
  HorizontalBarChart,
  ImageBlock,
  ImageGallery,
  LineChart,
  ListItem,
  MetricIndicatorInline,
  MiniLineChart,
  OptionCards,
  OverviewCardBlock,
  ScatterChart,
  ScrollableTable,
  Slider,
  SliderBlock,
  SnippetCardBlock,
  TableBody,
  TableCell,
  TableRow,
  TextBlockView,
  TextContentWrapper,
  ThemeProvider,
  VisualCardBlock,
} from "@openuidev/react-components";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

/** The attributes of every element whose class list has `className`, in document order. */
const elementsWith = (element: ReactElement, className: string) =>
  [...renderToString(element).matchAll(/<[a-z][\w-]*((?:\s+[\w-]+(?:="[^"]*")?)*)\s*\/?>/g)]
    .map(([, attributes]) =>
      Object.fromEntries(
        [...attributes!.matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map(([, name, value]) => [
          name!,
          value ?? "",
        ]),
      ),
    )
    .filter((attributes) => attributes["class"]?.split(" ").includes(className));

/** The values `attribute` takes on the elements carrying `className` (undefined when absent). */
const valuesOf = (element: ReactElement, className: string, attribute: string) => {
  const found = elementsWith(element, className);
  expect(found.length, `${className} renders`).toBeGreaterThan(0);
  return found.map((attributes) => attributes[attribute]);
};

const october = new Date(2026, 9);

describe("derived data attributes", () => {
  it("ListItem: data-action on root and row when clickable, data-subtitle on the row", () => {
    const plain = <ListItem title="Title" />;
    expect(valuesOf(plain, "openui-list-item", "data-action")).toEqual([undefined]);
    expect(valuesOf(plain, "openui-list-item-row", "data-action")).toEqual([undefined]);
    expect(valuesOf(plain, "openui-list-item-row", "data-subtitle")).toEqual([undefined]);
    const full = <ListItem title="Title" subtitle="Subtitle" onClick={() => {}} />;
    expect(valuesOf(full, "openui-list-item", "data-action")).toEqual(["true"]);
    expect(valuesOf(full, "openui-list-item-row", "data-action")).toEqual(["true"]);
    expect(valuesOf(full, "openui-list-item-row", "data-subtitle")).toEqual(["true"]);
  });

  it("MetricIndicator: data-subtext on the root when subtext is set", () => {
    expect(
      valuesOf(<MetricIndicatorInline value="42" />, "openui-metric-indicator", "data-subtext"),
    ).toEqual([undefined]);
    expect(
      valuesOf(
        <MetricIndicatorInline value="42" subtext="vs last week" />,
        "openui-metric-indicator",
        "data-subtext",
      ),
    ).toEqual(["true"]);
  });

  it("Callout: data-autodismiss on the root when duration is set", () => {
    expect(valuesOf(<Callout title="Title" />, "openui-callout", "data-autodismiss")).toEqual([
      undefined,
    ]);
    expect(
      valuesOf(<Callout title="Title" duration={3000} />, "openui-callout", "data-autodismiss"),
    ).toEqual(["true"]);
  });

  it("ContextCardBlock: data-background-image on the card when bgImageSrc is set", () => {
    expect(
      valuesOf(
        <ContextCardBlock items={[{ title: "Plain" }]} />,
        "openui-context-card",
        "data-background-image",
      ),
    ).toEqual([undefined]);
    expect(
      valuesOf(
        <ContextCardBlock items={[{ title: "Image", bgImageSrc: "https://example.com/a.png" }]} />,
        "openui-context-card",
        "data-background-image",
      ),
    ).toEqual(["true"]);
  });

  it("ImageGallery: data-layout on the root from the image count", () => {
    const layouts = [1, 2, 3, 4, 5].map((count) =>
      valuesOf(
        <ImageGallery
          images={Array.from({ length: count }, (_, i) => ({
            src: "https://example.com/a.png",
            alt: `Photo ${i + 1}`,
          }))}
        />,
        "openui-image-gallery",
        "data-layout",
      ),
    );
    expect(layouts).toEqual([["single"], ["double"], ["triple"], ["quad"], ["default"]]);
  });

  it("TextBlock: data-clamped on the secondary text when secondaryMaxLines is set", () => {
    expect(
      elementsWith(
        <TextBlockView primary="Primary" secondary="Secondary" />,
        "openui-text-block-secondary",
      ).map((attributes) => attributes["data-clamped"]),
    ).not.toContain("true");
    expect(
      valuesOf(
        <TextBlockView primary="Primary" secondary="Secondary" secondaryMaxLines={2} />,
        "openui-text-block-secondary",
        "data-clamped",
      ),
    ).toEqual(["true"]);
  });

  it("SliderBlock: data-range on the value controls of a range slider", () => {
    const slider = (defaultValue: number[]) => (
      <SliderBlock
        label="Budget"
        variant="continuous"
        min={0}
        max={100}
        defaultValue={defaultValue}
      />
    );
    expect(valuesOf(slider([50]), "openui-slider-block-controls", "data-range")).toEqual([
      undefined,
    ]);
    expect(valuesOf(slider([25, 75]), "openui-slider-block-controls", "data-range")).toEqual([""]);
  });

  it("Calendar: data-selection on a selected day names the selection mode", () => {
    const selected = (element: ReactElement) =>
      valuesOf(element, "openui-calendar-day", "data-selection").filter(Boolean);
    expect(
      selected(<Calendar mode="single" month={october} selected={new Date(2026, 9, 15)} />),
    ).toEqual(["single"]);
    expect(
      selected(
        <Calendar
          mode="multiple"
          month={october}
          selected={[new Date(2026, 9, 15), new Date(2026, 9, 16)]}
        />,
      ),
    ).toEqual(["multiple", "multiple"]);
    expect(
      selected(
        <Calendar
          mode="range"
          month={october}
          selected={{ from: new Date(2026, 9, 15), to: new Date(2026, 9, 18) }}
        />,
      ),
    ).toEqual([]);
  });

  it("Charts: data-overflow on cartesian SVGs, data-clickable on clickable legend items", () => {
    const chart = (
      <LineChart
        data={[{ month: "Jan", sales: 12 }]}
        categoryKey="month"
        width={400}
        height={260}
      />
    );
    // Scroll mode (the server render): the fixed Y-axis SVG overflows, the scrolling plot does not.
    for (const [Chart, prefix] of [
      [AreaChart, "area"],
      [BarChart, "bar"],
      [LineChart, "line"],
    ] as const) {
      expect(
        valuesOf(
          <Chart
            data={[{ month: "Jan", sales: 12 }]}
            categoryKey="month"
            width={400}
            height={260}
          />,
          `openui-${prefix}-chart-svg`,
          "data-overflow",
        ),
      ).toEqual(["visible", undefined]);
    }
    expect(new Set(valuesOf(chart, "openui-default-legend-item", "data-clickable"))).toEqual(
      new Set([""]),
    );
    expect(
      valuesOf(
        <MiniLineChart data={[1, 2, 3]} size={120} />,
        "openui-mini-line-chart",
        "data-clickable",
      ),
    ).toEqual([undefined]);
    expect(
      valuesOf(
        <MiniLineChart data={[1, 2, 3]} size={120} onLineClick={() => {}} />,
        "openui-mini-line-chart",
        "data-clickable",
      ),
    ).toEqual([""]);
  });

  it("OptionCards: data-columns on each row, data-span on a last odd item", () => {
    const cards = (count: number) => (
      <OptionCards
        type="single"
        items={Array.from({ length: count }, (_, i) => ({ value: `v${i}`, title: `T${i}` }))}
      />
    );
    expect(valuesOf(cards(3), "openui-option-cards-row", "data-columns")).toEqual(["3"]);
    expect(valuesOf(cards(3), "openui-option-cards-item", "data-span")).toEqual([
      undefined,
      undefined,
      "full",
    ]);
    expect(valuesOf(cards(4), "openui-option-cards-item", "data-span")).toEqual(
      Array(4).fill(undefined),
    );
  });

  it("CardBlockLayout: data-card-type, data-layout, data-count, rows' data-columns, data-span", () => {
    const composite = (count: number, layout?: "grid" | "carousel") => (
      <CompositeCardBlock
        layout={layout}
        items={Array.from({ length: count }, (_, i) => ({ header: `H${i}` }))}
      />
    );
    const root = (element: ReactElement) => elementsWith(element, "openui-card-block-layout")[0]!;
    expect(root(composite(3))).toMatchObject({
      "data-card-type": "CompositeCard",
      "data-layout": "grid",
      "data-count": "3",
    });
    expect(root(composite(3, "carousel"))["data-layout"]).toBe("carousel");
    expect(
      [
        <ContextCardBlock key="context" items={[{ title: "T" }]} />,
        <VisualCardBlock key="visual" items={[{ body: "B" }]} />,
        <OverviewCardBlock key="overview" items={[{ top: "T" }]} />,
        <SnippetCardBlock key="snippet" items={[{ lhs: "L" }]} />,
      ].map((element) => root(element)["data-card-type"]),
    ).toEqual(["ContextCard", "VisualCard", "OverviewCard", "SnippetCard"]);
    expect(valuesOf(composite(3), "openui-card-block-layout-row", "data-columns")).toEqual([
      "2",
      "1",
    ]);
    expect(valuesOf(composite(3), "openui-card-block-layout-item", "data-span")).toEqual([
      undefined,
      undefined,
      "full",
    ]);
    expect(valuesOf(composite(4), "openui-card-block-layout-item", "data-span")).toEqual(
      Array(4).fill(undefined),
    );
  });

  it("Carousels: data-mask is none until the content scrolls", () => {
    expect(
      valuesOf(
        <CompositeCardBlock layout="carousel" items={[{ header: "H" }]} />,
        "openui-card-block-layout-carousel",
        "data-mask",
      ),
    ).toEqual(["none"]);
    expect(
      valuesOf(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Card</CarouselItem>
          </CarouselContent>
        </Carousel>,
        "openui-carousel-content",
        "data-mask",
      ),
    ).toEqual(["none"]);
  });

  it("ImageGallery: data-position on each tile, from 1", () => {
    expect(
      valuesOf(
        <ImageGallery images={[1, 2, 3].map((i) => ({ src: "/a.png", alt: `Photo ${i}` }))} />,
        "openui-image-gallery-image",
        "data-position",
      ),
    ).toEqual(["1", "2", "3"]);
  });

  it("ImageBlock: data-breakpoint from its width, data-loading while loading", () => {
    // The server render has no width, so it starts at the mobile breakpoint.
    expect(elementsWith(<ImageBlock src="/a.png" />, "openui-image-block")[0]).toMatchObject({
      "data-breakpoint": "mobile",
      "data-loading": "true",
    });
    expect(
      valuesOf(<ImageBlock src="/a.png" />, "openui-image-block-image", "data-breakpoint"),
    ).toEqual(["mobile"]);
    expect(
      valuesOf(
        <ImageBlock src="/a.png" imageLoading={false} />,
        "openui-image-block",
        "data-loading",
      ),
    ).toEqual([undefined]);
  });

  it("Bar charts: data-negative on negative bars, data-zero on the zero grid line", () => {
    const data = [
      { month: "Jan", sales: -3 },
      { month: "Feb", sales: 4 },
    ];
    const bar = <BarChart data={data} categoryKey="month" width={400} height={260} />;
    expect(valuesOf(bar, "openui-bar-chart-bar", "data-negative")).toEqual(["", undefined]);
    expect(
      valuesOf(bar, "openui-bar-chart-grid-line", "data-zero").filter((v) => v === ""),
    ).toEqual([""]);
    expect(
      valuesOf(
        <HorizontalBarChart data={data} categoryKey="month" width={400} height={260} />,
        "openui-horizontal-bar-chart-bar",
        "data-negative",
      ),
    ).toEqual(["", undefined]);
    expect(
      valuesOf(
        <BarChart
          data={[{ month: "Feb", sales: 4 }]}
          categoryKey="month"
          width={400}
          height={260}
        />,
        "openui-bar-chart-grid-line",
        "data-zero",
      ).filter((v) => v !== undefined),
    ).toEqual([]);
  });

  it("Slider: data-at-min on the range of a single value at its minimum", () => {
    const slider = (value: number) => (
      <Slider variant="continuous" min={0} max={100} defaultValue={[value]} />
    );
    expect(valuesOf(slider(0), "openui-slider-range", "data-at-min")).toEqual([""]);
    expect(valuesOf(slider(40), "openui-slider-range", "data-at-min")).toEqual([undefined]);
  });

  it("Calendar: data-today-unselected on today when it is not selected", () => {
    const today = (selected?: Date) =>
      valuesOf(
        <Calendar mode="single" selected={selected} />,
        "openui-calendar-day",
        "data-today-unselected",
      ).filter(Boolean);
    expect(today()).toEqual(["true"]);
    expect(today(new Date())).toEqual([]);
  });

  it("TextContentWrapper: data-mode names the theme mode", () => {
    expect(
      valuesOf(
        <TextContentWrapper textMarkdown="Hi" />,
        "openui-text-content-wrapper",
        "data-mode",
      ),
    ).toEqual(["light"]);
    expect(
      valuesOf(
        <ThemeProvider mode="dark">
          <TextContentWrapper textMarkdown="Hi" />
        </ThemeProvider>,
        "openui-text-content-wrapper",
        "data-mode",
      ),
    ).toEqual(["dark"]);
  });

  it("CalendarHeatmap: data-level on each cell", () => {
    expect(
      valuesOf(
        <CalendarHeatmap data={[{ date: "2026-10-01", value: 3 }]} width={600} />,
        "openui-calendar-heatmap-cell",
        "data-level",
      ),
    ).toEqual(["3"]);
  });

  it("Hint and SliderBlock: data-invalid when the field has an error", () => {
    expect(valuesOf(<Hint>Help</Hint>, "openui-hint", "data-invalid")).toEqual([undefined]);
    expect(
      valuesOf(
        <FormControl hasError>
          <Hint>Help</Hint>
        </FormControl>,
        "openui-hint",
        "data-invalid",
      ),
    ).toEqual(["true"]);
    const block = (defaultValue: number[]) => (
      <SliderBlock
        label="Budget"
        variant="continuous"
        min={0}
        max={100}
        defaultValue={defaultValue}
      />
    );
    expect(valuesOf(block([50]), "openui-slider-block-header", "data-invalid")).toEqual([
      undefined,
    ]);
    expect(valuesOf(block([-1, 75]), "openui-slider-block-header", "data-invalid")).toEqual([
      "true",
    ]);
  });

  it("DatePicker: data-placeholder on the trigger until a date is chosen", () => {
    expect(valuesOf(<DatePicker />, "openui-date-picker-trigger", "data-placeholder")).toEqual([
      "true",
    ]);
    expect(
      valuesOf(
        <DatePicker mode="single" selectedSingleDate={new Date(2026, 9, 15)} />,
        "openui-date-picker-trigger",
        "data-placeholder",
      ),
    ).toEqual([undefined]);
  });

  it("Tables: data-scrollable stays off until a table overflows", () => {
    // Overflow needs layout (pinned in lists-tables.spec.ts); the server render has none.
    expect(
      valuesOf(
        <ScrollableTable>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </ScrollableTable>,
        "openui-scrollable-table",
        "data-scrollable",
      ),
    ).toEqual([undefined]);
    expect(
      valuesOf(
        <EditableTable
          data={[{ id: "1", name: "Ada" }]}
          columns={[{ key: "name", header: "Name" }]}
        />,
        "openui-editable-table-grid",
        "data-scrollable",
      ),
    ).toEqual([undefined]);
  });

  it("Area, line and scatter charts: data-zero on the zero grid line", () => {
    const data = [
      { month: "Jan", sales: -3 },
      { month: "Feb", sales: 4 },
    ];
    const zero = (element: ReactElement, prefix: string) =>
      valuesOf(element, `openui-${prefix}-chart-grid-line`, "data-zero").filter(
        (value) => value !== undefined,
      );
    expect(
      zero(<AreaChart data={data} categoryKey="month" width={400} height={260} />, "area"),
    ).toEqual([""]);
    expect(
      zero(<LineChart data={data} categoryKey="month" width={400} height={260} />, "line"),
    ).toEqual([""]);
    expect(
      zero(
        <ScatterChart
          data={[
            {
              name: "s",
              data: [
                { x: -2, y: -3 },
                { x: 4, y: 5 },
              ],
            },
          ]}
          xAxisDataKey="x"
          yAxisDataKey="y"
          width={400}
          height={260}
        />,
        "scatter",
      ),
    ).toEqual([""]);
  });
});
