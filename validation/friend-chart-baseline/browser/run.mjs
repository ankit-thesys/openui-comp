#!/usr/bin/env node
/**
 * The chart baseline's browser runner.
 *
 *   node validation/friend-chart-baseline/browser/run.mjs
 *
 * One command: launches headless Chrome over the DevTools Protocol, drives the
 * Vite fixture with REAL mouse input, asserts the results, writes
 * evidence, and exits non-zero with an actionable summary if any scenario
 * failed, errored, or did not run.
 *
 * Zero new dependencies: there is no Playwright, Puppeteer, @vitest/browser or
 * webdriverio in this workspace's lockfile and this ticket forbids unproposed
 * dependency changes. Node 24's global WebSocket plus CDP's JSON-RPC is enough
 * (see browser/cdp.mjs).
 *
 * Flags:
 *   --base-url <url>   use an already-running fixture server (default: spawn one)
 *   --keep-open        leave Chrome running for inspection
 *   --only <a,b>       run a subset of scenario groups: legend,container,dark
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromeVersion, launch, sleep, waitFor } from "./cdp.mjs";
import {
  ALL_FAMILIES,
  CONTAINER_GEOMETRY,
  hoverHighlight,
  legendToggle,
  legendToggleUnsupported,
} from "./scenarios.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const BASELINE_DIR = resolve(HERE, "..");
const REPO_ROOT = resolve(BASELINE_DIR, "../..");
const EVIDENCE = resolve(BASELINE_DIR, "evidence/browser");
const SHOTS = resolve(BASELINE_DIR, "evidence/screenshots/dark");

const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(name);
  return i === -1 ? undefined : (argv[i + 1] ?? true);
};
const groups = String(flag("--only") ?? "legend,container,dark").split(",");

const validGroups = new Set(["legend", "container", "dark"]);
if (groups.some((group) => !validGroups.has(group)) || new Set(groups).size !== groups.length) {
  console.error("--only must contain unique groups from: legend,container,dark");
  process.exit(1);
}

const PORT = 5199;
const BASE_URL = flag("--base-url") ?? `http://localhost:${PORT}`;
const VIEWPORT = { width: 1280, height: 900 };

/** Families whose legend toggle is wired, and the selector of the real control. */
const TOGGLE_SUPPORTED = {
  PieChart: ".openui-stacked-legend__item",
  RadialChart: ".openui-stacked-legend__item",
};

/**
 * Families with no legend visibility toggle, with the source that says so.
 * Recorded as "unsupported", never as a gap, and demonstrated by clicking the
 * real legend row and observing that nothing changes.
 */
const TOGGLE_UNSUPPORTED = {
  SegmentedBar: {
    control: ".openui-chart-legend-item",
    citation:
      "packages/react-ui/src/components/Charts/SegmentedBar/SegmentedBar.tsx:28 — " +
      '"no legend visibility toggle (openui only hover-highlights)". DefaultLegend ' +
      "is rendered without onItemClick/hiddenSeries (0 occurrences in that file), " +
      "so no toggle handler exists to fire.",
  },
  SingleStackedBar: {
    control: ".openui-chart-legend-item",
    citation:
      "Same component as SegmentedBar (SegmentedBar/SingleStackedBar.tsx wraps it); " +
      "see SegmentedBar.tsx:28.",
  },
};

const results = [];
const record = (r) => {
  results.push(r);
  const mark = { verified: "ok  ", unsupported: "n/a ", failed: "FAIL" }[r.status] ?? "????";
  const label = `${r.scenario}/${r.family ?? "-"}`;
  console.log(`  [${mark}] ${label}${r.detail ? ` — ${r.detail}` : ""}`);
  return r;
};

async function startFixtureServer() {
  console.log("• starting the Vite fixture server");
  const proc = spawn(
    "pnpm",
    [
      "--dir",
      "packages/react-ui",
      "exec",
      "vite",
      "--config",
      "../../validation/friend-chart-baseline/vite.config.ts",
    ],
    { cwd: REPO_ROOT, stdio: "ignore", detached: true },
  );
  await waitFor(
    async () => {
      const res = await fetch(`${BASE_URL}/`).catch(() => null);
      return res?.ok;
    },
    { what: "the fixture server", timeout: 60000 },
  );
  return proc;
}

async function runLegendScenarios(b) {
  console.log("\n• legend toggles (the four families PR #22 left untested)");
  const families = [...Object.keys(TOGGLE_SUPPORTED), ...Object.keys(TOGGLE_UNSUPPORTED)];
  await b.goto(`${BASE_URL}/?theme=light&only=${families.join(",")}`);
  await waitFor(async () => b.evaluate("!!document.querySelector('[data-fixture-ready]')"), {
    what: "the fixture to mount",
  });
  await sleep(700);

  for (const [family, control] of Object.entries(TOGGLE_SUPPORTED)) {
    record(await legendToggle(b, family, control));
  }
  for (const [family, { control, citation }] of Object.entries(TOGGLE_UNSUPPORTED)) {
    record(await legendToggleUnsupported(b, family, control, citation));
    // The interaction these families DO support.
    record(await hoverHighlight(b, family, ".openui-segmented-bar-segment"));
  }
}

/**
 * How each family is expected to answer a container resize.
 *
 * Not every family widens, and the ones that do not are not all the same kind
 * of "no". Each entry below names the mechanism and cites the source, so a
 * non-growing family is a classified behaviour rather than an unexplained gap.
 * Anything NOT listed here is expected to widen with the container.
 */
const CONTAINER_EXPECTATIONS = {
  PieChart: {
    kind: "capped-by-default-legend",
    diagnostic: "PieChart__defaultLegend",
    citation:
      'Pie/Radial default to legendVariant="stacked" (PieChart/types.ts). That wrapper ' +
      "caps the chart column's height, so chartSize in " +
      "hooks/polar/useCategoricalChartOrchestrator.ts:89-91 stops growing. The same " +
      'family with legendVariant="default" does scale — see the diagnostic case.',
  },
  RadialChart: {
    kind: "capped-by-default-legend",
    diagnostic: "RadialChart__defaultLegend",
    citation: "As PieChart; both go through useCategoricalChartOrchestrator.",
  },
  MiniBarChart: {
    kind: "fixed-marks",
    citation:
      "MINI_BAR_WIDTH = 8 and MINI_BAR_SPACING = 10 are fixed pixels " +
      "(shared/mini/miniChartUtils.ts:35-36), and miniBarsLeftPadding right-aligns the " +
      "bars (:50-51). The svg follows the container; extra width becomes empty space " +
      "rather than wider bars. recentBarsThatFit (:41-47) instead drops the oldest " +
      "bars as the box narrows, which is asserted below.",
  },
};

/**
 * Container-driven resize for all 19 families.
 *
 * Strictly separate from the explicit size-prop checks in
 * tests/size-props.baseline.test.tsx: here the chart is given a height and NO
 * width, so width must be MEASURED from the surrounding box through a real
 * ResizeObserver.
 *
 * BOTH dimensions are varied. A width-only sweep reports the square families
 * (Radar, and the polar ones) as unresponsive when they are simply bound by
 * the smaller dimension — Radar draws 173px wide at 360x300 and 303px at
 * 900x760, so width alone would have been a false negative.
 */
async function runContainerScenarios(b) {
  console.log("\n• container-driven resize (all 19 families, two stable container sizes)");
  const SIZES = [
    { width: 360, height: 300 },
    { width: 900, height: 760 },
  ];
  const key = (s) => `${s.width}x${s.height}`;
  const measured = {};
  const probes = [...ALL_FAMILIES, "PieChart__defaultLegend", "RadialChart__defaultLegend"];

  const first = SIZES[0];
  await b.goto(
    `${BASE_URL}/container.html?theme=light&width=${first.width}&height=${first.height}`,
  );
  await waitFor(async () => b.evaluate("!!document.querySelector('[data-container-ready]')"), {
    what: "the container fixture to mount",
  });
  await sleep(900);
  // Keep a DOM identity sentinel: a navigation/remount would invalidate the
  // evidence that the ResizeObserver update path was exercised.
  await b.evaluate(
    "window.__resizeSentinel = document.querySelector('[data-chart-slot] svg'); true",
  );
  for (const size of SIZES) {
    await b.run(
      `(size) => window.dispatchEvent(new CustomEvent('chart-baseline-resize', { detail: size }))`,
      size,
    );
    await waitFor(
      async () =>
        b.evaluate(
          `document.querySelector('[data-container-ready]').dataset.containerWidth === '${size.width}'`,
        ),
      {
        what: `the mounted container to resize to ${key(size)}`,
      },
    );
    await sleep(900);
    if (
      !(await b.evaluate(
        "window.__resizeSentinel === document.querySelector('[data-chart-slot] svg')",
      ))
    ) {
      throw new Error(
        "Container resize remounted a chart; live ResizeObserver evidence is invalid",
      );
    }
    for (const family of probes) {
      (measured[family] ??= {})[key(size)] = await b.run(CONTAINER_GEOMETRY, family);
    }
  }

  // Eight bars fit at 360px and 900px. A genuinely constrained third size is
  // required to observe the documented drop-oldest behavior.
  await b.run(
    `() => window.dispatchEvent(new CustomEvent('chart-baseline-resize', { detail: { width: 80, height: 300 } }))`,
  );
  await sleep(900);
  const miniConstrained = await b.run(CONTAINER_GEOMETRY, "MiniBarChart");

  const small = (f) => measured[f]?.[key(SIZES[0])];
  const large = (f) => measured[f]?.[key(SIZES[1])];

  for (const family of ALL_FAMILIES) {
    const s = small(family);
    const l = large(family);
    if (!s || !l) {
      record({
        family,
        scenario: "container-resize",
        status: "failed",
        detail: "family did not render in the container fixture",
      });
      continue;
    }
    if (s.markCount === 0 || l.markCount === 0) {
      record({
        family,
        scenario: "container-resize",
        status: "failed",
        detail: `drew no marks (${s.markCount} at ${key(SIZES[0])}, ${l.markCount} at ${key(SIZES[1])})`,
        small: s,
        large: l,
      });
      continue;
    }

    const expectation = CONTAINER_EXPECTATIONS[family];
    const grew = l.drawnWidth > s.drawnWidth;
    const base = {
      family,
      scenario: "container-resize",
      sizes: SIZES,
      liveResize: true,
      small: s,
      large: l,
      // Reported for every family, not only failures: DEFECT-001 is an
      // overflow that does not stop the chart from widening.
      overflowAtSmall: s.overflowRightPx,
      overflowAtLarge: l.overflowRightPx,
    };

    if (!expectation) {
      record({
        ...base,
        kind: "width-responsive",
        status: grew ? "verified" : "failed",
        detail: grew
          ? undefined
          : `drawn width did not follow the container (${s.drawnWidth} -> ${l.drawnWidth})`,
      });
      continue;
    }

    if (expectation.kind === "capped-by-default-legend") {
      // Two facts, asserted together: the default configuration does NOT grow,
      // and the same family with legendVariant="default" DOES. The second is
      // what makes the first a wrapper cap rather than "this chart ignores its
      // container".
      const ds = small(expectation.diagnostic);
      const dl = large(expectation.diagnostic);
      const diagnosticGrew = Boolean(ds && dl && dl.drawnWidth > ds.drawnWidth);
      const asExpected = !grew && diagnosticGrew;
      record({
        ...base,
        kind: expectation.kind,
        status: asExpected ? "unsupported" : "failed",
        citation: expectation.citation,
        diagnostic: { case: expectation.diagnostic, small: ds, large: dl, grew: diagnosticGrew },
        detail: asExpected
          ? `does not scale with its default stacked legend (${s.drawnWidth}px at both sizes); ` +
            `the same chart with legendVariant="default" scales ${ds.drawnWidth} -> ${dl.drawnWidth}`
          : grew
            ? "expected the stacked-legend wrapper to cap this, but it grew"
            : 'neither the default nor the legendVariant="default" case grew',
      });
      continue;
    }

    if (expectation.kind === "fixed-marks") {
      // The svg must follow the container even though the marks do not, and a
      // narrower box must show FEWER bars.
      const svgGrew = l.widestSvgWidth > s.widestSvgWidth;
      const marksFixed = l.drawnWidth === s.drawnWidth;
      const fewerWhenNarrow = Boolean(
        miniConstrained && miniConstrained.markCount > 0 && miniConstrained.markCount < s.markCount,
      );
      const asExpected = svgGrew && marksFixed && fewerWhenNarrow;
      record({
        ...base,
        kind: expectation.kind,
        status: asExpected ? "unsupported" : "failed",
        citation: expectation.citation,
        svgGrew,
        marksFixed,
        markCounts: { small: s.markCount, large: l.markCount },
        fewerWhenNarrow,
        constrained: miniConstrained,
        detail: asExpected
          ? `svg follows the container (${s.widestSvgWidth} -> ${l.widestSvgWidth}) but the ` +
            `bars are a fixed 8px at 10px spacing, so drawn width stays ${s.drawnWidth}px`
          : `expected a responsive svg with fixed marks, got svgGrew=${svgGrew} marksFixed=${marksFixed} fewerWhenNarrow=${fewerWhenNarrow}`,
      });
      continue;
    }
  }
}

/** Dark reference images for all 19 families. */
async function runDarkScenarios(b) {
  console.log("\n• dark reference images (all 19 families)");
  mkdirSync(SHOTS, { recursive: true });
  await b.setColorScheme("dark");

  for (const family of ALL_FAMILIES) {
    try {
      await b.goto(`${BASE_URL}/?theme=dark&only=${family}`);
      await waitFor(async () => b.evaluate("!!document.querySelector('[data-fixture-ready]')"), {
        what: `${family} to mount in dark mode`,
      });
      await sleep(500);

      const drew = await b.run(
        `(f) => {
          const card = [...document.querySelectorAll('[data-family]')].find(
            (c) => c.dataset['family'] === f,
          );
          if (!card) return 0;
          return card.querySelectorAll('path,rect,circle,polygon,div.openui-segmented-bar-segment').length;
        }`,
        family,
      );
      if (!drew) {
        record({
          family,
          scenario: "dark-reference",
          status: "failed",
          detail: "rendered no marks in dark mode; no image captured",
        });
        continue;
      }

      const png = await b.screenshot();
      const file = `${family}.png`;
      writeFileSync(resolve(SHOTS, file), png);
      record({
        family,
        scenario: "dark-reference",
        status: "verified",
        image: `evidence/screenshots/dark/${file}`,
        bytes: png.length,
        markCount: drew,
        // Stated on every entry so no reader mistakes these for assertions.
        note: "reference image only — no automated comparison is performed",
      });
    } catch (err) {
      record({
        family,
        scenario: "dark-reference",
        status: "failed",
        detail: `capture threw: ${err.message}`,
      });
    }
  }
  // Cosmetic only — the browser is closed immediately after, so a failure here
  // must not discard a complete run's results.
  try {
    await b.setColorScheme("light");
  } catch (err) {
    console.log(`  [warn] could not reset the colour scheme: ${err.message}`);
  }
}

async function main() {
  const started = Date.now();
  let server;
  let browser;
  try {
    if (!flag("--base-url")) server = await startFixtureServer();

    const version = await chromeVersion();
    console.log(`• ${version} (headless), node ${process.version}`);
    // No fixed debug port: see freePort() in cdp.mjs.
    browser = await launch({ ...VIEWPORT });
    await browser.setViewport(VIEWPORT.width, VIEWPORT.height);

    // Prove the input is genuine browser input, not synthetic dispatch. If this
    // ever regresses, every interaction result below is worth less, so it runs
    // first and is recorded as a scenario in its own right.
    await browser.goto(`${BASE_URL}/?theme=light&only=BarChart`);
    await sleep(600);
    await browser.evaluate(
      "window.__trusted = null; document.addEventListener('click', (e) => { window.__trusted = e.isTrusted; }, { once: true, capture: true });",
    );
    const h2 = await browser.centreOf('[data-family="BarChart"] h2');
    if (h2) await browser.click(h2.x, h2.y);
    await sleep(200);
    const isTrusted = await browser.evaluate("window.__trusted");
    record({
      family: null,
      scenario: "trusted-input",
      status: isTrusted === true ? "verified" : "failed",
      isTrusted,
      detail:
        isTrusted === true
          ? "Input.dispatchMouseEvent produced event.isTrusted === true"
          : `expected a trusted event, got ${JSON.stringify(isTrusted)}`,
    });

    if (groups.includes("legend")) await runLegendScenarios(browser);
    if (groups.includes("container")) await runContainerScenarios(browser);
    if (groups.includes("dark")) await runDarkScenarios(browser);

    // --- summarise -------------------------------------------------------
    const counts = results.reduce((a, r) => ({ ...a, [r.status]: (a[r.status] ?? 0) + 1 }), {});
    const failures = results.filter((r) => r.status === "failed");

    // Coverage completeness: every family must appear in the groups that ran.
    const missing = [];
    const expect = (scenario, families) => {
      const seen = new Set(results.filter((r) => r.scenario === scenario).map((r) => r.family));
      for (const f of families) if (!seen.has(f)) missing.push(`${scenario}/${f}`);
    };
    if (groups.includes("container")) expect("container-resize", ALL_FAMILIES);
    if (groups.includes("dark")) expect("dark-reference", ALL_FAMILIES);
    if (groups.includes("legend"))
      expect("legend-toggle", [
        ...Object.keys(TOGGLE_SUPPORTED),
        ...Object.keys(TOGGLE_UNSUPPORTED),
      ]);

    mkdirSync(EVIDENCE, { recursive: true });
    const report = {
      _about:
        "Raw results from browser/run.mjs. Captured with real CDP mouse input " +
        "(event.isTrusted === true), not synthetic MouseEvent dispatch.",
      baselineSha: "9d73d17d2bbac565672a85e78f6eb7740cb0d9ca",
      generatedBy: "validation/friend-chart-baseline/browser/run.mjs",
      command: "node validation/friend-chart-baseline/browser/run.mjs",
      node: process.version,
      chrome: version,
      viewport: VIEWPORT,
      groupsRun: groups,
      durationMs: Date.now() - started,
      counts,
      missingScenarios: missing,
      screenshotsAreReferenceOnly: true,
      results,
    };
    writeFileSync(resolve(EVIDENCE, "browser-run.json"), `${JSON.stringify(report, null, 2)}\n`);

    console.log(
      `\n• ${counts.verified ?? 0} verified, ${counts.unsupported ?? 0} unsupported, ${failures.length} failed`,
    );
    console.log(
      `• raw results → validation/friend-chart-baseline/evidence/browser/browser-run.json`,
    );

    if (missing.length) {
      console.error(`\nINCOMPLETE RUN — ${missing.length} scenario(s) never produced a result:`);
      for (const m of missing) console.error(`  - ${m}`);
    }
    if (failures.length) {
      console.error(`\nFAILED — ${failures.length} scenario(s):`);
      for (const f of failures) console.error(`  - ${f.scenario}/${f.family ?? "-"}: ${f.detail}`);
    }
    if (missing.length || failures.length) process.exitCode = 1;
    else console.log("• all scenarios accounted for");
  } catch (err) {
    console.error(`\nRUNNER ERROR: ${err.stack ?? err.message}`);
    process.exitCode = 1;
  } finally {
    if (browser && !flag("--keep-open")) await browser.close();
    if (server) {
      // Vite spawns its own children (esbuild, the optimizer). Killing the
      // process group rather than just the leader stops them too; without this
      // the runner finishes its work and then hangs because the event loop is
      // still held open by a surviving grandchild.
      try {
        process.kill(-server.pid, "SIGTERM");
      } catch {
        server.kill("SIGTERM");
      }
    }
  }
}

await main();

// Exit explicitly. Everything above has finished and the results are written;
// a lingering handle (a socket Chrome did not close, a stray child) must not
// turn a completed run into a command that never returns.
process.exit(process.exitCode ?? 0);
