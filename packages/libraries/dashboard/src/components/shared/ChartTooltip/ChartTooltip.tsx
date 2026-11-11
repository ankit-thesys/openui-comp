"use client";

import { type ValueFormat } from "../../../format";
import { Row, seriesColor } from "../../../shared/chartHelpers";
import { MUTED_COLOR } from "../../../theme";
import { type SeriesProps } from "../../../trends/charts";
import { type GoodWhen } from "../DeltaBadge";
import { TooltipCard, type TooltipRow } from "../TooltipCard";

export type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: Row }>;
  label?: string;
  series: SeriesProps[];
  format?: ValueFormat | null;
  goodWhen?: GoodWhen;
  showPrevious: boolean;
  previousLabel: string;
  /** A series' swatch colour; gets the hovered row too, for marks coloured per value (diverging bars). */
  colorOf?: (i: number, row: Row) => string;
};

export function ChartTooltip({
  active,
  payload,
  label,
  series,
  format,
  goodWhen,
  showPrevious,
  previousLabel,
  colorOf = seriesColor,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const row = payload[0]!.payload;
  const rows: TooltipRow[] = series.map((s, i) => ({
    name: s.name,
    color: colorOf(i, row),
    // A projected period keeps its value in f{i} (see forecastFrom).
    value: (row[`s${i}`] ?? row[`f${i}`] ?? null) as number | null,
    previous: showPrevious ? (row[`p${i}`] as number | null) : null,
  }));
  if (showPrevious && series.length === 1 && typeof row["p0"] === "number") {
    rows.push({
      name: previousLabel,
      color: MUTED_COLOR,
      value: row["p0"] as number,
      dashed: true,
    });
  }
  return (
    <TooltipCard
      title={String(label ?? row["label"])}
      rows={rows}
      format={format}
      goodWhen={goodWhen}
    />
  );
}
