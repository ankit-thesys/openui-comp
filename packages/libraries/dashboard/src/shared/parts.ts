import { toNumbers } from "./values";

/* ---------- Fold the smallest into Other ---------- */

/**
 * Past `max` items, the names of the `keep` largest by `size` (ties go to the one given first); the
 * rest fold into Other, so a chart never carries more hues than can be told apart. null when all fit.
 */
export function keepLargest<T>(
  items: T[],
  name: (item: T) => string,
  size: (item: T) => number,
  max = 8,
  keep = max - 1,
): Set<string> | null {
  if (items.length <= max) return null;
  return new Set(
    [...items]
      .sort((a, b) => size(b) - size(a))
      .slice(0, keep)
      .map(name),
  );
}

/** Parts past `max`: the kept parts in their given order, and what the rest add up to (0 when nothing folds). */
export function foldParts<T extends { label: string; value: number }>(
  parts: T[],
  max = 8,
  keep = max - 1,
): { kept: T[]; other: number } {
  const keepSet = keepLargest(
    parts,
    (part) => part.label,
    (part) => part.value,
    max,
    keep,
  );
  if (!keepSet) return { kept: parts, other: 0 };
  return {
    kept: parts.filter((part) => keepSet.has(part.label)),
    other: parts
      .filter((part) => !keepSet.has(part.label))
      .reduce((sum, part) => sum + part.value, 0),
  };
}
/** Names of series with no usable number at all: they draw nothing, so they get a note. */
export function unusableSeries(series: { name?: string; values?: unknown }[]): string[] {
  return series
    .filter((s) => !toNumbers(s.values).some((v) => typeof v === "number" && Number.isFinite(v)))
    .map((s, i) => s.name || `Series ${i + 1}`);
}
