// react-ui parity bench: the bench app's theme observations (probe colours and radii through a
// mode round trip, nested provider included, a dark first paint and portalled Select content)
// match @openuidev/react-ui's computed styles. Class names may differ; computed styles may not.
import { expect, test } from "@playwright/test";
import { darkFirstPaint, portalTheme, toggleRoundTrip } from "./bench/theme";

test("mode round trip matches react-ui", async ({ page }) => {
  expect(await toggleRoundTrip(page, "react-components")).toEqual(
    await toggleRoundTrip(page, "react-ui"),
  );
});

test("dark first paint matches react-ui", async ({ page }) => {
  expect(await darkFirstPaint(page, "react-components")).toEqual(
    await darkFirstPaint(page, "react-ui"),
  );
});

test("portalled Select content matches react-ui in both modes", async ({ page }) => {
  expect(await portalTheme(page, "react-components")).toEqual(await portalTheme(page, "react-ui"));
});
