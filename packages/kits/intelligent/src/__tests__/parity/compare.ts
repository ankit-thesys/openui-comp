import type { Fingerprint, FlowResult, Interaction } from "./driver.ts";

export type Difference = {
  program: string;
  /** A mode id, or "functional" for what a control does. */
  mode: string;
  kind: string;
  /** What it is about: the text, or the control's role and name. */
  subject: string;
  source: unknown;
  kit: unknown;
};

/** Small enough that nobody would see them, and they absorb text measuring differently across machines. */
const POSITION = 6;
const SIZE = 4;
const FONT_SIZE = 0.5;
const WEIGHT = 50;
const RADIUS = 2;
const COLOR = 10;

const channels = (hex: string | null): number[] | null => {
  if (!hex) return null;
  const n = (from: number) => parseInt(hex.slice(from, from + 2), 16);
  return [n(0), n(2), n(4), hex.length > 6 ? n(6) : 255];
};

export function colorDistance(a: string | null, b: string | null): number {
  const left = channels(a);
  const right = channels(b);
  if (!left && !right) return 0;
  if (!left || !right) return 255;
  return Math.max(...left.map((value, index) => Math.abs(value - right[index]!)));
}

const words = (list: { text: string }[]) => list.flatMap((item) => item.text.split(" ")).filter(Boolean);

function multisetDifference(a: string[], b: string[]) {
  const counts = new Map<string, number>();
  for (const word of b) counts.set(word, (counts.get(word) ?? 0) + 1);
  const out: string[] = [];
  for (const word of a) {
    const count = counts.get(word) ?? 0;
    if (count > 0) counts.set(word, count - 1);
    else out.push(word);
  }
  return out;
}

/** Pairs items by a key, in page order, so repeated labels line up with each other. */
function pairUp<T>(source: T[], kit: T[], key: (item: T) => string) {
  const queues = new Map<string, T[]>();
  for (const item of kit) {
    const name = key(item);
    (queues.get(name) ?? queues.set(name, []).get(name)!).push(item);
  }
  const pairs: [T, T][] = [];
  const onlySource: T[] = [];
  for (const item of source) {
    const match = queues.get(key(item))?.shift();
    if (match) pairs.push([item, match]);
    else onlySource.push(item);
  }
  return { pairs, onlySource, onlyKit: [...queues.values()].flat() };
}

/** Controls that draw no box of their own in one version: a hidden native input over a drawn box. */
const isHiddenInput = (control: Fingerprint["controls"][number]) =>
  (control.role === "checkbox" || control.role === "radio" || control.role === "slider") &&
  (control.w <= 1 || control.h <= 1);

/** A corner can't look rounder than half the box: 50 and 9999 on a short pill are the same pill. */
const rounded = (box: { radius: number; w: number; h: number }) => Math.min(box.radius, box.w / 2, box.h / 2);

const isNumeric = (word: string) => /\d/.test(word);

function compareCharts(source: Fingerprint["charts"], kit: Fingerprint["charts"], add: (kind: string, subject: string, from: unknown, to: unknown) => void) {
  if (source.length !== kit.length) add("chart-count", "chart", source.length, kit.length);
  source.forEach((a, index) => {
    const b = kit[index];
    if (!b) return;
    const subject = `chart ${index + 1}`;
    if (Math.abs(a.w - b.w) > SIZE) add("chart-width", subject, a.w, b.w);
    if (Math.abs(a.h - b.h) > SIZE) add("chart-height", subject, a.h, b.h);
    if (b.scrolls && !a.scrolls) add("chart-scrolls", subject, false, true);
    // Labels are the words: legends and categories. Ticks depend on the chart's scale, so only their format counts.
    const labels = (list: string[]) => list.filter((word) => !isNumeric(word));
    for (const word of new Set(multisetDifference(labels(a.words), labels(b.words)))) add("chart-label-missing", word, word, null);
    const marked = (list: string[], mark: RegExp) => list.some((word) => isNumeric(word) && mark.test(word));
    if (marked(a.words, /[$€£]/) && !marked(b.words, /[$€£]/)) add("chart-no-currency", subject, a.words.filter(isNumeric).slice(0, 4), b.words.filter(isNumeric).slice(0, 4));
  });
}

export function compareVisual(program: string, mode: string, source: Fingerprint, kit: Fingerprint) {
  const out: Difference[] = [];
  const add = (kind: string, subject: string, from: unknown, to: unknown) =>
    out.push({ program, mode, kind, subject, source: from, kit: to });

  compareCharts(source.charts, kit.charts, add);

  const heightLimit = Math.max(12, source.page.height * 0.02);
  if (Math.abs(source.page.height - kit.page.height) > heightLimit) {
    add("page-height", "page", source.page.height, kit.page.height);
  }
  if (kit.page.overflowX > source.page.overflowX + 1) {
    add("page-overflow", "page", source.page.overflowX, kit.page.overflowX);
  }

  // Content first: every word the source shows should be on the page, however the markup splits it.
  const sourceWords = words(source.texts);
  const kitWords = words(kit.texts);
  for (const word of multisetDifference(sourceWords, kitWords)) add("text-missing", word, word, null);
  for (const word of multisetDifference(kitWords, sourceWords)) add("text-extra", word, null, word);

  const text = pairUp(source.texts, kit.texts, (item) => item.text);
  for (const [a, b] of text.pairs) {
    const subject = a.text.slice(0, 60);
    if (Math.abs(a.size - b.size) > FONT_SIZE) add("text-size", subject, a.size, b.size);
    if (Math.abs(a.weight - b.weight) >= WEIGHT) add("text-weight", subject, a.weight, b.weight);
    if (colorDistance(a.color, b.color) > COLOR) add("text-color", subject, a.color, b.color);
    if (a.italic !== b.italic) add("text-italic", subject, a.italic, b.italic);
    if (a.line !== b.line) add("text-decoration", subject, a.line, b.line);
    // Only sideways: one taller element moves everything below it, and page-height reports that once.
    if (Math.abs(a.x - b.x) > POSITION) add("text-position", subject, [a.x, a.y], [b.x, b.y]);
  }

  const controlKey = (item: Fingerprint["controls"][number]) => `${item.role}|${item.name}`;
  const controls = pairUp(
    source.controls.filter((item) => !isHiddenInput(item)),
    kit.controls.filter((item) => !isHiddenInput(item)),
    controlKey,
  );
  for (const item of controls.onlySource) add("control-missing", controlKey(item), controlKey(item), null);
  for (const item of controls.onlyKit) add("control-extra", controlKey(item), null, controlKey(item));
  for (const [a, b] of controls.pairs) {
    const subject = controlKey(a);
    if (Math.abs(a.w - b.w) > SIZE || Math.abs(a.h - b.h) > SIZE) {
      add("control-size", subject, [a.w, a.h], [b.w, b.h]);
    }
    if (Math.abs(a.x - b.x) > POSITION) add("control-position", subject, [a.x, a.y], [b.x, b.y]);
    if (colorDistance(a.bg, b.bg) > COLOR) add("control-fill", subject, a.bg, b.bg);
    if (colorDistance(a.color, b.color) > COLOR) add("control-text-color", subject, a.color, b.color);
    if (colorDistance(a.border, b.border) > COLOR) add("control-border", subject, a.border, b.border);
    if (Math.abs(rounded(a) - rounded(b)) > RADIUS) add("control-radius", subject, a.radius, b.radius);
    if (a.state !== b.state) add("control-state", subject, a.state, b.state);
    if ((a.href ?? "") !== (b.href ?? "")) add("control-href", subject, a.href, b.href);
  }

  const media = pairUp(source.media, kit.media, (item) => item.tag);
  for (const item of media.onlySource) add("media-missing", item.tag, [item.w, item.h], null);
  for (const item of media.onlyKit) add("media-extra", item.tag, null, [item.w, item.h]);
  for (const [a, b] of media.pairs) {
    if (Math.abs(a.w - b.w) > SIZE || Math.abs(a.h - b.h) > SIZE) {
      add("media-size", a.tag, [a.w, a.h], [b.w, b.h]);
    }
    if (Math.abs(a.x - b.x) > POSITION) add("media-position", a.tag, [a.x, a.y], [b.x, b.y]);
  }

  // Surfaces have no name, so each one takes the next box in the same column of about the same size.
  const remaining = [...kit.surfaces];
  for (const a of source.surfaces) {
    const index = remaining.findIndex(
      (b) => Math.abs(a.x - b.x) <= POSITION && Math.abs(a.w - b.w) <= SIZE,
    );
    const subject = `${a.w}x${a.h}`;
    if (index < 0) {
      add("surface-missing", subject, { ...a }, null);
      continue;
    }
    const [b] = remaining.splice(index, 1);
    if (colorDistance(a.bg, b!.bg) > COLOR) add("surface-fill", subject, a.bg, b!.bg);
    if (colorDistance(a.border, b!.border) > COLOR) add("surface-border", subject, a.border, b!.border);
    if (Math.abs(rounded(a) - rounded(b!)) > RADIUS) add("surface-radius", subject, a.radius, b!.radius);
    if (a.shadow !== b!.shadow) add("surface-shadow", subject, a.shadow, b!.shadow);
  }
  for (const b of remaining) add("surface-extra", `${b.w}x${b.h}`, null, { ...b });

  return out;
}

const sameList = (a: string[], b: string[]) => JSON.stringify(a) === JSON.stringify(b);

export function compareFunctional(program: string, source: Interaction[], kit: Interaction[]) {
  const out: Difference[] = [];
  const add = (kind: string, subject: string, from: unknown, to: unknown) =>
    out.push({ program, mode: "functional", kind, subject, source: from, kit: to });
  const key = (item: Interaction) => `${item.role}|${item.name}`;
  const { pairs, onlySource, onlyKit } = pairUp(source, kit, key);
  for (const item of onlySource) add("use-missing", key(item), key(item), null);
  for (const item of onlyKit) add("use-extra", key(item), null, key(item));
  for (const [a, b] of pairs) {
    const subject = key(a);
    if (!sameList(a.added, b.added) || !sameList(a.removed, b.removed)) {
      add("use-result", subject, { added: a.added, removed: a.removed }, { added: b.added, removed: b.removed });
    }
    if (JSON.stringify(a.actions) !== JSON.stringify(b.actions)) add("use-action", subject, a.actions, b.actions);
    if (!sameList(a.clipboard, b.clipboard)) add("use-clipboard", subject, a.clipboard, b.clipboard);
    if (!sameList(a.errors, b.errors)) add("use-errors", subject, a.errors, b.errors);
    if (a.state !== b.state) add("use-state", subject, a.state, b.state);
  }
  return out;
}

export function compareFlow(flow: string, source: FlowResult[], kit: FlowResult[]) {
  const out: Difference[] = [];
  source.forEach((a, index) => {
    const b = kit[index]!;
    const add = (kind: string, from: unknown, to: unknown) =>
      out.push({ program: flow, mode: "flow", kind, subject: a.step, source: from, kit: to });
    if (!sameList(a.added, b.added) || !sameList(a.removed, b.removed)) {
      add("flow-result", { added: a.added, removed: a.removed }, { added: b.added, removed: b.removed });
    }
    if (JSON.stringify(a.actions) !== JSON.stringify(b.actions)) add("flow-action", a.actions, b.actions);
    if (!sameList(a.errors, b.errors)) add("flow-errors", a.errors, b.errors);
  });
  return out;
}

/** Union encodings aside, the two specs should say the same thing. Returns where they don't. */
export function compareSpec(source: unknown, kit: unknown) {
  const out: { path: string; source: unknown; kit: unknown }[] = [];
  const walk = (a: unknown, b: unknown, at: string) => {
    if (a && b && typeof a === "object" && typeof b === "object" && !Array.isArray(a) && !Array.isArray(b)) {
      const left = a as Record<string, unknown>;
      const right = b as Record<string, unknown>;
      // zod 4.6 writes a union as {type: [...]}, zod 4.4 as {anyOf: [{type}, ...]}.
      if (Array.isArray(left["type"]) && Array.isArray(right["anyOf"]) && !("type" in right)) {
        const same = (left["type"] as string[]).map((type) => JSON.stringify({ type })).sort();
        const other = (right["anyOf"] as unknown[]).map((item) => JSON.stringify(item)).sort();
        if (JSON.stringify(same) === JSON.stringify(other)) return;
      }
      for (const name of new Set([...Object.keys(left), ...Object.keys(right)])) {
        if (!(name in right)) out.push({ path: `${at}/${name}`, source: left[name], kit: undefined });
        else if (!(name in left)) out.push({ path: `${at}/${name}`, source: undefined, kit: right[name] });
        else walk(left[name], right[name], `${at}/${name}`);
      }
      return;
    }
    if (JSON.stringify(a) !== JSON.stringify(b)) out.push({ path: at, source: a, kit: b });
  };
  walk(source, kit, "");
  return out;
}
