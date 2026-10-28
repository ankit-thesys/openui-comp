// Theme bench: mode switching restyles the bench app in place, a dark first paint matches toggled
// dark, portalled content follows the mode, and a nested ThemeProvider stays scoped. Runs in this
// package and in @openuidev/react-ui for comparison.
import { expect, test } from "@playwright/test";
import { openBench, PACKAGES } from "./bench/app";
import { darkFirstPaint, portalTheme, snapshot, toggleMode, toggleRoundTrip } from "./bench/theme";

// Relative lightness of a computed colour, enough to order dark below light: L of oklch()/oklab()
// (a percentage or a 0–1 number), or luminance of rgb()/rgba().
const lightness = (colour: string) => {
  const n = colour.match(/-?[\d.]+%?/g) ?? [];
  if (/^ok(lch|lab)\(/.test(colour)) {
    const l = n[0]!;
    return l.endsWith("%") ? parseFloat(l) / 100 : parseFloat(l);
  }
  if (!/^rgba?\(/.test(colour)) throw new Error(`Unexpected colour ${colour}`);
  const [r, g, b] = n.map(parseFloat) as [number, number, number];
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};

for (const pkg of PACKAGES) {
  test.describe(pkg, () => {
    test("mode toggle light → dark → light restyles in place", async ({ page }) => {
      const { light, dark, back } = await toggleRoundTrip(page, pkg);
      expect(dark.secondary).not.toEqual(light.secondary);
      expect(back).toEqual(light);
    });

    test("a dark first paint matches toggled dark", async ({ page }) => {
      await openBench(page, pkg, "light");
      await toggleMode(page, "dark");
      const toggled = await snapshot(page);
      expect(await darkFirstPaint(page, pkg)).toEqual(toggled);
    });

    test("portalled Select content follows the active mode", async ({ page }) => {
      const { light, dark } = await portalTheme(page, pkg);
      expect(lightness(dark.background)).toBeLessThan(lightness(light.background));
    });

    test("a nested ThemeProvider override stays scoped", async ({ page }) => {
      await openBench(page, pkg, "light");
      const probes = await snapshot(page);
      expect(probes.nestedPrimary).not.toEqual(probes.primary);
    });
  });
}
