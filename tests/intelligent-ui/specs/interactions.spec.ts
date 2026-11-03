import { expect, test, type Page } from "@playwright/test";
import type { Host } from "../harness/matrix";
import { failures, render } from "../harness/render";

/**
 * #203: the controls, forms and study tools, driven as a user drives them (by role, label and visible
 * text) on every host. Each test ends by running every check, so an interaction that logs an error
 * fails even when the page looks right.
 */
const host = () => test.info().project.metadata["host"] as Host;

const main = (page: Page) => page.locator("main");
const lastAction = (page: Page) => page.evaluate(() => window.__iu.actions.at(-1) ?? null);
const actionCount = (page: Page) => page.evaluate(() => window.__iu.actions.length);

/** Renders a program and returns a function that runs every check on it, interactions included. */
async function open(page: Page, program: string) {
  const rendered = await render(page, host(), program);
  expect(await failures(rendered), `${program} before any interaction`).toEqual([]);
  return async () => {
    rendered.state = await page.evaluate(() => window.__iu);
    expect(await failures(rendered), `${program} after the interactions`).toEqual([]);
  };
}

test.describe("forms", () => {
  test("an empty required field holds the form back and says why", async ({ page }) => {
    const checked = await open(page, "behaviour-form");
    await page.getByRole("button", { name: "Sign me up" }).click();
    await expect(main(page)).toContainText(/required/i);
    expect(await actionCount(page)).toBe(0);
    await checked();
  });

  test("a value that breaks its rule holds the form back", async ({ page }) => {
    const checked = await open(page, "behaviour-form");
    await page.getByRole("textbox", { name: "Email" }).fill("not-an-email");
    await page.getByRole("button", { name: "Sign me up" }).click();
    await expect(main(page)).toContainText(/email/i);
    await page.getByRole("textbox", { name: "Email" }).fill("ada@example.com");
    await page.getByRole("textbox", { name: "Age" }).fill("17");
    await page.getByRole("button", { name: "Sign me up" }).click();
    await expect(main(page)).toContainText("18");
    expect(await actionCount(page)).toBe(0);
    await checked();
  });

  test("valid fields go to the assistant with @ToAssistant, and the errors clear", async ({
    page,
  }) => {
    const checked = await open(page, "behaviour-form");
    await page.getByRole("button", { name: "Sign me up" }).click();
    await expect(main(page)).toContainText(/required/i);
    await page.getByRole("textbox", { name: "Email" }).fill("ada@example.com");
    await page.getByRole("textbox", { name: "Age" }).fill("21");
    await expect(main(page)).not.toContainText(/required/i);
    await page.getByRole("button", { name: "Sign me up" }).click();
    expect(await actionCount(page)).toBe(1);
    const sent = await lastAction(page);
    expect(sent).toMatchObject({
      type: "continue_conversation",
      humanFriendlyMessage: "Sign me up",
      params: { context: { source: "newsletter" } },
      passedOn: true,
    });
    expect(Object.values(sent!.formState ?? {})).toEqual(
      expect.arrayContaining(["ada@example.com", 21]),
    );
    await checked();
  });

  test("every kind of field's value goes with the form", async ({ page }) => {
    const checked = await open(page, "inputs");
    await page.getByRole("textbox", { name: "Name" }).fill("Ada");
    await page.getByRole("textbox", { name: "Travelers" }).fill("6");
    await page.getByRole("radio", { name: "Cold / rainy" }).click();
    await page.getByRole("textbox", { name: "Anything else?" }).fill("Kyoto");
    await page.getByRole("combobox").last().click();
    await page.getByRole("option", { name: "Active" }).click();
    await page.getByRole("button", { name: "Customize my trip" }).click();
    const sent = await lastAction(page);
    expect(sent?.params).toEqual({
      context: {
        name: "Ada",
        people: 6,
        date: "2026-10-24",
        pace: "active",
        weather: "cold",
        notes: "Kyoto",
      },
    });
    await checked();
  });

  test("a form's state goes with a @ToAssistant that names no values", async ({ page }) => {
    const checked = await open(page, "example-trip");
    await page.getByRole("radio", { name: "Packed" }).click();
    await page.getByRole("button", { name: "Plan my trip" }).click();
    const sent = await lastAction(page);
    expect(sent).toMatchObject({
      type: "continue_conversation",
      humanFriendlyMessage: "Tailor my Lisbon trip",
    });
    expect(Object.values(sent!.formState ?? {})).toContain("Packed");
    await checked();
  });
});

test.describe("controls", () => {
  test("Slider moves with the keyboard", async ({ page }) => {
    const checked = await open(page, "behaviour-controls");
    const slider = page.getByRole("slider", { name: "Volume" });
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(main(page)).toContainText("Volume is 7");
    await page.keyboard.press("ArrowLeft");
    await expect(main(page)).toContainText("Volume is 6");
    await page.keyboard.press("End");
    await expect(main(page)).toContainText("Volume is 10");
    await page.keyboard.press("Home");
    await expect(main(page)).toContainText("Volume is 0");
    await expect(slider).toHaveValue("0");
    await checked();
  });

  test("SegmentedControl switches what's shown", async ({ page }) => {
    const checked = await open(page, "behaviour-controls");
    await page.getByRole("radio", { name: "Beta" }).click();
    await expect(main(page)).toContainText("Showing beta");
    await expect(page.getByRole("radio", { name: "Beta" })).toBeChecked();
    await expect(page.getByRole("radio", { name: "Alpha" })).not.toBeChecked();
    await checked();
  });

  test("RadioGroup moves the choice", async ({ page }) => {
    const checked = await open(page, "behaviour-controls");
    await page.getByRole("radio", { name: "L", exact: true }).click();
    await expect(main(page)).toContainText("Size L");
    await expect(page.getByRole("radio", { name: "L", exact: true })).toBeChecked();
    await expect(page.getByRole("radio", { name: "M", exact: true })).not.toBeChecked();
    await checked();
  });

  test("Checkbox ticks, strikes through and unticks", async ({ page }) => {
    const checked = await open(page, "behaviour-controls");
    const box = page.getByRole("checkbox", { name: "Water the plants" });
    const label = main(page).getByText("Water the plants", { exact: true });
    const strike = () => label.evaluate((element) => getComputedStyle(element).textDecorationLine);
    expect(await strike()).toBe("none");
    await label.click();
    await expect(box).toBeChecked();
    await expect(main(page)).toContainText("Ticked");
    expect(await strike()).toBe("line-through");
    await box.click();
    await expect(box).not.toBeChecked();
    await expect(main(page)).toContainText("Not ticked");
    await checked();
  });

  test("DatePicker picks a day and keeps the calendar inside its range", async ({ page }) => {
    // react-components' calendar opens on today's month (a known 0.0.1 bug), so today is in range.
    await page.clock.setFixedTime(new Date("2026-10-09T12:00:00Z"));
    const checked = await open(page, "behaviour-controls");
    await main(page).getByText("Oct 14, 2026").click();
    await expect(page.getByRole("grid", { name: "October 2026" })).toBeVisible();
    await page.getByRole("button", { name: "Tuesday, October 20th, 2026" }).click();
    await expect(main(page)).toContainText("Date 2026-10-20");
    // max is 2026-10-31, so there is no next month to go to.
    await expect(page.getByRole("button", { name: "Go to the Next Month" })).toBeHidden();
    await checked();
  });

  test("DatePicker refuses a day outside its range and says why", async ({ page }) => {
    // Today is past max, so the calendar opens on a month it must not accept.
    await page.clock.setFixedTime(new Date("2026-11-09T12:00:00Z"));
    const checked = await open(page, "behaviour-controls");
    await main(page).getByText("Oct 14, 2026").click();
    await page.getByRole("button", { name: "Friday, November 20th, 2026" }).click();
    await expect(main(page)).toContainText("Choose Oct 31, 2026 or earlier");
    await expect(main(page)).toContainText("Date 2026-10-14");
    await checked();
  });
});

test.describe("Popover and the map", () => {
  test("Popover takes focus, closes on Escape and gives focus back", async ({ page }) => {
    const checked = await open(page, "behaviour-popover");
    const trigger = page.getByRole("button", { name: "the details" });
    await expect(page.getByText("Hidden content")).toHaveCount(0);
    await trigger.click();
    const panel = page.getByRole("dialog", { name: "the details" });
    await expect(panel).toBeVisible();
    await expect(panel).toContainText("Hidden content");
    expect(await panel.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await checked();
  });

  test("a button inside Popover runs its action", async ({ page }) => {
    const checked = await open(page, "behaviour-popover");
    await page.getByRole("button", { name: "the details" }).click();
    await page.getByRole("button", { name: "Inside" }).click();
    expect(await actionCount(page)).toBe(0);
    await checked();
  });

  test("a map pin selects its place", async ({ page }) => {
    const checked = await open(page, "map");
    const pin = page.getByRole("button", { name: "Coit Tower" });
    await expect(pin).not.toHaveAttribute("aria-pressed", "true");
    await pin.click();
    await expect(pin).toHaveAttribute("aria-pressed", "true");
    await expect(main(page)).toContainText("Starting at Coit Tower");
    await checked();
  });

  test("the map's Expand dialog traps focus, locks scroll and closes on Escape", async ({
    page,
  }) => {
    const checked = await open(page, "map");
    const expand = page.getByRole("button", { name: "Expand" });
    await expand.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const scrollLocked = () =>
      page.evaluate(() => getComputedStyle(document.body).overflow === "hidden");
    expect(await scrollLocked()).toBe(true);
    const focusInside = () =>
      dialog.evaluate((element) => element.contains(document.activeElement));
    expect(await focusInside()).toBe(true);
    for (let press = 0; press < 15; press++) {
      await page.keyboard.press(press % 2 ? "Tab" : "Shift+Tab");
      expect(await focusInside(), `focus after ${press + 1} tab presses`).toBe(true);
    }
    for (let press = 0; press < 15; press++) await page.keyboard.press("Tab");
    expect(await focusInside()).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    expect(await scrollLocked()).toBe(false);
    await expect(expand).toBeFocused();
    await checked();
  });
});

test.describe("study tools", () => {
  test("Timer counts down, pauses, resets and reaches zero", async ({ page }) => {
    await page.clock.install();
    const checked = await open(page, "timer");
    await expect(main(page)).toContainText("3:00");
    await page.getByRole("button", { name: "Start" }).click();
    await page.clock.runFor(5_000);
    await expect(main(page)).toContainText("2:55");
    await page.getByRole("button", { name: "Pause" }).click();
    await page.clock.runFor(5_000);
    await expect(main(page)).toContainText("2:55");
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(main(page)).toContainText("3:00");
    await page.getByRole("button", { name: "Green · 2 min" }).click();
    await expect(main(page)).toContainText("2:00");
    await page.getByRole("button", { name: "Start" }).click();
    await page.clock.runFor(121_000);
    await expect(main(page)).toContainText("Ready.");
    await expect(main(page)).toContainText("0:00");
    await checked();
  });

  test("Flashcard flips to its back and back again", async ({ page }) => {
    const checked = await open(page, "flashcards");
    const card = page.getByRole("button", { name: /la cuchara/ });
    await expect(card).toHaveAttribute("aria-pressed", "false");
    await expect(card).not.toHaveAccessibleName(/the spoon/);
    await card.click();
    await expect(card).toHaveAttribute("aria-pressed", "true");
    await expect(card).toHaveAccessibleName(/the spoon/);
    await card.click();
    await expect(card).toHaveAttribute("aria-pressed", "false");
    await expect(card).not.toHaveAccessibleName(/the spoon/);
    await checked();
  });

  test("Carousel scrolls with its arrows", async ({ page }) => {
    const checked = await open(page, "flashcards");
    const scrolled = () =>
      page.getByRole("button", { name: /la cuchara/ }).evaluate((card) => {
        let node = card.parentElement;
        while (
          node &&
          !(node.scrollWidth > node.clientWidth && getComputedStyle(node).overflowX !== "visible")
        ) {
          node = node.parentElement;
        }
        return node?.scrollLeft ?? null;
      });
    expect(await scrolled()).toBe(0);
    await page.getByRole("button", { name: "Next" }).click();
    await expect.poll(scrolled).toBeGreaterThan(0);
    await page.getByRole("button", { name: /prev/i }).click();
    await expect.poll(scrolled).toBe(0);
    await checked();
  });

  test("the quiz scores answers, finishes and starts again with @Reset", async ({ page }) => {
    const checked = await open(page, "flashcards");
    await page.getByRole("button", { name: "the pot" }).click();
    await expect(main(page)).toContainText("Question 2 of 4");
    await expect(main(page)).toContainText("Score 0");
    await expect(main(page)).toContainText("Last answer: the pot");
    for (const answer of ["the fork", "the fridge", "the pot"]) {
      await page.getByRole("button", { name: answer, exact: true }).click();
    }
    await expect(main(page)).toContainText("You got 3 of 4");
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(main(page)).toContainText("Question 1 of 4");
    await expect(main(page)).toContainText("Score 0");
    await expect(main(page)).not.toContainText("Last answer");
    for (const answer of ["the frying pan", "the fork", "the fridge", "the pot"]) {
      await page.getByRole("button", { name: answer, exact: true }).click();
    }
    await expect(main(page)).toContainText("Perfect, 4 of 4!");
    await checked();
  });

  test("the steps viewer moves with its buttons and its strip", async ({ page }) => {
    const checked = await open(page, "example-steps");
    const back = page.getByRole("button", { name: "Back", exact: true });
    const next = page.getByRole("button", { name: "Next step" });
    await expect(main(page)).toContainText("Step 1 of 4");
    await expect(back).toBeDisabled();
    await next.click();
    await expect(main(page)).toContainText("Step 2 of 4");
    await expect(main(page)).toContainText("50% done");
    await expect(back).toBeEnabled();
    await main(page).getByText("4. Nail on the back").click();
    await expect(main(page)).toContainText("Step 4 of 4");
    await expect(main(page)).toContainText("Nail on the back");
    await expect(next).toBeDisabled();
    await back.click();
    await expect(main(page)).toContainText("Step 3 of 4");
    await checked();
  });
});
