// Interaction bench: Radix-based and portalled components respond to mouse and keyboard after
// hydration, in this package and in @openuidev/react-ui for comparison.
import { expect, test } from "@playwright/test";
import { openBench, PACKAGES } from "./bench/app";

for (const pkg of PACKAGES) {
  test.describe(pkg, () => {
    test.beforeEach(async ({ page }) => {
      await openBench(page, pkg);
    });

    test("Select: mouse opens the listbox and chooses", async ({ page }) => {
      await page.getByTestId("select-trigger").click();
      const listbox = page.getByRole("listbox");
      await expect(listbox).toBeVisible();
      await page.getByRole("option", { name: "Banana" }).click();
      await expect(listbox).toBeHidden();
      await expect(page.getByTestId("select-value")).toHaveText("banana");
      await expect(page.getByTestId("select-trigger")).toContainText("Banana");
    });

    test("Select: keyboard opens and navigates; Escape restores focus", async ({ page }) => {
      const trigger = page.getByTestId("select-trigger");
      await trigger.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("listbox")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("listbox")).toBeHidden();
      await expect(trigger).toBeFocused();
      await page.keyboard.press("ArrowDown");
      await expect(page.getByRole("listbox")).toBeVisible();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("select-value")).not.toHaveText("");
    });

    test("Accordion: defaultValue opens the first item and a click switches", async ({ page }) => {
      const root = page.getByTestId("accordion");
      const first = root.getByRole("button", { name: "First" });
      const second = root.getByRole("button", { name: "Second" });
      await expect(first).toHaveAttribute("aria-expanded", "true");
      await expect(second).toHaveAttribute("aria-expanded", "false");
      await second.click();
      await expect(second).toHaveAttribute("aria-expanded", "true");
      await expect(first).toHaveAttribute("aria-expanded", "false");
      await expect(root.getByText("Second body")).toBeVisible();
    });

    test("Tabs: defaultValue selects the first tab; click and arrow keys switch", async ({
      page,
    }) => {
      const root = page.getByTestId("tabs");
      const one = root.getByRole("tab", { name: "Tab one" });
      await expect(one).toHaveAttribute("aria-selected", "true");
      await expect(root.getByText("Panel one")).toBeVisible();
      await root.getByRole("tab", { name: "Tab two" }).click();
      await expect(root.getByText("Panel two")).toBeVisible();
      await page.keyboard.press("ArrowLeft");
      await expect(one).toHaveAttribute("aria-selected", "true");
    });

    test("TooltipWrapper: hover shows a portalled tooltip and leaving hides it", async ({
      page,
    }) => {
      await page.getByTestId("tooltip-trigger").hover();
      const tooltip = page.getByRole("tooltip");
      await expect(tooltip).toContainText("Tip heading");
      await expect(page.getByText("Tip body").first()).toBeVisible();
      await page.mouse.move(5, 5, { steps: 20 });
      await expect(tooltip).toBeHidden();
    });

    test("DatePicker: opens a floating calendar and picks a day", async ({ page }) => {
      const root = page.getByTestId("datepicker");
      await root.getByText("Select a date").click();
      const grid = page.getByRole("grid").first();
      await expect(grid).toBeVisible();
      await grid.getByRole("button", { name: /15/ }).first().click();
      await expect(root).toContainText(/15/);
    });

    test("SwitchItem, CheckBoxItem and RadioGroup toggle", async ({ page }) => {
      const toggle = page.getByTestId("switch").getByRole("switch");
      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-checked", "true");
      const checkbox = page.getByTestId("checkbox").getByRole("checkbox");
      await checkbox.click();
      await expect(checkbox).toHaveAttribute("aria-checked", "true");
      await page.getByTestId("checkbox").getByText("Agree").click();
      await expect(checkbox).toHaveAttribute("aria-checked", "false");
      const radio = page.getByTestId("radio").getByRole("radio", { name: "R2" });
      await radio.click();
      await expect(radio).toHaveAttribute("aria-checked", "true");
    });

    test("Slider: the keyboard changes its value", async ({ page }) => {
      const slider = page.getByTestId("slider").getByRole("slider");
      await expect(slider).toHaveAttribute("aria-valuenow", "50");
      await slider.focus();
      await page.keyboard.press("ArrowRight");
      await expect(slider).toHaveAttribute("aria-valuenow", "51");
      await page.keyboard.press("End");
      await expect(slider).toHaveAttribute("aria-valuenow", "100");
    });

    test("Carousel: the next button scrolls", async ({ page }) => {
      const root = page.getByTestId("carousel");
      const scroller = root.locator("[class*=carousel-content]").first();
      const before = await scroller.evaluate((el) => el.scrollLeft);
      await root.getByRole("button").last().click();
      await expect.poll(() => scroller.evaluate((el) => el.scrollLeft)).toBeGreaterThan(before);
    });
  });
}
