import { expect, test } from "@playwright/test";

for (const layer of [false, true]) {
  for (const duringRender of [false, true]) {
    test(`${duringRender ? "render" : "lazy module"} registrations are styled on first layout (${layer ? "layered" : "unlayered"})`, async ({
      page,
    }) => {
      const params = new URLSearchParams();
      if (layer) params.set("layer", "1");
      if (duringRender) params.set("render", "1");
      await page.goto(`/lazy-sheet.html?${params}`);
      const measured = page.getByTestId("measured");
      await expect(measured).toHaveAttribute("data-first-layout");
      const first = JSON.parse((await measured.getAttribute("data-first-layout"))!);
      expect(first).toEqual({
        width: 153,
        height: 47,
        padding: "9px",
        animation: first.expectedAnimation,
        expectedAnimation: expect.stringMatching(/^go\d+$/),
        keyframesWritten: true,
        layered: layer,
      });
    });
  }
}
