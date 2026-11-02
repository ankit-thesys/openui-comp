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

// Every tag that carries component rules or token defaults: the browser's own tags (`openui-*`)
// and React's hoisted tags from a server render (data-precedence="openui" / "openui-defaults").
async function sheetsOn(page: Page) {
  return page.evaluate(() => {
    const tags = new Set<HTMLStyleElement>([
      ...document.querySelectorAll<HTMLStyleElement>('style[id^="openui-"]'),
      ...document.querySelectorAll<HTMLStyleElement>('style[data-precedence^="openui"]'),
    ]);
    return [...tags].map((tag, index) => ({
      id: tag.id || `${tag.dataset["precedence"]}#${index} [${tag.dataset["href"] ?? ""}]`,
      server: tag.hasAttribute("data-href"),
      text: tag.textContent ?? "",
    }));
  });
}

function repeatsIn(sheets: Array<{ id: string; text: string }>) {
  const seen = new Map<string, string>();
  const repeated: string[] = [];
  for (const sheet of sheets)
    for (const block of blocksOf(sheet.text)) {
      if (seen.has(block))
        repeated.push(`${seen.get(block)} + ${sheet.id}: ${block.slice(0, 160)}`);
      else seen.set(block, sheet.id);
    }
  return { repeated, blocks: seen.size };
}

for (const name of pages) {
  test(`${name} writes every component rule once`, async ({ page }) => {
    const url = name.includes(".html") ? `/${name}` : `/${name}.html`;
    await page.goto(url);
    await settle(page);
    await exercise(page);
    await settle(page);
    const sheets = await sheetsOn(page);
    expect(sheets.filter((sheet) => sheet.id === "openui-styles")).toHaveLength(1);
    const { repeated, blocks } = repeatsIn(sheets);
    expect(repeated).toEqual([]);
    expect(blocks).toBeGreaterThan(0);
  });
}

// A server-rendered document (#178): the shell's hoisted tags, a Suspense boundary's streamed
// tags and the browser sheet together carry each rule once, through hydration and interaction.
test("a server-rendered, streamed page writes every component rule once", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/server-rules.html");
  await expect(page.getByTestId("late")).toBeVisible();
  await expect(page.locator("main")).toHaveAttribute("data-hydrated", "true");
  await settle(page);
  await exercise(page);
  await settle(page);
  const sheets = await sheetsOn(page);
  // The shell's tags and the boundary's tags both arrived from the server.
  expect(
    sheets.filter((sheet) => sheet.server && sheet.id.startsWith("openui#")).length,
  ).toBeGreaterThanOrEqual(2);
  expect(sheets.filter((sheet) => sheet.id === "openui-styles")).toHaveLength(1);
  const { repeated, blocks } = repeatsIn(sheets);
  expect(repeated).toEqual([]);
  expect(blocks).toBeGreaterThan(0);
  // Server-rendered Buttons are styled.
  await expect(page.getByTestId("late")).toHaveCSS("cursor", "pointer");
  expect(errors).toEqual([]);
});

test("the check finds a server rule repeated in the browser sheet", async ({ page }) => {
  await page.goto("/server-rules.html");
  await expect(page.locator("main")).toHaveAttribute("data-hydrated", "true");
  await settle(page);
  // Plant one class's served rule in the browser sheet, as a write that ignored the server would.
  await page.evaluate(() => {
    const served = document.querySelector('style[data-precedence="openui"][data-href]')!;
    const name = served.getAttribute("data-href")!.split(" ")[0]!;
    const rule = served.textContent!.match(new RegExp(`\\.${name}\\{[^}]*\\}`))![0];
    document.getElementById("openui-styles")!.append(rule);
  });
  const { repeated } = repeatsIn(await sheetsOn(page));
  expect(repeated).toHaveLength(1);
  expect(repeated[0]).toContain("openui-styles");
});

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
