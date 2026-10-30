import { defaultDarkTheme, defaultLightTheme, ThemeProvider } from "@openuidev/react-components";
import { Renderer } from "@openuidev/react-lang";
import { afterEach, describe, expect, it } from "vitest";
import { ShellCard, SmallCardMetric } from "../..";
import { openuiDashboardLibrary } from "../../lib";
import { cases } from "../helpers/cases";
import {
  box,
  byText,
  cleanup,
  one,
  renderCase,
  renderNode,
  renderProgram,
  settle,
  style,
} from "../helpers/render";

afterEach(cleanup);

const GREEN = "oklch(0.448 0.108 151.328)";
const RED = "oklch(0.505 0.19 27.518)";

/** Values from comparing the kit with genui-sdk's dashboard, which it was ported from. */
describe("matches genui-sdk", () => {
  it("overview card numbers use the dashboard's sizes", async () => {
    const container = await renderCase("cards");
    expect(style(byText(container, "$48.2K")).fontSize).toBe("24px");
    expect(style(byText(container, "$48.2K")).fontWeight).toBe("500");
    const card = one(container, ".openui-overview-card-block-card");
    expect(style(one(card, ".openui-metric-indicator-trend")).fontSize).toBe("14px");
    expect(style(one(card, ".openui-metric-indicator-subtext")).fontSize).toBe("14px");
  });

  it("MetricIndicator and SmallCard numbers use the dashboard's sizes", async () => {
    const metric = await renderCase("example-2");
    expect(style(byText(metric, "$48.2K")).fontSize).toBe("24px");
    const card = await renderCase("example-1");
    expect(style(byText(card, "$1.2M")).fontSize).toBe("24px");
    expect(style(byText(card, "$1.2M")).fontWeight).toBe("500");
  });

  it("text uses the dashboard's denser scale", async () => {
    const container = await renderCase("example-1");
    const subtitle = one(container, ".openui-dashboard-header-subtitle");
    expect(style(subtitle).fontSize).toBe("14px");
    expect(style(subtitle).fontFamily).toContain("Inter");
    expect(style(one(container, ".openui-dashboard-header-title")).fontSize).toBe("28px");
  });

  it("filters keep their size", async () => {
    const container = await renderCase("filters");
    expect(box(one(container, ".openui-dashboard-filter-select")).width).toBe(180);
    expect(box(one(container, ".openui-dashboard-filter-select-trigger--single")).height).toBe(32);
    expect(style(one(container, ".openui-dashboard-filter-select-label")).fontSize).toBe("13px");
    expect(box(one(container, ".openui-date-picker-trigger")).height).toBe(32);
    expect(box(one(container, ".openui-date-picker")).width).toBe(180);
  });
});

describe("overrides of react-components win", () => {
  it.each([
    ["small", "--openui-space-m-l", "--openui-radius-3xl"],
    ["medium", "--openui-space-l", "--openui-radius-4xl"],
    ["large", "--openui-space-l", "--openui-radius-3xl"],
  ] as const)("a %s card gets its padding and radius", async (size, padding, radius) => {
    const container = await renderNode(<ShellCard size={size}>Body</ShellCard>);
    const card = one(container, ".openui-dashboard-shell-card");
    const camel = (name: string) =>
      name.replace("--openui-", "").replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
    const theme = defaultLightTheme as Record<string, string>;
    expect(style(card).paddingTop).toBe(theme[camel(padding)]);
    expect(style(card).borderTopLeftRadius).toBe(theme[camel(radius)]);
  });

  it("overview cards fit their grid cell", async () => {
    const container = await renderCase("cards");
    const cards = [...container.querySelectorAll(".openui-overview-card-block-card")];
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      expect(style(card).boxSizing).toBe("border-box");
      expect(box(card).right).toBeLessThanOrEqual(box(card.parentElement!).right + 1);
    }
  });

  it("tags in a table are only as wide as their text", async () => {
    const container = await renderProgram(`root = Dashboard([s])
s = Section([r])
r = CardRow([a])
a = MediumCard([Table([c])])
c = Col("Status", [Tag("Open")])`);
    const tag = one(container, ".openui-table-cell .openui-tag");
    expect(box(tag).width).toBeLessThan(box(tag.closest(".openui-table-cell")!).width);
  });
});

describe("colours", () => {
  // Goober reuses a class for identical rule text. A kit rule matching this tone's text once moved
  // it ahead of the base colour, and the green text turned grey.
  it("TextBlock's positive tone stays green", async () => {
    const container = await renderCase("primitives");
    expect(style(byText(container, "3.4x target")).color).toBe(GREEN);
  });

  it("a SmallCard trend follows its direction", async () => {
    const container = await renderNode(
      <>
        <SmallCardMetric title="Up" metric="1" trend={{ direction: "up", value: 5 }} />
        <SmallCardMetric title="Down" metric="2" trend={{ direction: "down", value: 5 }} />
        <SmallCardMetric title="Flat" metric="3" trend={{ value: 5 }} />
      </>,
    );
    const trends = [...container.querySelectorAll(".openui-dashboard-small-card-trend")];
    expect(trends.map((trend) => style(trend).color)).toEqual([
      GREEN,
      RED,
      "oklch(0.097 0 0 / 0.6)",
    ]);
  });

  it("dark mode changes colours and keeps the dashboard's text sizes", async () => {
    const program = cases.find(({ id }) => id === "example-1")!.program;
    const container = await renderNode(
      <ThemeProvider mode="dark">
        <Renderer response={program} library={openuiDashboardLibrary} />
      </ThemeProvider>,
    );
    await settle();
    const scope = style(one(container, ".openui-dashboard-theme"));
    expect(scope.getPropertyValue("--openui-foreground")).toBe(defaultDarkTheme.foreground);
    expect(style(one(container, ".openui-dashboard-header-subtitle")).fontSize).toBe("14px");
  });

  it("every token resolves to a value from react-components when not themed", async () => {
    const container = await renderCase("example-1");
    const scope = style(one(container, ".openui-dashboard-theme"));
    expect(scope.getPropertyValue("--openui-space-m")).toBe(defaultLightTheme.spaceM);
    expect(scope.getPropertyValue("--openui-foreground")).toBe(defaultLightTheme.foreground);
  });
});

describe("consumers", () => {
  it("can override a part with a plain class in a later stylesheet", async () => {
    const container = await renderCase("filters");
    const sheet = document.head.appendChild(document.createElement("style"));
    sheet.textContent = `
      .openui-dashboard-section-rows { row-gap: 3px; }
      .openui-dashboard-filter-select-label { color: rgb(1, 2, 3); }
    `;
    try {
      expect(style(one(container, ".openui-dashboard-section-rows")).rowGap).toBe("3px");
      expect(style(one(container, ".openui-dashboard-filter-select-label")).color).toBe(
        "rgb(1, 2, 3)",
      );
    } finally {
      sheet.remove();
    }
  });
});

/**
 * A record of what the browser computes for every kit and shared element in every program, one line
 * for each distinct class and style. Sizes that depend on text measurement are left out so it holds
 * across platforms. When a difference is intended, run `pnpm test:update` and review the diff.
 */
describe("computed style baseline", () => {
  /** Properties shown only when they differ from these browser defaults. */
  const DEFAULTS = {
    display: "block",
    flexDirection: "row",
    alignItems: "normal",
    justifyContent: "normal",
    rowGap: "normal",
    columnGap: "normal",
    paddingTop: "0px",
    paddingRight: "0px",
    paddingBottom: "0px",
    paddingLeft: "0px",
    marginTop: "0px",
    marginBottom: "0px",
    borderTopWidth: "0px",
    borderTopLeftRadius: "0px",
    backgroundColor: "rgba(0, 0, 0, 0)",
    boxShadow: "none",
    textOverflow: "clip",
    whiteSpace: "normal",
    boxSizing: "content-box",
  } as const;
  const ALWAYS = [
    "color",
    "fontFamily",
    "fontSize",
    "fontWeight",
    "fontVariationSettings",
    "lineHeight",
    "letterSpacing",
  ] as const;

  it("has not changed", async () => {
    const lines = new Set<string>();

    for (const { program } of cases) {
      const container = await renderProgram(program);
      for (const element of container.querySelectorAll<HTMLElement>("[class]")) {
        if (element instanceof SVGElement) continue;
        const stable = [...element.classList].filter((name) => !/^go\d+$/.test(name)).sort();
        if (!stable.length || !stable[0]!.startsWith("openui-")) continue;

        const computed = style(element);
        const values = [
          ...ALWAYS.map((name) => `${name}: ${computed[name]}`),
          ...Object.entries(DEFAULTS)
            .filter(([name, value]) => computed[name as keyof typeof DEFAULTS] !== value)
            .map(([name]) => `${name}: ${computed[name as keyof typeof DEFAULTS]}`),
        ];
        if (computed.borderTopWidth !== "0px") {
          values.push(`borderTopColor: ${computed.borderTopColor}`);
        }
        lines.add(`${stable.join(" ")} { ${values.join("; ")} }`);
      }
      cleanup();
    }

    await expect(`${[...lines].sort().join("\n")}\n`).toMatchFileSnapshot(
      "./__snapshots__/computed-styles.txt",
    );
  });
});
