import { library, ThemeProvider } from "@openuidev/dashboard-library";
import { Renderer } from "@openuidev/react-lang";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { EXAMPLES } from "./fixtures/examples";

let host: HTMLDivElement;
let root: Root;
let errors: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div");
  host.style.width = "1200px";
  document.body.append(host);
  root = createRoot(host);
  errors = vi.spyOn(console, "error");
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  const calls = [...errors.mock.calls];
  errors.mockRestore();
  expect(calls).toEqual([]);
});
async function settle(check: () => void) {
  await vi.waitFor(async () => {
    await act(async () => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    });
    check();
  });
}
async function click(element: Element) {
  expect(element).toBeTruthy();
  await act(async () => (element as HTMLElement).click());
}
const keyText = {
  retail: ["Revenue", "Where it sells", "Holiday targets", "Top products"],
  marketing: ["Spend", "Visitor journey", "Campaign efficiency", "Campaigns"],
  product: [
    "Weekly active users",
    "Weekly retention",
    "Adoption vs retention impact",
    "Feature adoption",
  ],
};
const headlines = { retail: "Revenue", marketing: "Spend", product: "Activation" };
// Where each example draws its previous period once Compare is on: Retail and Product have
// TimeSeries (a dashed previous line or area); Marketing has none, and marks the previous
// period on its Funnel's steps instead.
const previousMarks = {
  retail: ".recharts-line path[stroke-dasharray], .recharts-area path[stroke-dasharray]",
  marketing: ".openui-dashboard-funnel-prev",
  product: ".recharts-line path[stroke-dasharray], .recharts-area path[stroke-dasharray]",
};

for (const mode of ["light", "dark"] as const) {
  for (const example of EXAMPLES) {
    test(`${example.title} renders and filters in ${mode}`, async () => {
      await act(async () =>
        root.render(
          <ThemeProvider mode={mode}>
            <Renderer library={library} response={example.source} />
          </ThemeProvider>,
        ),
      );
      const slug = example.slug as keyof typeof keyText;
      const number = () =>
        host.querySelector(`[aria-label="${headlines[slug]}"] .openui-dashboard-kpi-value`)
          ?.textContent;
      const valid = () => {
        expect(host.textContent).not.toContain("This card couldn't be drawn");
        expect(host.querySelector('[data-state="invalid"]')).toBeNull();
      };
      await settle(() => {
        valid();
        for (const text of keyText[slug]) expect(host.textContent).toContain(text);
        expect(host.querySelector(".recharts-surface")).not.toBeNull();
        expect(number()).toBeTruthy();
      });
      const initial = number();
      // Every example starts at 30D and offers 90D.
      const period = host.querySelector('[role="radiogroup"][aria-label="Date range"]');
      expect(period).not.toBeNull();
      await click(
        [...period!.querySelectorAll('[role="radio"]')].find((node) => node.textContent === "90D")!,
      );
      await settle(() => {
        valid();
        expect(number()).toBeTruthy();
        expect(number()).not.toBe(initial);
      });
      // Compare is a dropdown with a portal. A chart legend must gain its Previous key,
      // and a chart must actually draw the previous period.
      const previousKeys = () =>
        [...host.querySelectorAll(".openui-dashboard-legend")].filter((node) =>
          node.textContent?.includes("Previous period"),
        );
      expect(previousKeys()).toHaveLength(0);
      await click(
        [...host.querySelectorAll(".openui-dashboard-filter-button")].find(
          (node) => node.textContent === "Compare",
        )!,
      );
      await click(
        [...document.querySelectorAll('[role="option"]')].find(
          (node) => node.textContent === "Previous period",
        )!,
      );
      await settle(() => {
        valid();
        expect(previousKeys().length).toBeGreaterThan(0);
        expect(host.querySelector(previousMarks[slug])).not.toBeNull();
      });
    });
  }
}
