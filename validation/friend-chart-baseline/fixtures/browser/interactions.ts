/**
 * Browser-side interaction probe, exposed as `window.__chartProbe`.
 *
 * Committed as a file (rather than pasted into a console) so the interaction
 * evidence is reproducible: load the fixture, call the probe, compare the JSON.
 * See README.md for the exact commands.
 *
 * Honest framing of what this proves: the probe dispatches synthetic
 * MouseEvents. That exercises the components' real handlers, scales and
 * rendering, but it is not a real input device, so it cannot catch problems
 * that live below the event layer (hit-testing against the OS cursor, pointer
 * capture, touch emulation). Two families are additionally driven with a real
 * mouse through the browser automation; see reports/REPORT.md.
 */

const TOOLTIP_ROOT = ".openui-portal-tooltip";

export interface HoverResult {
  family: string;
  tooltipShown: boolean;
  tooltipText: string;
  /** Tooltip disappeared again after the pointer left. */
  dismissedOnLeave: boolean;
}

export interface LegendToggleResult {
  family: string;
  legendItems: number;
  /** Series marks (grid/axis chrome excluded) before and after the toggle. */
  marksBefore: number;
  marksAfter: number;
  /** The toggled legend item's opacity while hidden — the dimming affordance. */
  hiddenOpacity: string;
  /** Clicking the item again restored the original mark count. */
  restored: boolean;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function fire(el: Element, type: string, x: number, y: number) {
  el.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX: x, clientY: y, view: window }));
}

function tooltipText(): string {
  const tip = document.querySelector(TOOLTIP_ROOT);
  return tip ? (tip.textContent ?? "").trim() : "";
}

/** Chrome that is not series data: grid, axes, crosshair, scroll affordances. */
const CHROME = /grid|axis|tick|crosshair|hover-highlight|scroll|separator|indicator/i;

/**
 * Count only the marks that represent SERIES DATA.
 *
 * A naive count of every path/rect/circle/line is misleading for the legend
 * probe: hiding a series rescales the value axis, which changes the NUMBER OF
 * GRIDLINES. On LineChart those two effects cancelled exactly (3 series paths +
 * 6 dots + 9 gridlines before, 2 + 4 + 12 after — 18 both times), which would
 * have read as "the toggle did nothing" when it was working correctly.
 */
function countMarks(root: Element): number {
  let n = 0;
  for (const el of root.querySelectorAll("path,rect,circle,polygon,polyline,line")) {
    const own = el.getAttribute("class") ?? "";
    if (CHROME.test(own)) continue;
    // Also skip marks that merely live inside a chrome group.
    let p: Element | null = el.parentElement;
    let chrome = false;
    while (p && p !== root) {
      if (CHROME.test(p.getAttribute("class") ?? "")) { chrome = true; break; }
      p = p.parentElement;
    }
    if (!chrome) n++;
  }
  return n;
}

/** Series marks, by the class names the families actually stamp on them. */
const SERIES_MARK =
  /-(bar|dot|cell|slice|segment|point|area-path|line|polygon-area|stage|arc)\b/i;
const CHROME_MARK = /crosshair|hover-highlight|grid|active-dot|tick|axis/i;

/**
 * A point that is genuinely ON the drawn mark, in viewport coordinates.
 *
 * Neither of the obvious choices works across these families:
 *
 * - The bounding-box CENTRE misses concave shapes (a pie slice, a funnel
 *   stage), landing in empty space.
 * - `isPointInFill` is wrong for the line charts: a `fill="none"` curve still
 *   reports its implied closed region as "filled", so the bbox centre tests
 *   true while sitting well off the stroke.
 *
 * So stroked-but-unfilled paths are sampled along their length
 * (`getPointAtLength`), and filled shapes are sampled over their bbox with
 * `isPointInFill`.
 */
function markPoint(m: Element): { x: number; y: number } | null {
  const r = m.getBoundingClientRect();
  if (r.width <= 0 && r.height <= 0) return null;
  const centre = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  // A plain HTML element (SegmentedBar's divs) has no SVG geometry API; its
  // bbox centre is always inside it, so the centre is already correct.
  if (!(m instanceof SVGGraphicsElement)) return centre;
  const geom = m as SVGGeometryElement;
  const ctm = typeof geom.getScreenCTM === "function" ? geom.getScreenCTM() : null;
  if (!ctm) return centre;

  const fill = m.getAttribute("fill") ?? "";
  const unfilled = fill === "none" || fill === "transparent" || fill === "";

  // An open, stroked curve: take a point ON the curve itself.
  if (unfilled && typeof geom.getTotalLength === "function") {
    try {
      const len = geom.getTotalLength();
      if (len > 0) {
        const local = geom.getPointAtLength(len / 2);
        const p = local.matrixTransform(ctm);
        return { x: p.x, y: p.y };
      }
    } catch {
      /* fall through to the bbox strategies below */
    }
  }

  // A filled shape: find a point actually inside the filled region.
  if (typeof geom.isPointInFill === "function" && geom.ownerSVGElement) {
    const inv = ctm.inverse();
    const steps = [0.5, 0.35, 0.65, 0.25, 0.75];
    const candidates: Array<{ x: number; y: number; d: number }> = [];
    for (const fx of steps) {
      for (const fy of steps) {
        const x = r.left + r.width * fx;
        const y = r.top + r.height * fy;
        candidates.push({ x, y, d: Math.hypot(x - centre.x, y - centre.y) });
      }
    }
    candidates.sort((a, b) => a.d - b.d);
    for (const c of candidates) {
      const pt = geom.ownerSVGElement.createSVGPoint();
      pt.x = c.x;
      pt.y = c.y;
      try {
        if (geom.isPointInFill(pt.matrixTransform(inv))) return { x: c.x, y: c.y };
      } catch {
        return centre;
      }
    }
  }
  return centre;
}

/**
 * Where to hover for a family: the middle SERIES mark, in DOM order.
 *
 * Transparent full-plot hit rects are excluded first. For ScatterChart and
 * HeatmapChart such a rect is the largest element in the card, and hovering it
 * is not hovering data — scatter only tooltips near a real point — so it read
 * as "no tooltip" for families whose tooltips work fine on a dot or a cell.
 *
 * The event is then dispatched at `elementFromPoint`, which matters for
 * PieChart: its visible slices sit in a `pointer-events:none` group behind a
 * transparent slice-shaped hit path, so the resolved element is the hit path —
 * exactly what a real pointer would hit.
 */
function hoverPoint(slot: Element): { el: Element; x: number; y: number } | null {
  // SegmentedBar/SingleStackedBar draw with CSS divs, not SVG, so an
  // SVG-only selector finds nothing for them and their (working) tooltip reads
  // as absent. Their segment divs are candidates like any other mark.
  const drawn = [
    ...slot.querySelectorAll("path,rect,circle,polygon,div.openui-segmented-bar-segment"),
  ].filter((m) => {
    const cls = m.getAttribute("class") ?? "";
    if (CHROME_MARK.test(cls)) return false;
    const r = m.getBoundingClientRect();
    return r.width > 0 || r.height > 0;
  });
  // Prefer marks the family has CLASSED as series data. PieChart is the
  // exception that forces a fallback: its slice paths carry no class at all,
  // so for it "series marks" are simply the visibly filled ones.
  const classed = drawn.filter((m) => SERIES_MARK.test(m.getAttribute("class") ?? ""));
  const marks = classed.length
    ? classed
    : drawn.filter((m) => {
        const fill = m.getAttribute("fill") ?? "";
        return fill !== "" && fill !== "none" && fill !== "transparent";
      });
  if (marks.length === 0) return null;

  // Deterministic pick: the visible mark nearest the centre of the card.
  //
  // Two earlier rules failed. Ranking by AREA was unstable — CalendarHeatmap's
  // 90 cells share one area, so the "median" landed on a different cell each
  // run. The middle mark in DOM ORDER was stable but wrong for the families
  // with an INTERNAL SCROLL CONTAINER: HorizontalBarChart shows three of six
  // rows at a time and CalendarHeatmap clips its grid, so the middle mark is
  // often scrolled out of sight, where nothing can hover it.
  //
  // Restricting to marks whose centre is inside the card's visible box, then
  // taking the one closest to that box's centre, is both deterministic and
  // true to what a pointer could actually reach.
  const slotBox = slot.getBoundingClientRect();
  const sx = slotBox.left + slotBox.width / 2;
  const sy = slotBox.top + slotBox.height / 2;
  const visible = marks
    .map((m) => {
      const r = m.getBoundingClientRect();
      return { m, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    })
    .filter(
      (c) =>
        c.cx >= slotBox.left && c.cx <= slotBox.right &&
        c.cy >= slotBox.top && c.cy <= slotBox.bottom,
    )
    .map((c) => ({ ...c, d: Math.hypot(c.cx - sx, c.cy - sy) }))
    .sort((a, b) => a.d - b.d || a.cx - b.cx || a.cy - b.cy);
  const pick = (visible[0]?.m ?? marks[Math.floor(marks.length / 2)]) as Element;

  const pt = markPoint(pick);
  if (!pt) return null;
  // `elementFromPoint` is VIEWPORT-relative and returns null for anything
  // scrolled out of view, so the caller scrolls each card in first. Even then
  // it can miss (a point exactly on a 1px stroke), and the mark itself is the
  // correct fallback: React delegates from the document root, so an event
  // dispatched on the mark reaches the same handlers.
  const atPoint = document.elementFromPoint(pt.x, pt.y);
  return { el: atPoint ?? pick, x: pt.x, y: pt.y };
}

async function hoverProbe(family: string, slot: Element): Promise<HoverResult> {
  const target = hoverPoint(slot);
  if (!target) return { family, tooltipShown: false, tooltipText: "", dismissedOnLeave: false };
  const { el, x, y } = target;

  fire(el, "mouseover", x, y);
  fire(el, "mousemove", x, y);
  await sleep(220);
  const text = tooltipText();
  const shown = text.length > 0;

  fire(el, "mouseout", x, y);
  fire(el, "mouseleave", x, y);
  await sleep(320);
  return { family, tooltipShown: shown, tooltipText: text, dismissedOnLeave: tooltipText() === "" };
}

async function legendProbe(family: string, slot: Element): Promise<LegendToggleResult | null> {
  const items = [...slot.querySelectorAll(".openui-chart-legend-item")];
  if (items.length === 0) return null;
  const before = countMarks(slot);
  (items[0] as HTMLElement).click();
  await sleep(220);
  const after = countMarks(slot);
  const hiddenOpacity = (items[0] as HTMLElement).style.opacity;
  (items[0] as HTMLElement).click();
  await sleep(220);
  return {
    family,
    legendItems: items.length,
    marksBefore: before,
    marksAfter: after,
    hiddenOpacity,
    restored: countMarks(slot) === before,
  };
}

export interface ProbeReport {
  theme: string;
  viewport: { width: number; height: number };
  hover: HoverResult[];
  legend: LegendToggleResult[];
}

async function run(): Promise<ProbeReport> {
  const hover: HoverResult[] = [];
  const legend: LegendToggleResult[] = [];
  for (const card of document.querySelectorAll<HTMLElement>("[data-family]")) {
    const family = card.dataset.family!;
    const slot = card.querySelector("[data-chart-slot]")!;
    // Bring the card into the viewport: hit-testing is viewport-relative, and
    // a real pointer can only hover what is on screen.
    card.scrollIntoView({ block: "center" });
    await sleep(120);
    hover.push(await hoverProbe(family, slot));
    const l = await legendProbe(family, slot);
    if (l) legend.push(l);
  }
  return {
    theme: document.querySelector<HTMLElement>("[data-theme-mode]")?.dataset.themeMode ?? "unknown",
    viewport: { width: window.innerWidth, height: window.innerHeight },
    hover,
    legend,
  };
}

declare global {
  interface Window {
    __chartProbe: () => Promise<ProbeReport>;
  }
}

window.__chartProbe = run;
