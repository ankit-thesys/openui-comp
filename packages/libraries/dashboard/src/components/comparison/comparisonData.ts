/** Resolved chart data, independent of OpenUI nodes. */
export interface SeriesProps {
  name: string;
  values: (number | null)[];
  previous?: (number | null)[];
  mark?: "line" | "area" | "bar";
  lows?: (number | null)[];
  highs?: (number | null)[];
}
export interface ReferenceProps {
  label: string;
  value: number;
  axis?: "x" | "y";
}
