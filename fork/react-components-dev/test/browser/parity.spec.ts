// Regression for #103: SVG groups must be measured after their descendants settle.
import { expect, test } from "@playwright/test";
import { snapshot } from "./parity/parity";

test("parity settles unnamed descendants before measuring case and portal groups", async ({
  page,
}) => {
  await page.route("**/parity-animation-order.html?*", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html>
        <style>
          @keyframes grow { from { transform: scaleY(0.25); } to { transform: scaleY(1); } }
          rect { animation: grow 60s linear both paused; transform-origin: 0 0; }
        </style>
        <svg width="100" height="100"
          data-parity-case="animated-svg"
          data-parity-parts='{"bars":"g"}'
          data-parity-global-parts='{"portal":"#portal"}'>
          <g data-parity-part="group"><rect width="100" height="100" /></g>
        </svg>
        <svg width="100" height="100">
          <g id="portal"><rect width="100" height="100" /></g>
        </svg>`,
    }),
  );

  const observations = await snapshot(page, "parity-animation-order", "light");
  expect(Object.keys(observations)).toEqual([
    "light animated-svg rest",
    "light animated-svg hover",
    "light animated-svg active",
  ]);
  for (const observation of Object.values(observations)) {
    expect(observation["group.height"]).toBe("100.00");
    expect(observation["bars.height"]).toBe("100.00");
    expect(observation["portal.height"]).toBe("100.00");
  }
});
