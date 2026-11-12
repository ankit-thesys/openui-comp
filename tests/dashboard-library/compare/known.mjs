// Differences between the preview and our library that are understood (#230). A rule names the
// programs (key: "Page / Section / versions") and the differences it covers, its kind and its
// cause:
//
// - "deliberate": our library differs on purpose;
// - "preview-only": a style of the preview's own page, not of the library;
// - "gap": a real gap, reported with its cause, to fix in its own ticket (not here).
//
// `match(difference, all)` sees the difference and every other difference of the same program.
// Anything no rule covers is a real gap whose cause is not explained yet.

const kpiGap = (d) => /› style › gap$/.test(d.path) && d.his === "10px" && d.ours === "12px";

export const KNOWN = [
  {
    entry: /./,
    match: (d, all) =>
      all.some(kpiGap) &&
      (kpiGap(d) || /› box › [yh]$/.test(d.path) || /^scope › content › h$/.test(d.path)),
    kind: "gap",
    cause:
      "A KPI card's gap is 12px in ours, 10px in the preview. kpiStyles.ts sets .openui-dashboard-kpi { gap: 10px }, but styles.ts's .openui-dashboard-card { gap: var(--openui-dashboard-space-sm) } has the same specificity and is inserted later, so it wins (the preview inserts .pdk-kpi after .pdk-card). Each KPI card is 4px taller, which moves its value, foot and visual down 2-4px and every unit below the strip by 4px per row.",
  },
];
