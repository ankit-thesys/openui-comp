// #101 focused states and dimensions; bench.overrides covers every documented class.
import { expect, test } from "@playwright/test";

for (const layer of ["", "openui"]) {
  test(`mounting loading primitives leaves their imported sheet unchanged (${layer || "default"})`, async ({
    page,
  }) => {
    await page.goto(`/loading-code.html?lazy=1&loading-only=1&layer=${layer}`);
    await page.waitForFunction(() => typeof window.mountFixture === "function");
    const imported = await page.evaluate(() => ({
      sheet: document.getElementById("openui-styles")?.textContent ?? "",
      html: document.documentElement.className,
    }));
    await page.evaluate(() => window.mountFixture());
    await expect(page.locator(".app-skeleton")).toBeVisible();
    const generated = await page
      .locator("#root [class]")
      .evaluateAll((elements) =>
        elements.flatMap((el) => [...el.classList].filter((name) => /^go\d+$/.test(name))),
      );
    expect(generated.length).toBeGreaterThan(0);
    for (const name of generated) expect(imported.sheet).toMatch(new RegExp(`\\.${name}(?![0-9])`));
    expect(
      await page.evaluate(() => ({
        sheet: document.getElementById("openui-styles")?.textContent ?? "",
        html: document.documentElement.className,
      })),
    ).toEqual(imported);
  });

  test(`CodeBlock registers on import with no mount additions or html marker (${layer || "default"})`, async ({
    page,
  }) => {
    await page.goto(`/loading-code.html?lazy=1&codeOnly=1&layer=${layer}`);
    await page.waitForFunction(() => typeof window.mountFixture === "function");
    const before = await page.evaluate(() => ({
      sheet: document.getElementById("openui-styles")?.textContent ?? "",
      html: [...document.documentElement.classList],
    }));
    await page.evaluate(() => window.mountFixture());
    await expect(page.locator(".app-code .openui-code-block-copy-button")).toBeAttached();
    const generated = await page
      .locator("#root [class]")
      .evaluateAll((elements) =>
        elements.flatMap((element) =>
          [...element.classList].filter((name) => /^go\d+$/.test(name)),
        ),
      );
    expect(generated.length).toBeGreaterThan(0);
    for (const name of generated) expect(before.sheet).toMatch(new RegExp(`\\.${name}(?![0-9])`));
    expect(
      await page.evaluate(() => document.getElementById("openui-styles")?.textContent ?? ""),
    ).toBe(before.sheet);
    const html = await page.evaluate(() => [...document.documentElement.classList]);
    expect(html).toEqual(before.html);
    for (const name of generated) expect(html).not.toContain(name);
  });

  test(`loading and code register on import, and both survive html rewrites (${layer || "default"})`, async ({
    page,
  }) => {
    await page.goto(`/loading-code.html?lazy=1&layer=${layer}`);
    await page.waitForFunction(() => typeof window.mountFixture === "function");
    const imported = await page.evaluate(
      () => document.getElementById("openui-styles")?.textContent ?? "",
    );
    expect(imported).toContain("--_openui-code-block-copy-button-opacity");
    expect(imported).toContain("--_openui-pie-chart-skeleton-shape-radius");
    expect(imported).toContain("--_openui-dot-matrix-loader-size");
    expect(imported).toContain("--_openui-skeleton-bar-height");
    const html = await page.evaluate(() => document.documentElement.className);
    await page.evaluate(() => window.mountFixture());
    await expect(page.locator(".app-skeleton")).toHaveCSS("display", "flex");
    const selectors = [
      ".app-skeleton",
      ".openui-skeleton-bar",
      ".openui-table-skeleton-row",
      ".openui-pie-chart-skeleton-shape",
      ".app-loader",
      ".app-code",
    ];
    const measure = () =>
      page.locator(selectors.join(",")).evaluateAll((elements) =>
        elements.map((el) => {
          const style = getComputedStyle(el);
          return [
            style.display,
            style.width,
            style.height,
            style.backgroundColor,
            style.borderRadius,
            style.position,
          ];
        }),
      );
    const generated = await page
      .locator(
        '[class*="openui-skeleton"], [class*="openui-table-skeleton"], [class*="openui-pie-chart-skeleton"], [class*="openui-dot-matrix-loader"]',
      )
      .evaluateAll((elements) =>
        elements.flatMap((el) => [...el.classList].filter((name) => /^go\d+$/.test(name))),
      );
    expect(generated.length).toBeGreaterThan(0);
    for (const name of generated) expect(imported).toMatch(new RegExp(`\\.${name}(?![0-9])`));
    expect(await page.evaluate(() => document.documentElement.className)).toBe(html);
    expect(
      await page.evaluate(() => document.getElementById("openui-styles")?.textContent ?? ""),
    ).toContain("--_openui-code-block-copy-button-opacity");
    const before = await measure();
    await page.evaluate(() => {
      document.documentElement.className = "consumer-html";
    });
    expect(await measure()).toEqual(before);
    await expect(page.locator(".app-loader")).toHaveCSS("width", "36px");
    await expect(page.locator(".openui-dot-matrix-loader--variant-compact")).toHaveCSS(
      "width",
      "40px",
    );
    await expect(page.locator(".app-code")).toHaveCSS("position", "relative");
  });

  for (const order of ["before", "after"]) {
    test(`loading dimensions and code hover/copy states are overridable ${order} (${layer || "default"})`, async ({
      page,
    }) => {
      await page.addInitScript(() =>
        Object.defineProperty(navigator, "clipboard", { value: { writeText: async () => {} } }),
      );
      const css = `
        .openui-skeleton-bar { width: 71px; height: 23px; border-radius: 3px; }
        .openui-table-skeleton-row { grid-template-columns: 70px 80px; }
        .openui-table-skeleton-row:last-child { border-bottom: 3px solid rgb(1, 2, 3); }
        .openui-pie-chart-skeleton-shape { width: 75px; height: 50px; border-radius: 4px; }
        .openui-dot-matrix-loader { width: 52px; height: 52px; }
        .openui-dot-matrix-loader-dot { opacity: 0.42; }
        .openui-code-block-copy-button { opacity: 0.6; }
        .openui-code-block-copy-button[data-state=copied] { color: rgb(1, 2, 3); background-color: rgb(4, 5, 6); }
        .openui-code-block-syntax-highlighter {
          color: rgb(1, 2, 3);
          background-color: rgb(4, 5, 6);
          padding: 7px 8px 9px 10px;
          border-radius: 3px;
        }
      `;
      const params = new URLSearchParams({ layer });
      if (order === "before") params.set("css", css);
      await page.goto(`/loading-code.html?${params}`);
      await expect(page.locator(".app-code")).toBeVisible();
      if (order === "after") await page.addStyleTag({ content: css });
      await expect(page.locator(".app-skeleton .openui-skeleton-bar").first()).toHaveCSS(
        "width",
        "71px",
      );
      await expect(page.locator(".app-skeleton .openui-skeleton-bar").first()).toHaveCSS(
        "height",
        "23px",
      );
      await expect(page.locator(".app-skeleton .openui-skeleton-bar").first()).toHaveCSS(
        "border-radius",
        "3px",
      );
      await expect(page.locator(".openui-table-skeleton-row").last()).toHaveCSS(
        "border-bottom-width",
        "3px",
      );
      await expect(page.locator(".openui-table-skeleton-row").first()).toHaveCSS(
        "grid-template-columns",
        "70px 80px",
      );
      for (const shape of await page.locator(".openui-pie-chart-skeleton-shape").all()) {
        await expect(shape).toHaveCSS("width", "75px");
        await expect(shape).toHaveCSS("height", "50px");
        await expect(shape).toHaveCSS("border-radius", "4px");
      }
      await expect(page.locator(".app-loader")).toHaveCSS("width", "52px");
      for (const dot of await page.locator(".openui-dot-matrix-loader-dot").all())
        await expect(dot).toHaveCSS("opacity", "0.42");
      const copy = page.locator(".app-code .openui-code-block-copy-button");
      await page.locator(".app-code").hover();
      await expect(copy).toHaveCSS("opacity", "0.6");
      await copy.click();
      await expect(copy).toHaveAttribute("data-state", "copied");
      await expect(copy).toHaveCSS("color", "rgb(1, 2, 3)");
      await expect(copy).toHaveCSS("background-color", "rgb(4, 5, 6)");
      await expect(page.locator(".app-code .openui-code-block-syntax-highlighter")).toHaveCSS(
        "border-radius",
        "3px",
      );
      const frame = page.locator(".app-code .openui-code-block-syntax-highlighter");
      for (const [property, value] of Object.entries({
        color: "rgb(1, 2, 3)",
        "background-color": "rgb(4, 5, 6)",
        "padding-top": "7px",
        "padding-right": "8px",
        "padding-bottom": "9px",
        "padding-left": "10px",
      }))
        await expect(frame).toHaveCSS(property, value);
    });
  }
}

for (const mode of ["light", "dark"]) {
  for (const layer of ["", "openui"]) {
    test(`CodeBlock preserves class props and hover/copied colours (${mode}, ${layer || "default"})`, async ({
      page,
    }) => {
      await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
      await page.clock.pauseAt(new Date("2026-01-01T00:00:01Z"));
      await page.addInitScript(() =>
        Object.defineProperty(navigator, "clipboard", {
          value: {
            writeText: async (text: string) => {
              sessionStorage.setItem("copied", text);
            },
          },
        }),
      );
      await page.goto(`/loading-code.html?mode=${mode}&layer=${layer}`);
      const copy = page.locator(".app-code .openui-code-block-copy-button");
      await expect(copy).toHaveCSS("opacity", "0");
      await page.locator(".app-code").hover();
      await expect(copy).toHaveCSS("opacity", "1");
      await copy.click();
      await expect(copy).toHaveAccessibleName("Copied to clipboard");
      await expect(copy).toHaveAttribute("data-state", "copied");
      expect(await page.evaluate(() => sessionStorage.getItem("copied"))).toBe(
        "const answer = 42;",
      );
      // #72 keeps the success foreground, but uses the normal background on hover/press.
      const colours = (background: string) =>
        copy.evaluate((element, background) => {
          const probe = document.createElement("span");
          probe.style.color = "var(--openui-text-success-primary)";
          probe.style.backgroundColor = `var(${background})`;
          element.append(probe);
          const expected = getComputedStyle(probe);
          const actual = getComputedStyle(element);
          const result = {
            actual: [actual.color, actual.backgroundColor],
            expected: [expected.color, expected.backgroundColor],
          };
          probe.remove();
          return result;
        }, background);
      const hovered = await colours("--openui-highlight");
      expect(hovered.actual).toEqual(hovered.expected);
      await page.mouse.down();
      const pressed = await colours("--openui-highlight");
      expect(pressed.actual).toEqual(pressed.expected);
      await page.mouse.up();
      await page.locator(".app-code > div").hover();
      const copiedRest = await colours("--openui-success-background");
      expect(copiedRest.actual).toEqual(copiedRest.expected);
      await page.clock.runFor(1001);
      await expect(copy).toHaveAttribute("data-state", "idle");
      await expect(copy).toHaveAccessibleName("Copy code");
      await expect(page.locator(".app-code .openui-code-block-syntax-highlighter")).toHaveCSS(
        "margin-top",
        "0px",
      );
      const custom = page.locator(".app-code-custom .app-highlighter");
      await expect(custom).toHaveCount(1);
      await expect(custom).not.toHaveClass(/openui-code-block-syntax-highlighter/);
      await expect(custom).toHaveCSS("border-radius", "0px");
      await expect(custom).not.toHaveCSS("margin-top", "0px");
      await expect(
        page.locator(".app-code-empty .openui-code-block-syntax-highlighter"),
      ).toHaveCount(0);
      await expect(page.locator(".app-code-empty > div")).toHaveCSS("border-radius", "0px");
    });
  }
}

test("DotMatrixLoader animates both grids without inline opacity blocking consumer CSS", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/loading-code.html");
  const dots = page.locator(".app-loader .openui-dot-matrix-loader-dot");
  await expect(dots).toHaveCount(25);
  const compactDots = page.locator(
    ".openui-dot-matrix-loader--variant-compact .openui-dot-matrix-loader-dot",
  );
  const opacities = () =>
    dots.evaluateAll((elements) => elements.map((el) => getComputedStyle(el).opacity));
  const compactOpacities = () =>
    compactDots.evaluateAll((elements) => elements.map((el) => getComputedStyle(el).opacity));
  await page.clock.runFor(100);
  const before = await opacities();
  const compactBefore = await compactOpacities();
  await page.clock.runFor(350);
  expect(await opacities()).not.toEqual(before);
  expect(await compactOpacities()).not.toEqual(compactBefore);
  await expect(
    page.locator(".openui-dot-matrix-loader--variant-compact .openui-dot-matrix-loader-dot"),
  ).toHaveCount(16);
  await page.addStyleTag({ content: ".openui-dot-matrix-loader-dot { opacity: 0.42; }" });
  await page.clock.runFor(350);
  expect(new Set(await opacities())).toEqual(new Set(["0.42"]));
});
