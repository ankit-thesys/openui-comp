// #91: consumer rules win on every stable class, with the same state, before/after in both modes.
// Also guards native focus/disabled/invalid precedence, context updates and import-time inactivity.
import { expect, test, type Locator } from "@playwright/test";

const override = {
  color: "rgb(1, 2, 3)",
  "background-color": "rgb(4, 5, 6)",
  "padding-top": "7px",
  "border-top-color": "rgb(11, 12, 13)",
};
const declarations = Object.entries(override)
  .map(([key, value]) => `${key}:${value};`)
  .join("");
const computed = (element: Locator, properties: string[]) =>
  element.evaluate((el, properties) => {
    el.getAnimations().forEach((animation) => animation.finish());
    const css = getComputedStyle(el);
    return Object.fromEntries(
      properties.map((property) => [property, css.getPropertyValue(property)]),
    );
  }, properties);

const targets = [
  ["openui-form-control", ".openui-form-control"],
  ["openui-hint", '[data-testid="hint"]'],
  ["openui-label", '[data-testid="disabled-label"]'],
  ["openui-label-required-asterisk", ".openui-label-required-asterisk"],
  ["openui-input", '[data-testid="input"]'],
  ["openui-input--size-small", '[data-testid="small"]'],
  ["openui-input--size-medium", '[data-testid="input"]'],
  ["openui-input--size-large", '[data-testid="large"]'],
  ["openui-input", '[data-testid="disabled-input"]'],
  ["openui-text-area", '[data-testid="text-area"]'],
  ["openui-text-area", '[data-testid="disabled-text-area"]'],
  ["openui-buttons", '[data-testid="horizontal"]'],
  ["openui-buttons--variant-horizontal", '[data-testid="horizontal"]'],
  ["openui-buttons--variant-vertical", '[data-testid="vertical"]'],
] as const;

for (const layer of ["", "openui"]) {
  for (const order of ["before", "after"]) {
    for (const [className, selector] of targets) {
      test(`${className} on ${selector} wins ${order} (${layer || "default"})`, async ({
        page,
      }) => {
        const css =
          [
            "",
            ":focus-within",
            ":disabled",
            '[aria-invalid="true"]',
            '[data-invalid="true"]',
            '[aria-disabled="true"]',
          ]
            .map((state) => `.${className}${state}`)
            .join(",") + `{${declarations}}`;
        const params = new URLSearchParams({ layer });
        if (order === "before") params.set("css", css);
        await page.goto(`/form-controls.html?${params}`);
        const element = page.locator(selector);
        await expect(element).toBeVisible();
        await expect(element).toHaveClass(new RegExp(`\\b${className}\\b`));
        if (order === "after") await page.addStyleTag({ content: css });
        if (await element.evaluate((el) => el.matches("input:enabled,textarea:enabled")))
          await element.focus();
        expect(await computed(element, Object.keys(override))).toEqual(override);
      });
    }
  }

  test(`hint and label override independently (${layer || "default"})`, async ({ page }) => {
    await page.goto(`/form-controls.html?layer=${layer}`);
    await expect(page.getByTestId("hint")).toBeVisible();
    const label = await computed(page.getByTestId("label"), ["color"]);
    const input = await computed(page.getByTestId("input"), ["color"]);
    await page.addStyleTag({
      content: '.openui-hint[data-invalid="true"]{color:rgb(1,2,3)}',
    });
    await expect(page.getByTestId("hint")).toHaveCSS("color", "rgb(1, 2, 3)");
    expect(await computed(page.getByTestId("label"), ["color"])).toEqual(label);
    expect(await computed(page.getByTestId("input"), ["color"])).toEqual(input);
    await page.addStyleTag({ content: ".openui-label{color:rgb(4,5,6)}" });
    await expect(page.getByTestId("label")).toHaveCSS("color", "rgb(4, 5, 6)");
    await expect(page.getByTestId("hint")).toHaveCSS("color", "rgb(1, 2, 3)");
  });
}

for (const mode of ["light", "dark"]) {
  test(`invalid, disabled and focus retain their precedence (${mode})`, async ({ page }) => {
    await page.goto(`/form-controls.html?mode=${mode}`);
    const properties = ["border-top-color", "box-shadow", "background-color", "color"];
    const read = (id: string) => computed(page.getByTestId(id), properties);
    await expect(page.getByTestId("input")).toHaveAttribute("aria-invalid", "true");
    const invalid = await read("input");
    await page.getByTestId("input").focus();
    expect(await read("input")).toEqual(invalid);
    const disabled = await read("disabled-input");
    await page.getByTestId("disabled-input").hover();
    expect(await read("disabled-input")).toEqual(disabled);
    expect(disabled["border-top-color"]).not.toEqual(invalid["border-top-color"]);
    const invalidArea = await read("text-area");
    await page.getByTestId("text-area").focus();
    expect((await read("text-area"))["border-top-color"]).toEqual(invalidArea["border-top-color"]);
    expect((await read("text-area"))["box-shadow"]).not.toEqual(invalidArea["box-shadow"]);
    const disabledArea = await read("disabled-text-area");
    await page.getByTestId("disabled-text-area").hover();
    expect(await read("disabled-text-area")).toEqual(disabledArea);
    expect(disabledArea["border-top-color"]).not.toEqual(invalidArea["border-top-color"]);
    const valid = await read("valid-input");
    await page.getByTestId("valid-input").focus();
    const focused = await read("valid-input");
    expect(focused["border-top-color"]).not.toEqual(valid["border-top-color"]);
    expect(focused["box-shadow"]).not.toEqual(valid["box-shadow"]);
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(page.getByTestId("valid-input")).toBeFocused();
    expect(await read("valid-input")).toEqual(focused);
    await page.getByTestId("toggle-invalid").click();
    for (const id of ["input", "text-area", "valid-input", "valid-text-area"])
      await expect(page.getByTestId(id)).not.toHaveAttribute("aria-invalid", "true");
    await expect(page.getByTestId("hint")).not.toHaveAttribute("data-invalid", "true");
    expect((await read("input"))["border-top-color"]).toEqual(valid["border-top-color"]);
    await page.getByTestId("toggle-invalid").click();
    await expect(page.getByTestId("input")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByTestId("text-area")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByTestId("hint")).toHaveAttribute("data-invalid", "true");
    for (const id of ["valid-input", "valid-text-area"])
      await expect(page.getByTestId(id)).not.toHaveAttribute("aria-invalid", "true");
    await expect(page.getByTestId("valid-hint")).not.toHaveAttribute("data-invalid", "true");
  });
}

test("form styles register at render, leave html unmarked, and survive html replacement", async ({
  page,
}) => {
  await page.goto("/form-controls.html?lazy=1");
  await page.waitForFunction(() => typeof window.mountFixture === "function");
  const before = await page.evaluate(() => ({
    sheet: document.getElementById("_goober")!.textContent,
    html: document.documentElement.className,
  }));
  await page.evaluate(() => window.mountFixture());
  await expect(page.getByTestId("input")).toBeVisible();
  const generated = await page
    .locator("#root [class]")
    .evaluateAll((els) => [
      ...new Set(els.flatMap((el) => [...el.classList].filter((name) => /^go\d+$/.test(name)))),
    ]);
  expect(generated.length).toBeGreaterThan(0);
  for (const name of generated) expect(before.sheet).not.toMatch(new RegExp(`\\.${name}(?![0-9])`));
  expect(await page.locator("html").getAttribute("class")).toEqual(before.html);
  const observations = await Promise.all(
    targets.map(([, selector]) =>
      computed(page.locator(selector), ["display", "color", "padding-top", "border-top-color"]),
    ),
  );
  await page.evaluate(() => {
    document.documentElement.className = "consumer-html";
  });
  expect(
    await Promise.all(
      targets.map(([, selector]) =>
        computed(page.locator(selector), ["display", "color", "padding-top", "border-top-color"]),
      ),
    ),
  ).toEqual(observations);
});
