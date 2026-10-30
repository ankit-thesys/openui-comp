// Shared border-box and pulse survive <html> rewrites, honour layers,
// and remain overridable by one stable class before/after the library.
import { expect, test } from "@playwright/test";

test("shared border-box registers at import and survives an html class rewrite", async ({
  page,
}) => {
  await page.goto("/shared-base.html?lazy=1");
  await page.waitForFunction(() => typeof window.mountFixture === "function");
  const imported = await page.evaluate(
    () => document.getElementById("openui-styles")?.textContent ?? "",
  );
  expect(imported).toMatch(/@keyframes [\w-]+\{0%\{opacity:0\.3;/);
  await page.evaluate(() => window.mountFixture());
  await expect(page.locator(".openui-border-box")).toHaveCount(3);
  await expect(page.locator(".openui-skeleton-pulse")).toHaveCount(18);
  const roots = await page
    .locator(".openui-border-box")
    .evaluateAll((elements) => elements.map((element) => [...element.classList]));
  const shared = roots[0]!.filter(
    (name) => /^go\d+$/.test(name) && roots.every((classes) => classes.includes(name)),
  );
  expect(shared).toHaveLength(1);
  expect(imported).toContain(`.${shared[0]}{box-sizing:border-box;}`);
  const pulse = await page
    .locator(".openui-skeleton-pulse")
    .evaluateAll((elements) =>
      elements.flatMap((el) => [...el.classList].filter((name) => /^go\d+$/.test(name))),
    );
  expect(pulse.length).toBeGreaterThan(0);
  for (const name of pulse) expect(imported).toMatch(new RegExp(`\\.${name}(?![0-9])`));
  await page.evaluate(() => {
    document.documentElement.className = "consumer-html";
  });
  for (const root of await page.locator(".openui-border-box").all())
    await expect(root).toHaveCSS("box-sizing", "border-box");
  for (const child of ["buttons-child", "form-child", "tag-child", "plain"])
    await expect(page.getByTestId(child)).toHaveCSS("box-sizing", "content-box");
  // Advance the actual browser animation deterministically: 0% and 50% of its 1200ms period.
  const frames = await page.locator(".openui-skeleton-pulse").evaluateAll((elements) =>
    elements.map((element) => {
      const animation = element.getAnimations()[0]!;
      animation.pause();
      animation.currentTime = 0;
      const start = getComputedStyle(element).opacity;
      animation.currentTime = 600;
      return {
        start,
        middle: getComputedStyle(element).opacity,
        duration: animation.effect!.getTiming().duration,
        iterations: animation.effect!.getTiming().iterations,
      };
    }),
  );
  expect(frames).toHaveLength(18);
  for (const frame of frames)
    expect(frame).toEqual({ start: "0.3", middle: "0.85", duration: 1200, iterations: Infinity });
});

for (const layer of ["", "openui"]) {
  for (const order of ["before", "after"]) {
    test(`shared stable classes win ${order} the library (${layer || "default"})`, async ({
      page,
    }) => {
      const css =
        ".openui-border-box { box-sizing: content-box; } .openui-skeleton-pulse { animation: none; opacity: 0.42; }";
      const params = new URLSearchParams({ layer });
      if (order === "before") params.set("css", css);
      await page.goto(`/shared-base.html?${params}`);
      await expect(page.locator(".openui-border-box")).toHaveCount(3);
      await expect(page.locator(".openui-skeleton-pulse")).toHaveCount(18);
      if (order === "after") await page.addStyleTag({ content: css });
      for (const root of await page.locator(".openui-border-box").all())
        await expect(root).toHaveCSS("box-sizing", "content-box");
      for (const part of await page.locator(".openui-skeleton-pulse").all()) {
        await expect(part).toHaveCSS("animation-name", "none");
        await expect(part).toHaveCSS("opacity", "0.42");
      }
    });
  }
}
