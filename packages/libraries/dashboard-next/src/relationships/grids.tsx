"use client";

import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import { useState } from "react";
import { z } from "zod/v4";
import { columnDecimals, formatSchema, formatValue, padDecimals } from "../format";
import { numbersSchema } from "../schema";
import {
  Empty,
  RampKey,
  toNumbers,
  TooltipCard,
  toStrings,
  useRowHover,
  ViewCheck,
  ViewSwitch,
} from "../shared";
import { divergingColor, sequentialColor } from "../theme";

/* ---------- Cohorts: retention grid ---------- */

const cohortsSchema = z.object({
  cohorts: z.array(z.string()),
  sizes: z.array(z.number()),
  periods: z.array(z.string()),
  rows: z.array(numbersSchema),
  format: formatSchema.optional(),
  view: z.enum(["percent", "people"]).optional(),
  showValues: z.boolean().optional(),
});

type CohortView = "percent" | "people";
const COHORT_VIEWS: { value: CohortView; label: string }[] = [
  { value: "percent", label: "Percent" },
  { value: "people", label: "People" },
];

export const Cohorts = defineComponent({
  name: "Cohorts",
  props: cohortsSchema,
  description:
    'Retention grid: rows[i][j] is the % of cohort i active in period j; null for periods not reached. Periods start at "Week 0" or "Month 0". A switch shows cells as percent or people (size × rate); view "people" opens on people. A Values checkbox prints the numbers in the cells (showValues true opens it ticked).',
  component: function CohortsView({ props }: ComponentRenderProps<z.infer<typeof cohortsSchema>>) {
    const hover = useRowHover();
    // Percent retained, or the people that is (size × rate); colour always follows the rate.
    const [viewChoice, setView] = useState<CohortView | null>(null);
    const view: CohortView = viewChoice ?? props.view ?? "percent";
    // Values are opt-in, as on Heatmap: the header checkbox prints them; showValues opens it ticked.
    const [valuesChoice, setValuesOn] = useState<boolean | null>(null);
    const valuesOn = valuesChoice ?? props.showValues ?? false;
    const cohorts = toStrings(props.cohorts);
    const sizes = toNumbers(props.sizes);
    const periods = toStrings(props.periods);
    const rows = (Array.isArray(props.rows) ? props.rows : []).map((row) => toNumbers(row));
    const format = props.format ?? "percent";
    // Scale colour over the non-trivial cells so period 0 (100%) doesn't flatten the ramp.
    const cells = rows
      .flatMap((row) => row.slice(1))
      .filter((value): value is number => value !== null);
    if (!cohorts.length || !periods.length) return <Empty />;
    const min = cells.length ? Math.min(...cells) : 0;
    const max = cells.length ? Math.max(...cells) : 100;
    const sized = format === "percent" && sizes.some((size) => typeof size === "number");
    // All cohorts: each period's retention weighted by cohort size, over the cohorts that have reached it.
    const all = sized
      ? periods.map((_, j) => {
          const reached = cohorts
            .map((_, i) => ({ size: sizes[i], value: rows[i]?.[j] ?? null }))
            .filter(
              (c): c is { size: number; value: number } =>
                typeof c.size === "number" && c.value !== null,
            );
          const people = reached.reduce((sum, c) => sum + c.size, 0);
          return people ? reached.reduce((sum, c) => sum + c.size * c.value, 0) / people : null;
        })
      : null;
    const totalSize = sizes.reduce<number>((sum, size) => sum + (size ?? 0), 0);
    // One precision down each period's column: 28.0% under 27.1%.
    const places = periods.map((_, j) =>
      columnDecimals(
        [...rows.map((row) => row[j] ?? null), all?.[j] ?? null]
          .filter((v): v is number => v !== null)
          .map((v) => formatValue(Math.round(v * 10) / 10, format)),
      ),
    );
    const reachedSize = (j: number) =>
      cohorts.reduce(
        (sum, _, i) =>
          sum + (rows[i]?.[j] !== null && rows[i]?.[j] !== undefined ? (sizes[i] ?? 0) : 0),
        0,
      );

    // Real corners only at the outer corners: the All cohorts strip's two ends, and the cohort grid's
    // top-left, top-right and bottom-left (the grid is a triangle, so its own last cells end each row).
    const corner = "calc(var(--openui-dashboard-radius-sm) - 2px)";
    const lastPeriod = periods.length - 1;
    const lastCohort = cohorts.length - 1;
    const corners = (key: string, j: number) => {
      const row = key === "all" ? -1 : cohorts.indexOf(key);
      const first = j === 0;
      const end = j === lastPeriod;
      if (row === -1)
        return {
          borderTopLeftRadius: first ? corner : undefined,
          borderBottomLeftRadius: first ? corner : undefined,
          borderTopRightRadius: end ? corner : undefined,
          borderBottomRightRadius: end ? corner : undefined,
        };
      return {
        borderTopLeftRadius: row === 0 && first ? corner : undefined,
        borderTopRightRadius: row === 0 && end ? corner : undefined,
        borderBottomLeftRadius: row === lastCohort && first ? corner : undefined,
        borderBottomRightRadius: row === lastCohort && end ? corner : undefined,
      };
    };
    const cell = (
      key: string,
      label: string,
      period: string,
      j: number,
      value: number | null,
      size: number | null,
    ) => {
      if (value === null)
        return (
          <td
            key={period}
            className="openui-dashboard-cohort-empty"
            aria-label="Not reached yet"
            style={corners(key, j)}
          />
        );
      const { background, color } =
        j === 0
          ? {
              background: "var(--openui-dashboard-surface-subtle)",
              color: "var(--openui-dashboard-ink)",
            }
          : sequentialColor(value, min, max);
      const people =
        typeof size === "number" && format === "percent" ? Math.round((size * value) / 100) : null;
      return (
        <td
          key={period}
          style={{ backgroundColor: background, color, ...corners(key, j) }}
          {...hover.rowProps(`${key}-${period}`, () => (
            <TooltipCard
              title={`${label} · ${period}`}
              format={format}
              rows={[
                { name: "Retained", color: background, value },
                ...(people !== null
                  ? [
                      {
                        name: "People",
                        color: "transparent",
                        value: people,
                        format: "number" as const,
                        mark: <span className="openui-dashboard-tip-dot" />,
                      },
                    ]
                  : []),
                ...(typeof size === "number"
                  ? [
                      {
                        name: "Cohort size",
                        color: "transparent",
                        value: size,
                        format: "number" as const,
                        mark: <span className="openui-dashboard-tip-dot" />,
                      },
                    ]
                  : []),
              ]}
            />
          ))}
        >
          {!valuesOn
            ? ""
            : view === "people" && people !== null
              ? formatValue(people, "number", { axis: true })
              : padDecimals(formatValue(value, format), places[j] ?? 0)}
        </td>
      );
    };

    return (
      // The kit tooltip on every cell, as on every other chart; the hovered cell takes an ink ring.
      <div ref={hover.ref} className="openui-dashboard-rows openui-dashboard-grid-hover">
        {/* People only makes sense for rates of a known size. */}
        <ViewCheck label="Values" checked={valuesOn} onChange={setValuesOn} />
        {sized ? (
          <ViewSwitch
            label="Show cells as"
            options={COHORT_VIEWS}
            value={view}
            onChange={setView}
          />
        ) : null}
        {/* The same colour key as Heatmap: what the ramp means, from the lowest retention after period 0 to the highest. */}
        {cells.length ? (
          <RampKey low={formatValue(min, format)} high={formatValue(max, format)} ramp="seq" />
        ) : null}
        <div className="openui-dashboard-cohort-wrap">
          {/* Fixed layout, as on Heatmap: printing values (the Values checkbox) never resizes a column. */}
          <table className="openui-dashboard-cohort" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col
                style={{
                  width: Math.min(
                    Math.max(Math.max(11, ...cohorts.map((c) => c.length)) * 7 + 20, 64),
                    200,
                  ),
                }}
              />
              <col
                style={{ width: Math.max(56, formatValue(totalSize, "number").length * 7 + 20) }}
              />
              {periods.map((period) => (
                <col key={period} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th>Cohort</th>
                <th>Size</th>
                {periods.map((period) => (
                  <th key={period}>{period}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {all ? (
                // The most-read row of a retention table, first: every cohort together, weighted by size.
                <tr className="openui-dashboard-cohort-all">
                  <td className="openui-dashboard-cohort-label">All cohorts</td>
                  <td className="openui-dashboard-cohort-size">
                    {formatValue(totalSize, "number")}
                  </td>
                  {periods.map((period, j) =>
                    cell(
                      "all",
                      "All cohorts",
                      period,
                      j,
                      all[j] === null ? null : Math.round((all[j] as number) * 10) / 10,
                      reachedSize(j),
                    ),
                  )}
                </tr>
              ) : null}
              {all ? (
                <tr className="openui-dashboard-cohort-gap" aria-hidden>
                  <td colSpan={periods.length + 2} />
                </tr>
              ) : null}
              {cohorts.map((cohort, i) => (
                <tr key={cohort}>
                  <td className="openui-dashboard-cohort-label">{cohort}</td>
                  <td className="openui-dashboard-cohort-size">
                    {formatValue(sizes[i], "number")}
                  </td>
                  {periods.map((period, j) =>
                    cell(cohort, cohort, period, j, rows[i]?.[j] ?? null, sizes[i] ?? null),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {hover.tip}
      </div>
    );
  },
});

/* ---------- Heatmap: two categorical axes ---------- */

const heatmapSchema = z.object({
  rows: z.array(z.string()),
  columns: z.array(z.string()),
  values: z.array(numbersSchema),
  format: formatSchema.optional(),
  showValues: z.boolean().optional(),
  midpoint: z.number().optional(),
  view: z.enum(["count", "total", "row"]).optional(),
});

type HeatmapView = "count" | "total" | "row";
const HEATMAP_VIEWS: { value: HeatmapView; label: string }[] = [
  { value: "count", label: "Count" },
  { value: "total", label: "% of total" },
  { value: "row", label: "% of row" },
];

export const Heatmap = defineComponent({
  name: "Heatmap",
  props: heatmapSchema,
  description:
    "Magnitude across two categories (weekday × hour); values[r][c], null for no data. A Values checkbox in the header prints the numbers in the cells (showValues true opens it ticked). midpoint switches to a two-pole diverging scale around it, for values with a direction (change, variance vs plan, correlation): 0 for change.",
  component: function HeatmapView({ props }: ComponentRenderProps<z.infer<typeof heatmapSchema>>) {
    const hover = useRowHover();
    const [viewChoice, setView] = useState<HeatmapView | null>(null);
    const view: HeatmapView = viewChoice ?? props.view ?? "count";
    // Values are opt-in: a checkbox in the header prints them; showValues opens it ticked.
    const [valuesChoice, setValuesOn] = useState<boolean | null>(null);
    const valuesOn = valuesChoice ?? props.showValues ?? false;
    const rowLabels = toStrings(props.rows);
    const columnLabels = toStrings(props.columns);
    const grid = (Array.isArray(props.values) ? props.values : []).map((row) => toNumbers(row));
    const cells = grid.flat().filter((value): value is number => value !== null);
    if (!rowLabels.length || !columnLabels.length || !cells.length) return <Empty />;
    // Diverging: symmetric around the midpoint, so equal distances read equally.
    const midpoint = props.midpoint ?? undefined;
    // Counts can also read as a share of the whole grid or of their row; a diverging (signed) grid can't.
    const switchable = midpoint === undefined && cells.every((value) => value >= 0);
    const shown: HeatmapView = switchable ? view : "count";
    const total = cells.reduce((sum, value) => sum + value, 0) || 1;
    const rowTotal = (r: number) =>
      (grid[r] ?? []).reduce<number>((sum, value) => sum + (value ?? 0), 0) || 1;
    const read = (value: number, r: number) =>
      shown === "total"
        ? (value / total) * 100
        : shown === "row"
          ? (value / rowTotal(r)) * 100
          : value;
    const format = shown === "count" ? props.format : "percent";
    const readings = grid.flatMap((row, r) =>
      row.filter((value): value is number => value !== null).map((value) => read(value, r)),
    );
    const min = Math.min(...readings);
    const max = Math.max(...readings);
    const spread =
      midpoint === undefined ? 0 : Math.max(...cells.map((value) => Math.abs(value - midpoint)));
    const colorFor = (reading: number) =>
      midpoint === undefined
        ? sequentialColor(reading, min, max)
        : divergingColor(reading, midpoint, spread);
    // Printed values keep one precision across the grid: 4.0 beside 3.4.
    const places = columnDecimals(
      readings.map((reading) => formatValue(Math.abs(reading), format, { axis: true })),
    );
    const cellText = (reading: number) =>
      padDecimals(formatValue(reading, format, { axis: true }), places);
    // The label column fits the longest row label ("Mon", "2026-09-07 · n=1,204")
    // at about 7px a character plus its padding, from 48px up to 200px; longer
    // labels end in an ellipsis. A <col> takes plain lengths only: min() or
    // calc() there is ignored.
    const longest = Math.max(...rowLabels.map((label) => label.length));
    const labelWidth = Math.min(Math.max(longest * 7 + 20, 48), 200);
    const dot = <span className="openui-dashboard-tip-dot" />;
    return (
      // The kit tooltip on every cell, as on every other chart; the hovered cell takes an ink ring.
      <div ref={hover.ref} className="openui-dashboard-rows openui-dashboard-grid-hover">
        <ViewCheck label="Values" checked={valuesOn} onChange={setValuesOn} />
        {switchable ? (
          <ViewSwitch
            label="Show cells as"
            options={HEATMAP_VIEWS}
            value={view}
            onChange={setView}
          />
        ) : null}
        <RampKey
          low={formatValue(midpoint === undefined ? min : midpoint - spread, format, {
            axis: true,
          })}
          high={formatValue(midpoint === undefined ? max : midpoint + spread, format, {
            axis: true,
          })}
          ramp={midpoint === undefined ? "seq" : "div"}
        />
        <div className="openui-dashboard-cohort-wrap">
          <table
            className="openui-dashboard-cohort openui-dashboard-heat"
            style={{ borderSpacing: 2, tableLayout: "fixed" }}
          >
            {/* Fixed layout keeps every hour or day column the same width. */}
            <colgroup>
              <col style={{ width: labelWidth }} />
              {columnLabels.map((column) => (
                <col key={column} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th />
                {columnLabels.map((column) => (
                  <th key={column} style={{ fontSize: 11, textAlign: "center" }}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowLabels.map((row, r) => (
                <tr key={row}>
                  {/* No browser tooltip here: a cell's kit tooltip names its row. */}
                  <td
                    className="openui-dashboard-cohort-label"
                    style={{ paddingRight: 8, overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    {row}
                  </td>
                  {columnLabels.map((column, c) => {
                    const value = grid[r]?.[c] ?? null;
                    if (value === null)
                      return <td key={column} className="openui-dashboard-cohort-empty" />;
                    const reading = read(value, r);
                    const { background, color } = colorFor(reading);
                    // Nearly square cells; only the grid's four outer corners take a real radius.
                    const corner = "calc(var(--openui-dashboard-radius-sm) - 2px)";
                    const last = { r: rowLabels.length - 1, c: columnLabels.length - 1 };
                    return (
                      <td
                        key={column}
                        style={{
                          backgroundColor: background,
                          color,
                          height: 24,
                          minWidth: 24,
                          fontSize: 11,
                          borderTopLeftRadius: r === 0 && c === 0 ? corner : undefined,
                          borderTopRightRadius: r === 0 && c === last.c ? corner : undefined,
                          borderBottomLeftRadius: r === last.r && c === 0 ? corner : undefined,
                          borderBottomRightRadius:
                            r === last.r && c === last.c ? corner : undefined,
                        }}
                        {...hover.rowProps(`${row}-${column}`, () => (
                          // Every reading in the tooltip, whichever the switch shows.
                          <TooltipCard
                            title={`${row} · ${column}`}
                            format={props.format}
                            rows={[
                              { name: "Value", color: background, value },
                              ...(switchable
                                ? [
                                    {
                                      name: "Share of total",
                                      color: "transparent",
                                      value: (value / total) * 100,
                                      format: "percent" as const,
                                      mark: dot,
                                    },
                                    {
                                      name: `Share of ${row}`,
                                      color: "transparent",
                                      value: (value / rowTotal(r)) * 100,
                                      format: "percent" as const,
                                      mark: dot,
                                    },
                                  ]
                                : []),
                            ]}
                          />
                        ))}
                      >
                        {valuesOn ? cellText(reading) : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {hover.tip}
      </div>
    );
  },
});
