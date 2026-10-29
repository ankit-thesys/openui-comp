// Derived data attributes are public API (ADR Q18 amendment): each one the README's "Derived data
// attributes" table documents is pinned here, with its values and when it is absent. Booleans are
// absent when false. Run after build; the scroll buttons' `data-side` needs layout and is pinned
// in test/browser/lists-tables.spec.ts.
import {
  AreaChart,
  BarChart,
  Calendar,
  Callout,
  ContextCardBlock,
  ImageGallery,
  LineChart,
  ListItem,
  MetricIndicatorInline,
  MiniLineChart,
  SliderBlock,
  TextBlockView,
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
});
