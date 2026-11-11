// The one measuring routine of the preview comparison (#230). It is loaded as text and run unchanged
// in both pages: the dashboards-ui-library live preview (prefix "pdk-") and our host (prefix
// "openui-dashboard-"). It reads only what a viewer can observe (DOM, roles, text, computed styles,
// positions, SVG marks) and drives each unit's interactions, so the two results compare directly.
//
// `measureScope(P, scope)` measures every unit under `scope`, the dashboard root of one program:
// each Card, plus the FilterBar, the Kpis strips and the section heads that sit outside cards.
// Class names drop the prefix, and run-specific values (recharts and React ids, url(#…) targets)
// are blanked, so nothing differs between two runs of the same page.

// eslint-disable-next-line no-unused-vars
async function measureScope(P, scope) {
  const doc = scope.ownerDocument;
  const win = doc.defaultView;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const frames = () =>
    new Promise((resolve) => win.requestAnimationFrame(() => win.requestAnimationFrame(resolve)));
  const settle = async (ms = 150) => {
    await frames();
    await sleep(ms);
    await frames();
  };
  const sel = (s) => s.replaceAll("$", "." + P);
  const clean = (value) =>
    String(value ?? "")
      .replaceAll(P, "")
      .replace(/url\(\s*["']?#[^)"']*["']?\s*\)/g, "url(#)")
      .replace(/recharts\d+(-[\w-]+)?/g, "recharts")
      .replace(/:r[\w-]*:|«r[\w-]*»|_r_[\w-]*_/g, "")
      .replace(/\s+/g, " ")
      .trim();
  const classes = (el) =>
    clean(el.getAttribute("class"))
      .split(" ")
      .filter((c) => c && !/^(go|css-)[\w-]{4,}$/.test(c))
      .sort()
      .join(".");
  const r1 = (n) => Math.round(n * 10) / 10;
  const rect = (el) => el.getBoundingClientRect();
  // Positions are relative to the dashboard's content box: the preview's specimens drop the
  // dashboard's padding, so the scope's own edge would offset every box on one side.
  const dashboard = scope.querySelector(`:scope > .${P}dashboard`) ?? scope;
  const content = () => {
    const b = rect(dashboard);
    const s = win.getComputedStyle(dashboard);
    const [l, r, t, bt] = ["Left", "Right", "Top", "Bottom"].map(
      (side) => parseFloat(s[`padding${side}`]) || 0,
    );
    return { left: b.left + l, top: b.top + t, width: b.width - l - r, height: b.height - t - bt };
  };
  const box = (el, base = content()) => {
    const b = rect(el);
    // An empty box has no position worth comparing (display: contents, a collapsed slot).
    if (b.width === 0 && b.height === 0) return { w: 0, h: 0 };
    return { x: r1(b.left - base.left), y: r1(b.top - base.top), w: r1(b.width), h: r1(b.height) };
  };
  const style = (el, props) => {
    const s = win.getComputedStyle(el);
    const out = {};
    for (const p of props) out[p] = clean(s[p]);
    return out;
  };
  const visible = (el) => {
    if (!el.getClientRects().length) return false;
    const s = win.getComputedStyle(el);
    return s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) > 0;
  };
  const text = (el, max = 600) => clean(el.innerText ?? el.textContent).slice(0, max);

  const STYLE = [
    "display",
    "position",
    "boxSizing",
    "padding",
    "margin",
    "gap",
    "flexDirection",
    "alignItems",
    "justifyContent",
    "gridTemplateColumns",
    "color",
    "backgroundColor",
    "borderTopWidth",
    "borderTopStyle",
    "borderTopColor",
    "borderBottomWidth",
    "borderBottomColor",
    "borderRadius",
    "boxShadow",
    "outlineStyle",
    "opacity",
    "fontFamily",
    "fontSize",
    "fontWeight",
    "fontStyle",
    "lineHeight",
    "letterSpacing",
    "textAlign",
    "textTransform",
    "textOverflow",
    "whiteSpace",
    "overflowX",
    "overflowY",
    "cursor",
    "fontVariantNumeric",
  ];
  const ATTRS = [
    "role",
    "aria-label",
    "aria-checked",
    "aria-selected",
    "aria-pressed",
    "aria-expanded",
    "aria-haspopup",
    "aria-sort",
    "aria-hidden",
    "aria-busy",
    "aria-live",
    "aria-valuenow",
    "aria-valuemin",
    "aria-valuemax",
    "aria-orientation",
    "aria-disabled",
    "tabindex",
    "type",
    "disabled",
    "scope",
    "colspan",
    "rowspan",
  ];

  // ---- Units ----
  const UNIT = sel("$card, $filterbar, $kpis, $section-head");
  // A unit inside another (the cards in a Kpis strip) is measured on its own; its parent's
  // element walk stops at it.
  const units = [...scope.querySelectorAll(UNIT)].filter((el) => visible(el));
  const kindOf = (el) =>
    ["card", "filterbar", "kpis", "section-head"].find((k) => el.classList.contains(P + k));
  const isUnit = (el) => el.matches(UNIT);

  // ---- SVG summaries: counts, paints and labels, never per-node ids ----
  const svgSummary = (svg, base) => {
    const marks = [...svg.querySelectorAll("path, rect, circle, ellipse, line, polyline, polygon")];
    const count = {};
    const fills = {};
    const strokes = {};
    let dashed = 0;
    for (const m of marks) {
      const tag = m.tagName.toLowerCase();
      count[tag] = (count[tag] ?? 0) + 1;
      const s = win.getComputedStyle(m);
      if (s.display === "none" || s.visibility === "hidden") continue;
      const fill = clean(s.fill);
      const stroke = clean(s.stroke);
      if (fill !== "none") fills[fill] = (fills[fill] ?? 0) + 1;
      if (stroke !== "none") strokes[stroke] = (strokes[stroke] ?? 0) + 1;
      if (s.strokeDasharray && s.strokeDasharray !== "none") dashed++;
    }
    const sort = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : 1)));
    return {
      box: box(svg, base),
      viewBox: clean(svg.getAttribute("viewBox")),
      classes: classes(svg),
      count: sort(count),
      fills: sort(fills),
      strokes: sort(strokes),
      dashed,
      texts: [...svg.querySelectorAll("text")].map((t) => clean(t.textContent)).filter(Boolean),
    };
  };
  const svgsOf = (unit) =>
    [...unit.querySelectorAll("svg")].filter(
      (svg) => !svg.parentElement.closest("svg") && rect(svg).width > 0,
    );

  // ---- The element tree: every element outside SVG, keyed by its path of classes ----
  const elements = (unit) => {
    const base = rect(unit);
    const out = {};
    const walk = (el, path, depth) => {
      const seen = {};
      for (const child of el.children) {
        if (child.tagName.toLowerCase() === "svg" || child.closest("svg") !== null) continue;
        if (isUnit(child)) continue;
        const name = `${child.tagName.toLowerCase()}${classes(child) ? "." + classes(child) : ""}`;
        seen[name] = (seen[name] ?? 0) + 1;
        const key = `${path}>${name}${seen[name] > 1 ? `#${seen[name]}` : ""}`;
        const attrs = {};
        for (const a of ATTRS) if (child.hasAttribute(a)) attrs[a] = clean(child.getAttribute(a));
        const own = clean(
          [...child.childNodes]
            .filter((n) => n.nodeType === 3)
            .map((n) => n.textContent)
            .join(" "),
        ).slice(0, 120);
        const entry = { box: box(child, base) };
        if (Object.keys(attrs).length) entry.attrs = attrs;
        if (own) entry.text = own;
        const prefixed = String(child.getAttribute("class") ?? "").includes(P);
        const control = /^(button|input|select|th|td|a|label)$/i.test(child.tagName);
        if (prefixed || control) entry.style = style(child, STYLE);
        if (child.tagName === "INPUT") entry.value = clean(child.value);
        out[key] = entry;
        if (depth < 16) walk(child, key, depth + 1);
      }
    };
    walk(unit, "", 0);
    return out;
  };

  // ---- Tooltips and popups, wherever they are portalled ----
  const popups = () =>
    [
      ...doc.querySelectorAll(
        [
          '[role="tooltip"]',
          '[role="listbox"]',
          '[role="menu"]',
          '[role="dialog"]',
          ".recharts-tooltip-wrapper",
          sel("$tip"),
          sel("$rowtip"),
          sel("$tooltip"),
          sel("$popover"),
          sel("$menu"),
        ].join(", "),
      ),
    ]
      .filter((el) => visible(el) && text(el))
      .map((el) => text(el, 400));

  const point = (el) => {
    const b = rect(el);
    return { clientX: b.left + b.width / 2, clientY: b.top + b.height / 2 };
  };
  const hoverAt = async (x, y) => {
    const target = doc.elementFromPoint(x, y);
    if (!target) return null;
    const init = { bubbles: true, cancelable: true, clientX: x, clientY: y, view: win };
    target.dispatchEvent(new win.PointerEvent("pointerover", init));
    target.dispatchEvent(new win.PointerEvent("pointerenter", init));
    target.dispatchEvent(new win.MouseEvent("mouseover", init));
    target.dispatchEvent(new win.MouseEvent("mouseenter", init));
    target.dispatchEvent(new win.PointerEvent("pointermove", init));
    target.dispatchEvent(new win.MouseEvent("mousemove", init));
    await settle(200);
    const shown = popups();
    const leave = { bubbles: true, cancelable: true, clientX: 0, clientY: 0, view: win };
    target.dispatchEvent(new win.PointerEvent("pointerout", leave));
    target.dispatchEvent(new win.PointerEvent("pointerleave", leave));
    target.dispatchEvent(new win.MouseEvent("mouseout", leave));
    target.dispatchEvent(new win.MouseEvent("mouseleave", leave));
    doc.body.dispatchEvent(new win.MouseEvent("mousemove", leave));
    await settle(80);
    return shown;
  };

  // What a switch, sort or filter changes: the unit's text, height and marks, or for a FilterBar
  // the start of every other unit's text.
  const snap = (unit) =>
    kindOf(unit) === "filterbar"
      ? { units: units.filter((u) => u !== unit).map((u) => text(u, 160)) }
      : {
          h: r1(rect(unit).height),
          text: text(unit),
          svgs: svgsOf(unit).map((svg) => {
            const s = svgSummary(svg, rect(unit));
            return { count: s.count, fills: s.fills, texts: s.texts.slice(0, 40) };
          }),
        };

  const key = (el, name) =>
    el.dispatchEvent(
      new win.KeyboardEvent("keydown", { key: name, bubbles: true, cancelable: true }),
    );

  // ---- Interactions ----
  const interact = async (unit) => {
    const out = {};
    unit.scrollIntoView({ block: "center" });
    await settle(60);

    // Every radio group in the unit: the view switch, the Show switch, chips, period pickers.
    const groups = [...unit.querySelectorAll('[role="radiogroup"]')].filter(visible);
    out.radioGroups = [];
    for (const group of groups) {
      const radios = () => [...group.querySelectorAll('[role="radio"]')].filter(visible);
      const checked = () => radios().find((r) => r.getAttribute("aria-checked") === "true") ?? null;
      const label = (r) => (r ? clean(r.getAttribute("aria-label") || r.textContent) : null);
      const first = checked();
      const g = {
        label: clean(group.getAttribute("aria-label")),
        initial: label(first),
        options: {},
      };
      for (const radio of radios()) {
        const name = label(radio);
        radio.click();
        await settle();
        g.options[name] = { checked: label(checked()), ...snap(unit) };
      }
      const current = checked() ?? radios()[0];
      current?.focus();
      key(current, "ArrowRight");
      await settle(80);
      g.arrowRight = { checked: label(checked()), focused: label(doc.activeElement) };
      key(doc.activeElement, "End");
      await settle(80);
      g.end = { checked: label(checked()), focused: label(doc.activeElement) };
      key(doc.activeElement, "Home");
      await settle(80);
      g.home = { checked: label(checked()), focused: label(doc.activeElement) };
      (first ?? radios()[0])?.click();
      await settle();
      out.radioGroups.push(g);
    }

    // Sort toggles ("Highest first. Switch to lowest first") and sortable table headers.
    const sorts = [...unit.querySelectorAll("button[aria-label]")].filter(
      (b) => visible(b) && /first/i.test(b.getAttribute("aria-label")),
    );
    out.sortToggles = [];
    for (const button of sorts) {
      const before = clean(button.getAttribute("aria-label"));
      button.click();
      await settle();
      const after = { label: clean(button.getAttribute("aria-label")), ...snap(unit) };
      button.click();
      await settle();
      out.sortToggles.push({ before, after, restored: clean(button.getAttribute("aria-label")) });
    }
    const headers = [...unit.querySelectorAll("th")].filter(
      (th) => visible(th) && (th.hasAttribute("aria-sort") || th.querySelector("button")),
    );
    out.tableSorts = [];
    for (const th of headers.slice(0, 3)) {
      const target = th.querySelector("button") ?? th;
      const states = [];
      for (let i = 0; i < 3; i++) {
        target.click();
        await settle();
        states.push({
          sort: clean(th.getAttribute("aria-sort")),
          firstRows: [...unit.querySelectorAll("tbody tr")].slice(0, 3).map((tr) => text(tr, 160)),
        });
      }
      out.tableSorts.push({ header: text(th, 60), states });
    }

    // Popover filters and menus: what opens, then Escape.
    const openers = [
      ...unit.querySelectorAll("button[aria-haspopup], button[aria-expanded]"),
    ].filter((b) => visible(b) && !sorts.includes(b));
    out.popovers = [];
    for (const button of openers.slice(0, 6)) {
      button.click();
      await settle(200);
      const opened = { label: clean(button.getAttribute("aria-label") || button.textContent) };
      opened.expanded = clean(button.getAttribute("aria-expanded"));
      opened.shown = popups();
      key(doc.activeElement ?? doc.body, "Escape");
      key(doc, "Escape");
      await settle(120);
      if (button.getAttribute("aria-expanded") === "true") {
        button.click();
        await settle(120);
      }
      opened.closed = clean(button.getAttribute("aria-expanded"));
      out.popovers.push(opened);
    }

    // Hover: the centre of each chart, and the first cells of grids and tables.
    out.hovers = [];
    const targets = [
      ...svgsOf(unit).filter((svg) => rect(svg).width > 60 && rect(svg).height > 40),
      ...[...unit.querySelectorAll("tbody td")].slice(1, 2),
      ...unit.querySelectorAll(sel("$funnel-step, $rank-row, $treemap-cell")),
    ].slice(0, 6);
    for (const target of targets) {
      const { clientX, clientY } = point(target);
      out.hovers.push({
        at: `${target.tagName.toLowerCase()}.${classes(target)}`,
        shown: await hoverAt(clientX, clientY),
      });
    }
    return out;
  };

  // ---- Measure ----
  const result = {
    scope: {
      content: { w: r1(content().width), h: r1(content().height) },
      dashboard: style(dashboard, ["padding", "gap", "display", "backgroundColor", "color"]),
    },
    units: {},
  };
  const counts = {};
  for (const unit of units) {
    // Scroll every container back to the top first: a sticky FilterBar's position depends on it,
    // and the preview scrolls an inner container where our host scrolls the window.
    for (let el = scope; el; el = el.parentElement) el.scrollTop = 0;
    win.scrollTo(0, 0);
    await settle(30);
    const kind = kindOf(unit);
    counts[kind] = (counts[kind] ?? 0) + 1;
    const title = unit.querySelector(sel("$card-title, $section-title"))?.textContent ?? "";
    const id = `${kind} ${counts[kind]}${title ? ` "${clean(title)}"` : ""}`;
    const data = {
      box: box(unit),
      classes: classes(unit),
      style: style(unit, STYLE),
      elements: elements(unit),
      svgs: svgsOf(unit).map((svg) => svgSummary(svg, rect(unit))),
    };
    data.interactions = await interact(unit);
    result.units[id] = data;
  }
  return result;
}
