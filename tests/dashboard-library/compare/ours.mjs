// Our side of the comparison (#230): serves host/ with Vite and renders each program the preview
// showed, at the preview's dashboard width and in the same theme, font and viewport, then runs the
// same measure.js. The library comes from its built package, as an app imports it.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { FONT, VIEWPORT } from "./his.mjs";

const measureSource = readFileSync(new URL("./measure.js", import.meta.url), "utf8");

export async function startHost() {
  const server = await createServer({
    root: fileURLToPath(new URL("./host/", import.meta.url)),
    configFile: false,
    logLevel: "error",
    server: { port: 0, host: "127.0.0.1" },
    resolve: {
      dedupe: ["react", "react-dom", "@openuidev/react-lang", "@openuidev/react-components"],
    },
    optimizeDeps: { include: ["react", "react-dom", "react-dom/client"] },
  });
  await server.listen();
  return server;
}

/** Measures every entry the preview side captured, in the same theme. */
export async function runOurs(
  browser,
  server,
  theme,
  previewEntries,
  previewStyles,
  log = () => {},
) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(server.resolvedUrls.local[0]);
  await page.waitForFunction(() => typeof window.__render === "function");
  await page.addStyleTag({ content: FONT });
  // The preview's page rules for its specimens, with the library's prefix swapped for ours.
  await page.addStyleTag({
    content: previewStyles.map((css) => css.replaceAll("pdk-", "openui-dashboard-")).join("\n"),
  });
  await page.evaluate(`${measureSource}\nwindow.__measureScope = measureScope;`);
  const entries = {};
  for (const [key, entry] of Object.entries(previewEntries)) {
    if (!entry.program || entry.error) continue;
    errors.length = 0;
    await page.evaluate((args) => window.__render(args), {
      program: entry.program,
      width: entry.width,
      theme,
      context: entry.context,
    });
    // Widen the host until our dashboard's content is as wide as the preview's, so cards are equal.
    await page.evaluate((target) => window.__fit(target), entry.content);
    await page.waitForTimeout(150);
    const measured = await page.evaluate(async () => {
      const scope = window.__scope();
      if (!scope) return { error: "no dashboard root" };
      const width = Math.round(scope.getBoundingClientRect().width * 10) / 10;
      return { width, ...(await window.__measureScope("openui-dashboard-", scope)) };
    });
    entries[key] = { page: entry.page, section: entry.section, combo: entry.combo, ...measured };
    if (errors.length) entries[key].consoleErrors = [...errors];
    log(`${theme}  ${key}  ${Object.keys(measured.units ?? {}).length} units`);
  }
  await context.close();
  return { entries };
}
