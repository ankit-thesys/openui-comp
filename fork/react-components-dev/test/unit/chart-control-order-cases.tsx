// Public SSR CSS must preserve the chart controls on a fresh import, without a prior Button render.
// Run after build: pnpm exec vitest run test/unit/chart-control-order.test.tsx.
import {
  Button,
  IconButton,
  LineChart,
  ThemeProvider,
  configureStyles,
  getComponentStyles,
} from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it } from "vitest";

afterEach(() => configureStyles({ layer: undefined }));

const data = Array.from({ length: 25 }, (_, i) => ({
  month: `Month ${i}`,
  ...Object.fromEntries(Array.from({ length: 9 }, (_, j) => [`series${j}`, i + j])),
}));
const declarationsOn = (html: string, stable: string, sheet: string) => {
  const classes =
    html.match(new RegExp(`class="([^"]*\\b${stable}(?: [^"]*)?)"`))?.[1]?.split(/\s+/) ?? [];
  return [...sheet.matchAll(/\.(go\d+)\{([^{}]*)\}/g)]
    .filter(([, name]) => classes.includes(name!))
    .flatMap(([, , body]) => body!.split(";").filter(Boolean));
};

export function describeChartControlOrder(preload: boolean) {
  for (const layer of [undefined, "openui"]) {
    it(`preserves chart-specific control declarations in ${layer ?? "default"} mode`, () => {
      configureStyles({ layer });
      if (preload)
        renderToString(
          <ThemeProvider>
            <Button size="small">Primer</Button>
            <IconButton icon={<svg />} />
          </ThemeProvider>,
        );
      const html = renderToString(
        <ThemeProvider>
          <LineChart data={data} categoryKey="month" width={240} height={260} />
        </ThemeProvider>,
      );
      const sheet = getComponentStyles();
      const scroll = declarationsOn(html, "openui-scroll-buttons-horizontal-left", sheet);
      expect(scroll.filter((value) => value.startsWith("background-color:")).at(-1)).toContain(
        "var(--openui-foreground,",
      );
      const toggle = declarationsOn(html, "openui-default-legend-toggle-button", sheet);
      expect(toggle.filter((value) => value.startsWith("font:")).at(-1)).toContain(
        "var(--openui-text-label-sm,",
      );
      expect(toggle.filter((value) => /^padding(?:-left)?:/.test(value)).at(-1)).toBe(
        "padding:calc(var(--openui-space-s, 8px) - 1.75px) var(--openui-space-s-m, 10px)",
      );
    });
  }
}
