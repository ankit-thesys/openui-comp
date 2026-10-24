/**
 * The baseline's browser scenarios.
 *
 * Every scenario returns a record with an explicit `status`:
 *   "verified"    — the behaviour was exercised and asserted
 *   "unsupported" — the family does not implement it; a source citation says so
 *   "failed"      — it should have worked and did not (exits the run non-zero)
 *
 * A scenario that cannot find its control records "failed", never "unsupported".
 * Guessing "unsupported" from a missed hit target is exactly the error this
 * suite exists to avoid.
 */

export const ALL_FAMILIES = [
  "AreaChart",
  "AreaChartCondensed",
  "LineChart",
  "LineChartCondensed",
  "BarChart",
  "BarChartCondensed",
  "HorizontalBarChart",
  "PieChart",
  "RadialChart",
  "RadarChart",
  "FunnelChart",
  "HeatmapChart",
  "ScatterChart",
  "SegmentedBar",
  "SingleStackedBar",
  "CalendarHeatmap",
  "MiniAreaChart",
  "MiniBarChart",
  "MiniLineChart",
];

/** Snapshot of a family's observable toggle-relevant state. */
const SNAPSHOT = `(family) => {
  const card = [...document.querySelectorAll('[data-family]')].find(
    (c) => c.dataset['family'] === family,
  );
  if (!card) return null;
  const slot = card.querySelector('[data-chart-slot]');
  const vis = (el) => getComputedStyle(el).opacity;
  return {
    stackedLegendItems: slot.querySelectorAll('.openui-stacked-legend__item').length,
    defaultLegendItems: slot.querySelectorAll('.openui-chart-legend-item').length,
    visibleFilledPaths: [...slot.querySelectorAll('path')].filter((p) => {
      const f = p.getAttribute('fill') || '';
      return f !== '' && f !== 'none' && f !== 'transparent';
    }).length,
    seriesMarks: [...slot.querySelectorAll('path,rect,circle,polygon')].filter((m) => {
      const c = m.getAttribute('class') || '';
      return !/grid|axis|tick|crosshair|hover-highlight|scroll/i.test(c);
    }).length,
    stackedItemOpacity: [...slot.querySelectorAll('.openui-stacked-legend__item')].map(vis),
    defaultItemOpacity: [...slot.querySelectorAll('.openui-chart-legend-item')].map(vis),
    segmentWidths: [...slot.querySelectorAll('.openui-segmented-bar-segment')].map((s) => s.style.width),
    segmentOpacity: [...slot.querySelectorAll('.openui-segmented-bar-segment')].map((s) => s.style.opacity),
  };
}`;

const BOX_OF = `(args) => {
  const [family, selector] = args;
  const card = [...document.querySelectorAll('[data-family]')].find(
    (c) => c.dataset['family'] === family,
  );
  if (!card) return null;
  const el = card.querySelector('[data-chart-slot]').querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return {
    x: r.left + r.width / 2,
    y: r.top + r.height / 2,
    width: r.width,
    height: r.height,
    text: (el.textContent || '').trim().slice(0, 40),
  };
}`;

const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Legend toggle via a REAL click, with restoration.
 *
 * `control` is the selector of the actual clickable row. PieChart/RadialChart
 * publish their legend through the shared legend store and render it as
 * `.openui-stacked-legend__item` — NOT the `.openui-chart-legend-item` the
 * cartesian families use. PR #22 looked for the latter, found nothing, and
 * recorded the toggle as untested; it works.
 */
export async function legendToggle(b, family, control) {
  const before = await b.run(SNAPSHOT, family);
  if (!before) return { family, scenario: "legend-toggle", status: "failed", detail: "family card not found" };

  const box = await b.run(BOX_OF, [family, control]);
  if (!box) {
    return {
      family,
      scenario: "legend-toggle",
      status: "failed",
      detail: `no visible control matched ${control}`,
    };
  }

  await b.click(box.x, box.y);
  await new Promise((r) => setTimeout(r, 350));
  const after = await b.run(SNAPSHOT, family);

  await b.click(box.x, box.y);
  await new Promise((r) => setTimeout(r, 350));
  const restored = await b.run(SNAPSHOT, family);

  const changed = !eq(before, after);
  const restoredExactly = eq(before, restored);

  return {
    family,
    scenario: "legend-toggle",
    status: changed && restoredExactly ? "verified" : "failed",
    control,
    clickedAt: { x: Math.round(box.x), y: Math.round(box.y) },
    controlText: box.text,
    changedOnToggle: changed,
    restoredExactly,
    before,
    after,
    restored,
    detail: changed
      ? restoredExactly
        ? undefined
        : "toggled but did not restore to the original state"
      : "clicking the control changed nothing observable",
  };
}

/**
 * A family that deliberately has no legend toggle.
 *
 * Asserts the NEGATIVE properly: the click really happens on the real legend
 * row, and nothing changes. Paired with a source citation so "unsupported" is
 * evidence rather than an assumption, and with the behaviour that IS supported.
 */
export async function legendToggleUnsupported(b, family, control, citation) {
  const before = await b.run(SNAPSHOT, family);
  if (!before) return { family, scenario: "legend-toggle", status: "failed", detail: "family card not found" };

  const box = await b.run(BOX_OF, [family, control]);
  if (!box) {
    return {
      family,
      scenario: "legend-toggle",
      status: "failed",
      detail: `no visible legend row matched ${control}; cannot demonstrate the negative`,
    };
  }

  await b.click(box.x, box.y);
  await new Promise((r) => setTimeout(r, 350));
  const after = await b.run(SNAPSHOT, family);

  const unchanged = eq(before, after);
  return {
    family,
    scenario: "legend-toggle",
    status: unchanged ? "unsupported" : "failed",
    control,
    clickedAt: { x: Math.round(box.x), y: Math.round(box.y) },
    controlText: box.text,
    citation,
    before,
    after,
    detail: unchanged
      ? "clicking a real legend row changes nothing — matches the source comment"
      : "source says there is no visibility toggle, but clicking DID change state",
  };
}

/**
 * Hover-highlight: what the segmented-bar families support instead of toggling.
 * Uses a real mouse move to the measured centre of a segment.
 */
export async function hoverHighlight(b, family, target) {
  const before = await b.run(SNAPSHOT, family);
  if (!before) return { family, scenario: "hover-highlight", status: "failed", detail: "family card not found" };

  const box = await b.run(BOX_OF, [family, target]);
  if (!box) {
    return { family, scenario: "hover-highlight", status: "failed", detail: `no element matched ${target}` };
  }

  await b.mouseMove(box.x, box.y);
  await new Promise((r) => setTimeout(r, 300));
  const during = await b.run(SNAPSHOT, family);

  // Park the pointer far away to end the hover.
  await b.mouseMove(5, 5);
  await new Promise((r) => setTimeout(r, 350));
  const after = await b.run(SNAPSHOT, family);

  const highlighted = !eq(before, during);
  const restored = eq(before, after);
  return {
    family,
    scenario: "hover-highlight",
    status: highlighted && restored ? "verified" : "failed",
    target,
    hoveredAt: { x: Math.round(box.x), y: Math.round(box.y) },
    highlightedOnHover: highlighted,
    restoredOnLeave: restored,
    before,
    during,
    after,
    detail: highlighted
      ? restored
        ? undefined
        : "highlighted but did not return to the original state"
      : "hovering a segment changed nothing observable",
  };
}

/**
 * Geometry of a family inside the container fixture.
 *
 * Measures drawn WIDTH (right - left), not just the right edge: a chart that
 * merely shifts rightward because a sibling legend reflowed would grow its
 * right edge without growing itself, and would read as "responsive" when it is
 * not. `widestSvgWidth` is used rather than the first `<svg>` because the
 * scroll-mode cartesian families put a narrow fixed y-axis strip first, so the
 * first svg is ~30px regardless of the container.
 */
export const CONTAINER_GEOMETRY = `(family) => {
  const card = [...document.querySelectorAll('[data-family]')].find(
    (c) => c.dataset['family'] === family,
  );
  if (!card) return null;
  const box = card.querySelector('[data-container]');
  const slot = card.querySelector('[data-chart-slot]');
  const b = box.getBoundingClientRect();

  let left = Infinity;
  let right = -Infinity;
  let marks = 0;
  for (const m of slot.querySelectorAll('path,rect,circle,polygon,div.openui-segmented-bar-segment')) {
    const r = m.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    marks++;
    left = Math.min(left, r.left);
    right = Math.max(right, r.right);
  }

  let widest = 0;
  for (const svg of slot.querySelectorAll('svg')) {
    widest = Math.max(widest, svg.getBoundingClientRect().width);
  }

  const has = Number.isFinite(left) && Number.isFinite(right);
  return {
    containerWidth: Math.round(b.width),
    widestSvgWidth: Math.round(widest),
    drawnWidth: has ? Math.round(right - left) : null,
    drawnRight: has ? Math.round(right) : null,
    overflowRightPx: has ? Math.round(right - b.right) : null,
    markCount: marks,
  };
}`;
