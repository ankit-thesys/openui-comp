"use client";

// Local copies of charts.tsx helpers; shared with the other chart ports after integration.
import { useId } from "react";

// Reference belongs to the Trends group, which registers it; Scatter takes that one.
export { Reference, type ReferenceProps } from "../trends/charts";

/** A reference line's label: an ink chip pinned to the line's start. */
const CURSOR_CAP = 3;

/**
 * The one hover cursor for every cartesian chart: a 1px ink line with small
 * perpendicular caps at both ends. Recharts hands line charts the two end
 * points and bar charts the hovered band; for a band the line runs through
 * its centre, vertical for columns and horizontal for horizontal bars.
 */
export function InkCursor(props: {
  points?: { x: number; y: number }[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}) {
  const { points, x, y, width, height } = props;
  const fadeId = `openui-dashboard-cursor-${useId().replace(/:/g, "")}`;
  let line: [number, number, number, number] | null = null;
  if (points && points.length >= 2) line = [points[0]!.x, points[0]!.y, points[1]!.x, points[1]!.y];
  else if (x != null && y != null && width != null && height != null)
    line =
      width > height
        ? [x, y + height / 2, x + width, y + height / 2]
        : [x + width / 2, y, x + width / 2, y + height];
  if (!line) return null;
  const [x1, y1, x2, y2] = line;
  const vertical = Math.abs(x2 - x1) < Math.abs(y2 - y1);
  const cap = (cx: number, cy: number) =>
    vertical
      ? `M${cx - CURSOR_CAP},${cy}H${cx + CURSOR_CAP}`
      : `M${cx},${cy - CURSOR_CAP}V${cy + CURSOR_CAP}`;
  // Full ink at the middle, fading to 20% at both ends (caps included).
  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id={fadeId} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
          <stop offset="0%" stopColor="var(--openui-dashboard-ink)" stopOpacity={0.2} />
          <stop offset="50%" stopColor="var(--openui-dashboard-ink)" stopOpacity={1} />
          <stop offset="100%" stopColor="var(--openui-dashboard-ink)" stopOpacity={0.2} />
        </linearGradient>
      </defs>
      <path
        d={`M${x1},${y1}L${x2},${y2}${cap(x1, y1)}${cap(x2, y2)}`}
        fill="none"
        stroke={`url(#${fadeId})`}
        strokeWidth={1}
      />
    </g>
  );
}

/** Top margin a chart leaves when a vertical line's chip sits above its plot: the 18px chip, less its 3px overlap, plus 9px of air above. */
export const CHIP_ROOM = 24;

/** The reference chip's measurements, shared by the SVG chip on chart lines and the HTML chip on row charts. */
/** The least height a plot keeps: below it, a card grows rather than squash the chart. Rows set the real height. */
export const PLOT_FLOOR = 200;

export const CHIP = { height: 18, radius: 5, fontSize: 11 } as const;

export function ReferenceChipLabel({
  viewBox,
  text,
}: {
  viewBox?: { x: number; y: number; width: number; height: number };
  text?: string;
}) {
  if (!viewBox || !text) return null;
  const vertical = (viewBox.height ?? 0) > (viewBox.width ?? 0);
  const h = CHIP.height;
  const w = Math.round(text.length * 6.1) + 14;
  const x = vertical ? viewBox.x - w / 2 : viewBox.x;
  // A vertical line's chip sits above the plot, covering only the line's first 3px,
  // so about 4px of air remains above the first bar. Charts leave CHIP_ROOM at the top for it.
  const y = vertical ? viewBox.y - h + 3 : viewBox.y - h / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={CHIP.radius} fill="var(--openui-dashboard-ink)" />
      <text
        x={x + w / 2}
        y={y + h / 2}
        dy={3.5}
        textAnchor="middle"
        fontSize={CHIP.fontSize}
        fontWeight={500}
        fill="var(--openui-dashboard-surface)"
      >
        {text}
      </text>
    </g>
  );
}
