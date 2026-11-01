// Theme observations on the bench app: computed styles of probe elements, shared by the theme
// bench (each package on its own) and the react-ui parity bench (both packages compared).
import { expect, type Page } from "@playwright/test";
import { openBench, type Mode, type Package } from "./app";

const settle = (page: Page) =>
  page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation instanceof CSSTransition)
        .map((animation) => animation.finished.catch(() => undefined)),
    ),
  );

/** Computed colours and radii of the bench app's probes once transitions have finished. */
export const snapshot = async (page: Page) => {
  await settle(page);
  await page.waitForTimeout(250);
  await settle(page);
  const probes = await page.evaluate(() => {
    const style = (el: Element | null, ...properties: string[]) =>
      el
        ? Object.fromEntries(properties.map((p) => [p, getComputedStyle(el).getPropertyValue(p)]))
        : null;
    const q = (selector: string) => document.querySelector(selector);
    return {
      mode: q("[data-testid=theme-mode]")?.textContent,
      body: style(document.body, "background-color", "color"),
      primary: style(
        q("[data-testid=probe-button] button"),
        "background-color",
        "color",
        "border-radius",
      ),
      secondary: style(
        q("[data-testid=probe-button] button:nth-of-type(2)"),
        "background-color",
        "color",
      ),
      card: style(
        q("[data-testid=probe-card] > *"),
        "background-color",
        "border-color",
        "border-radius",
      ),
      nestedPrimary: style(q("[data-testid=nested] button"), "background-color", "color"),
    };
  });
  // A probe that matches nothing would compare equal across packages; fail instead.
  for (const [probe, value] of Object.entries(probes)) expect(value, probe).toBeTruthy();
  return probes;
};

export const toggleMode = async (page: Page, to: Mode) => {
  await page.getByTestId("toggle-mode").click();
  await expect(page.getByTestId("theme-mode")).toHaveText(to);
};

/** Light, toggled dark and toggled back to light, from a light first paint. */
export async function toggleRoundTrip(page: Page, pkg: Package) {
  await openBench(page, pkg, "light");
  const light = await snapshot(page);
  await toggleMode(page, "dark");
  const dark = await snapshot(page);
  await toggleMode(page, "light");
  const back = await snapshot(page);
  return { light, dark, back };
}

/** A dark first paint, server-rendered with mode="dark". */
export async function darkFirstPaint(page: Page, pkg: Package) {
  await openBench(page, pkg, "dark");
  return snapshot(page);
}

/** Select content's surface and text colour, opened in light and then in dark mode. */
export async function portalTheme(page: Page, pkg: Package) {
  await openBench(page, pkg, "light");
  const read = async () => {
    await page.getByTestId("select-trigger").click();
    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();
    const colours = await listbox.evaluate((el) => {
      // The styled surface may be the listbox or a wrapper around it.
      let surface: Element | null = el;
      while (surface && getComputedStyle(surface).backgroundColor === "rgba(0, 0, 0, 0)")
        surface = surface.parentElement;
      return {
        background: surface ? getComputedStyle(surface).backgroundColor : "none",
        color: getComputedStyle(el).color,
      };
    });
    await page.keyboard.press("Escape");
    return colours;
  };
  const light = await read();
  await toggleMode(page, "dark");
  const dark = await read();
  return { light, dark };
}
