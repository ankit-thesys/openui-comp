// The preview side of the comparison (#230): opens the dashboards-ui-library live preview, walks
// every example and building-block page in one theme, and for each program the preview shows
// captures its OpenUI Lang source and runs measure.js on it. Block pages are walked through every
// combination of their version radios, plus each "Show" option on its own; examples have no
// program panel, so their sources are read from the preview's bundle as it loads.
import { readFileSync } from "node:fs";

export const PREVIEW = "https://openui-dashboards.vercel.app/";
export const VIEWPORT = { width: 1280, height: 900 };
export const FONT = "*, *::before, *::after { font-family: Arial, sans-serif !important; }";
const measureSource = readFileSync(new URL("./measure.js", import.meta.url), "utf8");

/** Exposes the examples array the bundle keeps in module scope, as `window.__pdkExamples`. */
async function exposeExamples(context) {
  await context.route(/\/assets\/index-[\w-]+\.js$/, async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    const array = body.match(/([\w$]+)=\[\{slug:"retail",title:"Retail sales"/);
    const after = body.match(/,([\w$]+)="\/ex\/retail"/);
    if (!array || !after)
      throw new Error("The preview's bundle changed: its examples array was not found");
    const patched = body.replace(
      after[0],
      `,__pdkExamples=(window.__pdkExamples=${array[1]})${after[0]}`,
    );
    await route.fulfill({ response, body: patched });
  });
}

async function openPage(page, hash, theme) {
  await page.goto(PREVIEW + hash);
  await page.waitForSelector(".pdk-dashboard", { state: "attached", timeout: 30_000 });
  await page.addStyleTag({ content: FONT });
  await page.click(`button[aria-label="${theme === "dark" ? "Dark" : "Light"}"]`);
  await page.waitForTimeout(800);
  await page.evaluate(`${measureSource}\nwindow.__measureScope = measureScope;`);
}

/**
 * The preview's own rules for its specimens and program pages (they restyle the library's classes
 * inside `.dl-specimen` and `.dl-program`): our side applies the same rules, prefix translated,
 * inside the same wrappers, so both sides lay out under the same page styles.
 */
async function pageStyles(page) {
  return page.evaluate(() => {
    const out = [];
    const walk = (rules, wrap) => {
      for (const rule of rules) {
        if (rule.cssRules && !rule.selectorText) {
          const condition = rule.conditionText ?? rule.media?.mediaText;
          const at = rule.constructor.name === "CSSContainerRule" ? "@container" : "@media";
          walk(rule.cssRules, (css) => wrap(`${at} ${condition} { ${css} }`));
        } else if (
          rule.selectorText &&
          /\.dl-|#/.test(rule.selectorText) &&
          /pdk-/.test(rule.selectorText)
        ) {
          out.push(wrap(rule.cssText));
        }
      }
    };
    for (const sheet of document.styleSheets) {
      try {
        walk(sheet.cssRules, (css) => css);
      } catch {
        // A cross-origin sheet: not the preview's own.
      }
    }
    return out;
  });
}

/** The pages to cover, from the preview's own navigation: the examples and the block pages. */
export async function listPages(page) {
  await page.goto(PREVIEW);
  await page.waitForSelector("a[href^='#/']");
  const links = await page.evaluate(() =>
    [...document.querySelectorAll("a[href^='#/']")].map((a) => [
      a.textContent.trim(),
      a.getAttribute("href"),
    ]),
  );
  return links
    .filter(([, href]) => /^#\/(ex|b)\//.test(href))
    .map(([name, href]) => ({
      name,
      hash: href,
      slug: href.split("/").pop(),
      example: href.startsWith("#/ex/"),
    }));
}

// The dashboard root a program renders into: not the preview's page heading, not its hidden
// measuring copy of every variant.
const SCOPE = `(root) => [...root.querySelectorAll(".pdk-root")]
  .filter((r) => !r.closest(".dl-measure") && r.querySelector(":scope > .pdk-dashboard:not(.pdk-dashboard-heading)"))
  .at(-1)`;

async function measureIn(page, rootSelector, index) {
  return page.evaluate(
    async ([rootSelector, index, scopeOf]) => {
      const root = rootSelector ? document.querySelectorAll(rootSelector)[index] : document;
      const scope = eval(scopeOf)(root);
      if (!scope) return { error: "no dashboard root" };
      const width = Math.round(scope.getBoundingClientRect().width * 10) / 10;
      const measured = await window.__measureScope("pdk-", scope);
      return { width, content: measured.scope.content.w, ...measured };
    },
    [rootSelector, index, SCOPE],
  );
}

/** Every combination of a section's radio groups, discovered as they are chosen. */
async function combinations(page, index, visit, chosen = []) {
  const groups = await page.evaluate(
    (index) =>
      [
        ...document
          .querySelectorAll("section.dl-comp")
          [index].querySelectorAll(".dl-comp-controls .dl-variants"),
      ].map((g) => ({
        label: g.getAttribute("aria-label"),
        options: [...g.querySelectorAll("label")].map((l) => l.textContent.trim()),
      })),
    index,
  );
  const next = groups.find((g) => !chosen.some((c) => c.group === g.label));
  if (!next) return visit(chosen);
  for (const option of next.options) {
    await page.evaluate(
      ([index, label, option]) => {
        const group = [
          ...document.querySelectorAll("section.dl-comp")[index].querySelectorAll(".dl-variants"),
        ].find((g) => g.getAttribute("aria-label") === label);
        [...group.querySelectorAll("label")].find((l) => l.textContent.trim() === option)?.click();
      },
      [index, next.label, option],
    );
    await page.waitForTimeout(250);
    await combinations(page, index, visit, [...chosen, { group: next.label, option }]);
  }
  // Back to the first option, so later groups and sections start from the default.
  await page.evaluate(
    ([index, label]) => {
      const group = [
        ...document.querySelectorAll("section.dl-comp")[index].querySelectorAll(".dl-variants"),
      ].find((g) => g.getAttribute("aria-label") === label);
      group?.querySelector("label")?.click();
    },
    [index, next.label],
  );
  await page.waitForTimeout(150);
}

const program = (page, index) =>
  page.evaluate(async (index) => {
    const section = document.querySelectorAll("section.dl-comp")[index];
    if (!section.querySelector("pre")) {
      [...section.querySelectorAll(".dl-comp-actions button")]
        .find((b) => b.textContent.trim() === "OpenUI Lang")
        ?.click();
      await new Promise((r) => setTimeout(r, 200));
    }
    return section.querySelector("pre")?.textContent ?? null;
  }, index);

/**
 * Measures every program of the given pages in one theme. Returns { entries: { key: entry } },
 * where an entry is { page, section, combo, program, width, scope, units } or { …, error }.
 */
export async function runPreview(browser, theme, pages, log = () => {}) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  await exposeExamples(context);
  const page = await context.newPage();
  const entries = {};
  let styles = null;
  for (const target of pages) {
    await openPage(page, target.hash, theme);
    styles ??= await pageStyles(page);
    if (target.example) {
      const source = await page.evaluate(
        (slug) => window.__pdkExamples?.find((e) => e.slug === slug)?.source ?? null,
        target.slug,
      );
      const key = `${target.name}`;
      entries[key] = {
        page: target.name,
        section: "",
        combo: "",
        program: source,
        context: { wrapper: "dl-program", id: null },
        ...(await measureIn(page, null, 0)),
      };
      log(`${theme}  ${key}  ${Object.keys(entries[key].units ?? {}).length} units`);
      continue;
    }
    const sections = await page.evaluate(() =>
      [...document.querySelectorAll("section.dl-comp")].map((s) =>
        s.querySelector(".dl-comp-head")?.textContent.trim(),
      ),
    );
    const ids = await page.evaluate(() =>
      [...document.querySelectorAll("section.dl-comp")].map((s) => s.id || null),
    );
    for (const [index, section] of sections.entries()) {
      const seen = new Set();
      // The preview forces "compare to previous period" on for a specimen whose "Previous period"
      // option is ticked (a host override, outside the program); our host does the same.
      const capture = async (combo, compare = false) => {
        const source = await program(page, index);
        if (!source || seen.has(source)) return;
        seen.add(source);
        const key = `${target.name} / ${section}${combo ? ` / ${combo}` : ""}`;
        const measured = await measureIn(page, "section.dl-comp", index);
        entries[key] = {
          page: target.name,
          section,
          combo,
          program: source,
          context: { wrapper: "dl-specimen", id: ids[index], compare },
          ...measured,
        };
        log(`${theme}  ${key}  ${Object.keys(measured.units ?? {}).length} units`);
      };
      await combinations(page, index, (chosen) => capture(chosen.map((c) => c.option).join(" · ")));
      // Each "Show" option on its own, at the default versions.
      const options = await page.evaluate(
        (index) =>
          [
            ...document
              .querySelectorAll("section.dl-comp")
              [index].querySelectorAll(".dl-options label"),
          ].map((l) => l.textContent.trim()),
        index,
      );
      for (const option of options) {
        const toggle = () =>
          page.evaluate(
            ([index, option]) =>
              [
                ...document
                  .querySelectorAll("section.dl-comp")
                  [index].querySelectorAll(".dl-options label"),
              ]
                .find((l) => l.textContent.trim() === option)
                ?.click(),
            [index, option],
          );
        await toggle();
        await page.waitForTimeout(250);
        await capture(`+ ${option}`, option === "Previous period");
        await toggle();
        await page.waitForTimeout(150);
      }
    }
  }
  await context.close();
  return { entries, styles: styles ?? [] };
}
