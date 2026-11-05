import { expect, test, type Page } from "@playwright/test";
import { currentHost, onlyOnBehaviourHosts } from "../harness/behaviour-host";
import { failures, render } from "../harness/render";

/**
 * #203: the actions. Since ce5fbf80 the library defines none of its own: @Set and @Reset run inside
 * the Renderer, and every other action reaches the host's onAction as written, as the README says.
 */
const host = currentHost;

test.beforeEach(onlyOnBehaviourHosts);

const main = (page: Page) => page.locator("main");
const actions = (page: Page) => page.evaluate(() => window.__iu.actions);

async function open(page: Page, program: string) {
  const rendered = await render(page, host(), program);
  expect(await failures(rendered)).toEqual([]);
  return async () => {
    rendered.state = await page.evaluate(() => window.__iu);
    expect(await failures(rendered), `${program} after the actions`).toEqual([]);
  };
}

test("the prompt's shopping list rescales, ticks and clears", async ({ page }) => {
  // ce5fbf80 swapped this example's copy button for one that clears the ticks.
  const checked = await open(page, "example-list");
  const clear = page.getByRole("button", { name: "Clear ticks" });
  await expect(clear).toBeDisabled();
  await page.getByRole("button", { name: "More" }).click();
  await expect(main(page)).toContainText("Pasta night for 5 guests");
  // 400 g and 80 g for four guests, scaled to five and rounded.
  await expect(main(page)).toContainText("500 g spaghetti");
  await page.getByText("100 g parmesan").click();
  await expect(clear).toBeEnabled();
  await clear.click();
  await expect(clear).toBeDisabled();
  // @Set runs inside the Renderer; nothing reaches the host.
  expect(await actions(page)).toEqual([]);
  await checked();
});

test("@OpenUrl is passed on to the host with its URL", async ({ page }) => {
  const checked = await open(page, "behaviour-actions");
  const before = page.url();
  const popups: string[] = [];
  page.context().on("page", (popup) => popups.push(popup.url()));
  await page.getByRole("button", { name: "Open docs" }).click();
  expect(await actions(page)).toEqual([
    expect.objectContaining({
      type: "open_url",
      params: { url: "https://example.com/docs" },
    }),
  ]);
  // Opening it is the host's job: the library neither navigates nor opens a window.
  expect(page.url()).toBe(before);
  expect(popups).toEqual([]);
  await checked();
});

test("@ToAssistant and a plain button are passed on to the host", async ({ page }) => {
  const checked = await open(page, "behaviour-actions");
  await page.getByRole("button", { name: "Ask" }).click();
  await page.getByRole("button", { name: "Just a label" }).click();
  expect(await actions(page)).toEqual([
    expect.objectContaining({
      type: "continue_conversation",
      humanFriendlyMessage: "Tell me more",
      params: { context: { id: 7 } },
    }),
    expect.objectContaining({
      type: "continue_conversation",
      humanFriendlyMessage: "Just a label",
      params: {},
    }),
  ]);
  await checked();
});

test("@Reset puts $variables back to their declared values", async ({ page }) => {
  const checked = await open(page, "behaviour-actions");
  await expect(main(page)).toContainText("Count 0, name Ada");
  await page.getByRole("button", { name: "Add" }).click();
  await page.getByRole("button", { name: "Add" }).click();
  await expect(main(page)).toContainText("Count 2, name Grace");
  await page.getByRole("button", { name: "Start over" }).click();
  await expect(main(page)).toContainText("Count 0, name Ada");
  // @Set and @Reset run inside the Renderer; nothing reaches the host.
  expect(await actions(page)).toEqual([]);
  await checked();
});

test("@Reset restores a checklist's declared ticks", async ({ page }) => {
  const checked = await open(page, "checklist");
  await expect(main(page)).toContainText("2/6 packed");
  await page.getByRole("checkbox", { name: "Relaxed Oxford shirt" }).click();
  await page.getByRole("checkbox", { name: "The everyday tee" }).click();
  await expect(main(page)).toContainText("2/6 packed");
  await page.getByRole("checkbox", { name: "Everywhere tote" }).click();
  await expect(main(page)).toContainText("3/6 packed");
  await page.getByRole("button", { name: "Clear" }).click();
  await expect(main(page)).toContainText("2/6 packed");
  await expect(page.getByRole("checkbox", { name: "The everyday tee" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Relaxed Oxford shirt" })).not.toBeChecked();
  await checked();
});
