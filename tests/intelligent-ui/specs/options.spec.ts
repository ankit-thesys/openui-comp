import { expect, test } from "@playwright/test";
import type { Host } from "../harness/matrix";
import { failures, render } from "../harness/render";

/**
 * f867a6c9: RadioGroup, Select and SegmentedControl take options written loosely, as a model
 * writes them. A number or a label-only object shows its text; a null value renders with no React
 * error (the sweep's console check would catch one); an option with neither value nor label is
 * dropped rather than drawn blank.
 */
const host = () => test.info().project.metadata["host"] as Host;

test("loose options render as labelled choices", async ({ page }) => {
  const rendered = await render(page, host(), "regression-loose-options");
  expect(await failures(rendered)).toEqual([]);

  const size = page.getByRole("group", { name: "Size" });
  for (const label of ["13", "15", "16"]) {
    await expect(size.getByRole("radio", { name: label, exact: true })).toBeVisible();
  }
  await expect(size.getByRole("radio", { name: "15", exact: true })).toBeChecked();

  // SegmentedControl's segments are radios named by their text.
  for (const label of ["1", "2", "3"]) {
    await expect(page.getByRole("radio", { name: label, exact: true })).toBeVisible();
  }
  await expect(page.getByRole("radio", { name: "2", exact: true })).toBeChecked();
  await expect(page.getByRole("combobox", { name: "Pick" })).toHaveText("Medium");

  const seat = page.getByRole("group", { name: "Seat" });
  await expect(seat.getByRole("radio")).toHaveCount(2);
  await expect(seat.getByRole("radio", { name: "No preference" })).toBeChecked();
  await seat.getByRole("radio", { name: "Aisle" }).click();
  await expect(seat.getByRole("radio", { name: "Aisle" })).toBeChecked();
  expect(rendered.console).toEqual([]);
});
