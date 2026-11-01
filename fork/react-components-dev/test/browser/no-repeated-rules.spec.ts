// Client-rendered pages write each component rule once: one component sheet, and no rule (in the
// same layer and at-rule context) appears twice across it and the token defaults, even after
// components mount again and lazy parts open.
import { expect, test, type Page } from "@playwright/test";
import { indexOutsideStrings, matchingBrace } from "../unit/contract/checks";

const pages = [
  "smoke",
  "button",
  "icon-button",
  "tabs",
  "markdown",
  "card-blocks",
  "media",
  "text-blocks",
  "lists-tables",
  "citations-sources",
  "shared-base",
  "disclosure",
  "form-controls",
  "choice-controls",
  "select-calendar",
  "slider",
  "loading-code",
  "cartesian-charts",
  "other-charts",
  "chart-foundations",
  "elements",
  "bench",
  "import-registration",
  "layers",
  "layers.html?layer=openui",
];

/** Each leaf block in `css` with its enclosing @layer / @media / @supports / @keyframes path. */
function blocksOf(css: string, context: string[] = []): string[] {
  const blocks: string[] = [];
  let i = 0;
  while (i < css.length) {
    const open = indexOutsideStrings(css, i, "{;");
    if (open === -1) break;
    const prelude = css.slice(i, open).trim();
    if (css[open] === ";") {
      if (prelude) blocks.push(JSON.stringify([...context, prelude]));
      i = open + 1;
      continue;
    }
    const close = matchingBrace(css, open);
    const body = css.slice(open + 1, close);
    // Keyframes hold percentage blocks: the whole @keyframes is one rule.
    if (/^@(layer|media|container|supports)\b/.test(prelude))
      blocks.push(...blocksOf(body, [...context, prelude]));
    else blocks.push(JSON.stringify([...context, prelude, body.trim()]));
    i = close + 1;
  }
  return blocks;
}

async function settle(page: Page) {
  let previous = "";
  for (let reads = 0; reads < 50; reads++) {
    const state = await page.evaluate(
      () => document.body.innerHTML.length + ":" + document.head.innerHTML.length,
    );
    if (state === previous) return;
    previous = state;
    await page.waitForTimeout(100);
  }
}

// Open what opens on hover, focus and click, so lazily registered parts write their rules too.
async function exercise(page: Page) {
  const targets = page.locator("button:visible, [role=tab]:visible, summary:visible");
  const count = Math.min(await targets.count(), 40);
  for (let index = 0; index < count; index++) {
    const target = targets.nth(index);
    await target.hover({ timeout: 500 }).catch(() => {});
    await target.click({ timeout: 500, trial: false }).catch(() => {});
    await page.keyboard.press("Escape").catch(() => {});
  }
}

for (const name of pages) {
  test(`${name} writes every component rule once`, async ({ page }) => {
    const url = name.includes(".html") ? `/${name}` : `/${name}.html`;
    await page.goto(url);
    await settle(page);
    await exercise(page);
    await settle(page);
    const sheets = await page.evaluate(() =>
      [...document.querySelectorAll("style")]
        .filter((tag) => tag.id.startsWith("openui-"))
        .map((tag) => ({ id: tag.id, text: tag.textContent ?? "" })),
    );
    expect(sheets.filter((sheet) => sheet.id === "openui-styles")).toHaveLength(1);
    const seen = new Map<string, string>();
    const repeated: string[] = [];
    for (const sheet of sheets)
      for (const block of blocksOf(sheet.text)) {
        if (seen.has(block))
          repeated.push(`${seen.get(block)} + ${sheet.id}: ${block.slice(0, 160)}`);
        else seen.set(block, sheet.id);
      }
    expect(repeated).toEqual([]);
    expect(seen.size).toBeGreaterThan(0);
  });
}

test("the check finds a rule repeated in a second write or another tag", () => {
  const first = blocksOf("@layer openui{.go1{color:red}@media (min-width:1px){.go2{color:blue}}}");
  const second = blocksOf("@layer openui{.go2{color:blue}.go1{color:red}}");
  expect(first.filter((block) => second.includes(block))).toHaveLength(1);
  expect(blocksOf(".go1{color:red}")).not.toEqual(blocksOf("@layer openui{.go1{color:red}}"));
});

// An ESM and a CJS build, or two versions, on one page: each copy has its own Goober, so only a
// shared store keeps the second from writing every rule again.
test("a second copy of the package writes no rule again", async ({ page }) => {
  await page.goto("/sheet.html");
  await page.waitForFunction(() => "sheetFixture" in window);
  const result = await page.evaluate(async () => {
    const sheet = () => document.getElementById("openui-styles")!.textContent!;
    const before = sheet();
    // The fixture imports the package from a shared chunk; a query string loads a second copy.
    const source = await (await fetch("/sheet.js")).text();
    const chunk = source.match(/^import \{[^}]*\} from "\.\/([\w-]+\.js)"/)![1];
    await import(/* @vite-ignore */ `/${chunk}?second-copy`);
    await new Promise((resolve) => setTimeout(resolve, 50));
    return { before, after: sheet(), tags: document.querySelectorAll("#openui-styles").length };
  });
  expect(result.tags).toBe(1);
  expect(result.before.length).toBeGreaterThan(0);
  expect(result.after).toBe(result.before);
});
