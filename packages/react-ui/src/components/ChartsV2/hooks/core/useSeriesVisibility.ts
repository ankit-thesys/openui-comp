import { useCallback, useState } from "react";

export function useSeriesVisibility(seriesKeys: string[]) {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const toggleSeries = useCallback(
    (key: string) => {
      setHiddenSeries((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          if (next.size >= seriesKeys.length - 1) return prev;
          next.add(key);
        }
        return next;
      });
    },
    [seriesKeys.length],
  );

  return { hiddenSeries, toggleSeries };
}
