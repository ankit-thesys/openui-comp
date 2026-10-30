import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Browser, type Page } from "playwright";
import { build, preview } from "vite";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

export const FIXTURES = path.join(here, "fixtures");
export const HARNESS = path.join(here, "harness");

export type Program = { id: string; section: string; title: string; code: string };
export const programs: Program[] = JSON.parse(
  readFileSync(path.join(FIXTURES, "programs.json"), "utf8"),
);

export type Mode = {
  id: string;
  width: number;
  theme: "light" | "dark";
  host: "app" | "plain";
  /** The source mode this one is compared with. */
  baseline: string;
};

/**
 * `app` is a host set up like the source app: its CSS reset and a theme provider. `plain` has neither,
 * which is what the kit gets on a bare page, so it is only run on the kit and compared with the app.
 */
export const MODES: Mode[] = [
  { id: "light-1280", width: 1280, theme: "light", host: "app", baseline: "light-1280" },
  { id: "dark-1280", width: 1280, theme: "dark", host: "app", baseline: "dark-1280" },
  { id: "light-390", width: 390, theme: "light", host: "app", baseline: "light-390" },
  { id: "plain-1280", width: 1280, theme: "light", host: "plain", baseline: "light-1280" },
];
export const SOURCE_MODES = MODES.filter((mode) => mode.host === "app");

const PHOTO = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640"><rect width="960" height="640" fill="#7d93a8"/><circle cx="480" cy="320" r="160" fill="#c9d4de"/></svg>`;
const PIXEL = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN4+vjxfwAJFgPjZgoQ0QAAAABJRU5ErkJggg==";
const STUB_PHOTOS = ["/stub-photo.svg?a", "/stub-photo.svg?b", "/stub-photo.svg?c", "/stub-photo.svg?d"];

const json = (body: unknown) => ({
  status: 200,
  contentType: "application/json",
  body: JSON.stringify(body),
});

/** No test reaches the network. Everything outside the harness is answered here, the same for both sides. */
export async function isolate(page: Page) {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";

    if (local && url.pathname === "/stub-photo.svg") {
      return route.fulfill({ status: 200, contentType: "image/svg+xml", body: PHOTO });
    }
    if (local && url.pathname.startsWith("/api/")) {
      if (url.pathname === "/api/wiki") return route.fulfill(json({ photos: STUB_PHOTOS }));
      if (url.pathname === "/api/image-search") return route.fulfill(json({ images: STUB_PHOTOS }));
      if (url.pathname === "/api/street-route") {
        const points = (url.searchParams.get("coords") ?? "").split(";").map((pair) => {
          const [lng, lat] = pair.split(",").map(Number);
          return [lat, lng];
        });
        return route.fulfill(json({ points }));
      }
      return route.fulfill({ status: 404, body: "" });
    }
    if (local) return route.continue();

    const kind = route.request().resourceType();
    if (kind === "image") {
      return route.fulfill({ status: 200, contentType: "image/svg+xml", body: PHOTO });
    }
    if (url.hostname === "server.arcgisonline.com") {
      return route.fulfill({ status: 200, contentType: "image/png", body: Buffer.from(PIXEL, "base64") });
    }
    if (url.hostname === "tiles.openfreemap.org") {
      // A map with no features: the tile source resolves, and its tiles and glyphs are empty.
      if (url.pathname === "/planet") {
        return route.fulfill(json({ tilejson: "2.2.0", minzoom: 0, maxzoom: 14, tiles: ["https://tiles.openfreemap.org/planet/{z}/{x}/{y}.pbf"] }));
      }
      return route.fulfill({ status: 200, contentType: "application/x-protobuf", body: "" });
    }
    return route.abort();
  });
}

export async function launch(): Promise<Browser> {
  return chromium.launch({ args: ["--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader"] });
}

export const settle = (page: Page, ms = 350) => page.waitForTimeout(ms);

const NOW = new Date("2026-03-16T10:00:00Z");

/** `ticking` runs a clock the test can move forward. Otherwise the date stands still, so dates in a page match. */
export async function openHarness(browser: Browser, baseUrl: string, mode: Mode, ticking = false): Promise<Page> {
  const context = await browser.newContext({
    viewport: { width: mode.width, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: mode.theme,
    locale: "en-US",
    timezoneId: "UTC",
  });
  const page = await context.newPage();
  await isolate(page);
  if (ticking) await page.clock.install({ time: NOW });
  else await page.clock.setFixedTime(NOW);
  await page.addInitScript(`(() => {
    let seed = 42;
    Math.random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  })();`);
  await page.addInitScript({ path: path.join(here, "probe.browser.js") });
  await page.goto(`${baseUrl}/?host=${mode.host}`);
  await page.waitForFunction("window.__parity && window.__probe");
  await page.evaluate("document.fonts.load('16px Inter')");
  return page;
}

export async function mount(page: Page, program: Program, theme: Mode["theme"]) {
  await page.evaluate(
    ({ code, theme }) =>
      (window as unknown as { __parity: { mount: (c: string, t: string) => void } }).__parity.mount(code, theme),
    { code: program.code, theme },
  );
  await settle(page, /Map\(|Chart\(|HtmlView\(/.test(program.code) ? 900 : 350);
  // Pins are added once the map has loaded, which takes longer on a busy machine.
  if (/\bMap\(/.test(program.code)) {
    await page.waitForSelector(".maplibregl-marker", { timeout: 5000 }).catch(() => {});
    await settle(page, 300);
  }
}

export type Fingerprint = Awaited<ReturnType<typeof collect>>;
export const collect = (page: Page) =>
  page.evaluate("window.__probe.collect()") as Promise<{
    page: { width: number; height: number; overflowX: number };
    texts: {
      text: string;
      x: number;
      y: number;
      w: number;
      h: number;
      size: number;
      weight: number;
      color: string | null;
      italic: boolean;
      line: string;
    }[];
    controls: {
      role: string;
      name: string;
      x: number;
      y: number;
      w: number;
      h: number;
      bg: string | null;
      color: string | null;
      border: string | null;
      radius: number;
      state: string;
      href?: string;
    }[];
    media: { tag: string; x: number; y: number; w: number; h: number }[];
    surfaces: {
      x: number;
      y: number;
      w: number;
      h: number;
      bg: string | null;
      border: string | null;
      radius: number;
      shadow: boolean;
    }[];
    charts: { x: number; y: number; w: number; h: number; words: string[]; scrolls: boolean }[];
  }>;

export type Interaction = {
  role: string;
  name: string;
  /** Which of the controls with this role and name, in page order. */
  nth: number;
  added: string[];
  removed: string[];
  actions: unknown[];
  clipboard: string[];
  errors: string[];
  state: string;
};

const delta = (before: string[], after: string[]) => {
  const left = new Map<string, number>();
  for (const word of before) left.set(word, (left.get(word) ?? 0) + 1);
  const added: string[] = [];
  for (const word of after) {
    const count = left.get(word) ?? 0;
    if (count > 0) left.set(word, count - 1);
    else added.push(word);
  }
  const removed = [...left].flatMap(([word, count]) => Array<string>(count).fill(word));
  return { added: added.sort(), removed: removed.sort() };
};

const MAX_PER_PROGRAM = 30;

/**
 * Uses every control of a program once, each on a fresh render, and records what changed. Controls
 * that only differ by their value would repeat the same check, so each role and name is used once.
 */
export async function exercise(page: Page, program: Program): Promise<Interaction[]> {
  await mount(page, program, "light");
  const list = (await page.evaluate("window.__probe.controlList()")) as {
    role: string;
    name: string;
    tag: string;
    type: string;
    href: string;
    disabled: boolean;
  }[];
  const seen = new Map<string, number>();
  const out: Interaction[] = [];

  for (const control of list) {
    if (out.length >= MAX_PER_PROGRAM) break;
    const key = `${control.role}|${control.name}`;
    const nth = seen.get(key) ?? 0;
    seen.set(key, nth + 1);
    if (nth > 0 || control.disabled) continue;
    // Leaving the page isn't something to compare here; the link's target is checked by the fingerprint.
    if (control.role === "link" && control.href && !control.href.startsWith("#")) continue;

    await mount(page, program, "light");
    const before = (await page.evaluate("window.__probe.words()")) as string[];
    const index = (await page.evaluate(
      `window.__probe.indexOf(${JSON.stringify(control.role)}, ${JSON.stringify(control.name)}, ${nth})`,
    )) as number;
    if (index < 0) continue;
    const at = (await page.evaluate(`window.__probe.locate(${index})`)) as { x: number; y: number } | null;
    if (!at) continue;

    if (control.role === "slider") {
      await page.evaluate(`window.__probe.focus(${index})`);
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
    } else if (control.role === "textbox" || control.role === "spinbutton") {
      await page.mouse.click(at.x, at.y);
      await page.keyboard.type(control.role === "spinbutton" ? "42" : "Test 42");
    } else if (control.role === "combobox" && control.tag === "select") {
      await page.evaluate(`window.__probe.selectNext(${index})`);
    } else if (control.role === "combobox") {
      // A drawn dropdown: open it, then click the option after the chosen one, as a person would.
      await page.mouse.click(at.x, at.y);
      await settle(page, 200);
      const options = page.getByRole("option");
      const count = await options.count();
      let chosen = 0;
      for (let item = 0; item < count; item++) {
        if ((await options.nth(item).getAttribute("aria-selected")) === "true") chosen = item;
      }
      if (count > 0) await options.nth((chosen + 1) % count).click();
    } else {
      await page.mouse.click(at.x, at.y);
    }
    await settle(page, 250);

    const after = (await page.evaluate("window.__probe.words()")) as string[];
    const bridge = (await page.evaluate(
      "({ actions: window.__parity.actions, clipboard: window.__parity.clipboard, errors: window.__parity.errors })",
    )) as { actions: unknown[]; clipboard: string[]; errors: string[] };
    const state = (await page.evaluate(`window.__probe.stateOf(${index})`)) as {
      state: string;
      value: string;
    } | null;
    out.push({
      role: control.role,
      name: control.name,
      nth,
      ...delta(before, after),
      ...bridge,
      state: state?.state ?? "gone",
    });
  }
  return out;
}

type Step =
  | { click: [role: string, name: string] }
  | { type: [role: string, name: string, text: string] }
  | { advance: number };
export type Flow = { id: string; program: string; steps: Step[] };
export type FlowResult = { step: string; added: string[]; removed: string[]; actions: unknown[]; errors: string[] };

/** Sequences a single click can't check: state carried from one step to the next. */
export const FLOWS: Flow[] = [
  {
    id: "form-submit",
    program: "inputs",
    steps: [
      { type: ["textbox", "Name", "Ada"] },
      { click: ["radio", "Cold / rainy"] },
      { type: ["textbox", "Anything else?", "Window seat"] },
      { click: ["button", "Customize my trip"] },
    ],
  },
  {
    id: "checklist-count",
    program: "checklist",
    steps: [
      { click: ["checkbox", "Relaxed Oxford shirt"] },
      { click: ["checkbox", "Everywhere tote"] },
      { click: ["checkbox", "The everyday tee"] },
      { click: ["button", "Clear"] },
    ],
  },
  {
    id: "timer-runs",
    program: "timer",
    steps: [
      { click: ["button", "Green · 2 min"] },
      { click: ["button", "Start"] },
      { advance: 3000 },
      { click: ["button", "Pause"] },
      { advance: 3000 },
      { click: ["button", "Reset"] },
    ],
  },
];

export async function runFlow(browser: Browser, url: string, flow: Flow): Promise<FlowResult[]> {
  const page = await openHarness(browser, url, MODES[0]!, true);
  const program = programs.find((item) => item.id === flow.program)!;
  await mount(page, program, "light");
  const before = (await page.evaluate("window.__probe.words()")) as string[];
  const out: FlowResult[] = [];
  for (const step of flow.steps) {
    let label: string;
    if ("advance" in step) {
      label = `wait ${step.advance}ms`;
      await page.clock.runFor(step.advance);
    } else {
      const [role, name, text] = "click" in step ? [...step.click, undefined] : step.type;
      label = `${"click" in step ? "click" : "type in"} ${role} ${name}`;
      const list = (await page.evaluate("window.__probe.controlList()")) as { role: string; name: string }[];
      // A name can carry a current value, so a prefix is enough to find the control.
      const index = list.findIndex((item) => item.role === role && item.name.startsWith(name));
      if (index < 0) {
        out.push({ step: label, added: [], removed: [], actions: [], errors: ["control not found"] });
        continue;
      }
      const at = (await page.evaluate(`window.__probe.locate(${index})`)) as { x: number; y: number };
      await page.mouse.click(at.x, at.y);
      if (text) await page.keyboard.type(text);
    }
    await settle(page, 250);
    const after = (await page.evaluate("window.__probe.words()")) as string[];
    const bridge = (await page.evaluate("({ actions: window.__parity.actions, errors: window.__parity.errors })")) as {
      actions: unknown[];
      errors: string[];
    };
    out.push({ step: label, ...delta(before, after), ...bridge });
  }
  await page.context().close();
  return out;
}

/** Builds a harness and serves it. `root` holds index.html, `target` the library to load. */
export async function serveHarness(root: string, target: string, outDir: string) {
  const shared = {
    root,
    configFile: false as const,
    logLevel: "error" as const,
    publicDir: path.join(root, "public"),
    define: { "process.env": "{}" },
    esbuild: { jsx: "automatic" as const },
    resolve: { alias: { "parity-target": target } },
  };
  await build({
    ...shared,
    build: { outDir, emptyOutDir: true, minify: false, sourcemap: false, chunkSizeWarningLimit: 100000 },
  });
  const server = await preview({ ...shared, build: { outDir }, preview: { port: 0, host: "127.0.0.1" } });
  const address = server.httpServer.address();
  const port = typeof address === "object" && address ? address.port : 0;
  return { url: `http://127.0.0.1:${port}`, close: () => server.close() };
}

export async function captureTarget(url: string, options: { modes?: Mode[]; screenshots?: string } = {}) {
  const browser = await launch();
  const visual: Record<string, Record<string, Fingerprint>> = {};
  const errors: Record<string, string[]> = {};
  for (const mode of options.modes ?? MODES) {
    const page = await openHarness(browser, url, mode);
    for (const program of programs) {
      await mount(page, program, mode.theme);
      (visual[program.id] ??= {})[mode.id] = await collect(page);
      const found = (await page.evaluate("window.__parity.errors")) as string[];
      if (found.length) errors[program.id] = found;
      if (options.screenshots) {
        mkdirSync(options.screenshots, { recursive: true });
        await page.screenshot({
          path: path.join(options.screenshots, `${program.id}--${mode.id}.png`),
          fullPage: true,
          animations: "disabled",
        });
      }
    }
    await page.context().close();
  }
  const page = await openHarness(browser, url, MODES[0]!);
  const functional: Record<string, Interaction[]> = {};
  for (const program of programs) functional[program.id] = await exercise(page, program);
  const spec = await page.evaluate("window.__parity.spec()");
  await page.context().close();
  const flows: Record<string, FlowResult[]> = {};
  for (const flow of FLOWS) flows[flow.id] = await runFlow(browser, url, flow);
  await browser.close();
  return { visual, functional, flows, errors, spec };
}

export const writeJson = (file: string, value: unknown) =>
  writeFileSync(file, `${JSON.stringify(value)}\n`);

export { require };
