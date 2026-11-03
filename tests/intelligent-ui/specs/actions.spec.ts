import { runLibraryAction } from "@openuidev/intelligent-ui-library";
import { expect, test, type Page } from "@playwright/test";
import type { Host } from "../harness/matrix";
import { failures, render } from "../harness/render";

/**
 * #203: the actions. The host's onAction follows the README: `runLibraryAction` first, and the host
 * runs whatever it returns null for. Each action record says which side ran it (`passedOn`).
 */
const host = () => test.info().project.metadata["host"] as Host;

const main = (page: Page) => page.locator("main");
const actions = (page: Page) => page.evaluate(() => window.__iu.actions);
const clipboard = (page: Page) => page.evaluate(() => navigator.clipboard.readText());

test.beforeEach(async ({ context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
});

async function open(page: Page, program: string) {
  const rendered = await render(page, host(), program);
  expect(await failures(rendered)).toEqual([]);
  return async () => {
    rendered.state = await page.evaluate(() => window.__iu);
    expect(await failures(rendered), `${program} after the actions`).toEqual([]);
  };
}

test("@CopyToClipboard copies its text, and the library runs it", async ({ page }) => {
  const checked = await open(page, "behaviour-actions");
  await page.evaluate(() => navigator.clipboard.writeText("before"));
  await page.getByRole("button", { name: "Copy note" }).click();
  await expect.poll(() => clipboard(page)).toBe("copied text");
  expect(await actions(page)).toEqual([
    expect.objectContaining({
      type: "CopyToClipboard",
      params: { text: "copied text" },
      passedOn: false,
    }),
  ]);
  await checked();
});

test("@CopyToClipboard copies a list built from state", async ({ page }) => {
  const checked = await open(page, "example-list");
  await page.getByRole("button", { name: "More" }).click();
  await expect(main(page)).toContainText("Pasta night for 5 guests");
  await page.getByRole("button", { name: "Copy list" }).click();
  // 400 g, 6 and 80 g for four guests, scaled to five and rounded.
  await expect.poll(() => clipboard(page)).toBe("500 g spaghetti\n8 tomatoes\n100 g parmesan");
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
      passedOn: true,
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
      passedOn: true,
    }),
    expect.objectContaining({
      type: "continue_conversation",
      humanFriendlyMessage: "Just a label",
      params: {},
      passedOn: true,
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

test.describe("runLibraryAction, from the root export", () => {
  const event = (type: string, params: Record<string, unknown> = {}) => ({
    type,
    params,
    humanFriendlyMessage: "",
  });

  test("returns null for every action that isn't the library's", () => {
    for (const type of ["continue_conversation", "open_url", "reset", "SomethingElse"]) {
      expect(
        runLibraryAction(event(type, { url: "https://example.com", text: "x" })),
        type,
      ).toBeNull();
    }
  });

  test("answers false for a CopyToClipboard without text", async () => {
    await expect(runLibraryAction(event("CopyToClipboard", { text: 5 }))!).resolves.toBe(false);
  });
});
