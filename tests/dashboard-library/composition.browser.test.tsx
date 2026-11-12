// Use the public library from source so host overrides share its context instances.
import { Renderer } from "@openuidev/react-lang";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { library, ThemeProvider } from "../../packages/libraries/dashboard/src/index";
import { CompareOverride } from "../../packages/libraries/dashboard/src/shared/compare";
import { StateOverride } from "../../packages/libraries/dashboard/src/shared/viewState";
import { compositionFixtures } from "./fixtures/composition";

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
async function draw(children: ReactNode) {
  await act(async () => root.render(children));
}
/**
 * Waits for the charts to measure. ResizeObserver (recharts' ResponsiveContainer, useWidth)
 * updates state when it fires; waiting inside act keeps those updates in it, where outside
 * they log "not wrapped in act" warnings depending on timing.
 */
async function settle(check: () => void) {
  // One frame at a time inside act, so React commits each measurement before the next check.
  await vi.waitFor(async () => {
    await act(async () => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    });
    check();
  });
}
const card = (inner: string) =>
  `root = Dashboard([Section("", [Row([Card("Composition", [${inner}], "full")])])])`;
const render = (inner: string) => <Renderer library={library} response={card(inner)} />;
const examples = [
  {
    name: "Donut",
    program: 'Donut(["Direct", "Search", "Email"], [60, 30, 10], "currency", "Revenue")',
    text: ["$100", "$60", "Direct", "Revenue"],
    marks: ".recharts-pie-sector",
    count: 6, // A thin arc and a textured inner band per part.
    empty: "Donut([], [])",
  },
  {
    name: "SegmentedBar",
    program: 'SegmentedBar(["Direct", "Search", "Email"], [60, 30, 10], "currency")',
    text: ["$60", "$30", "$10", "60%"],
    marks: ".openui-dashboard-seg",
    count: 3,
    empty: "SegmentedBar([], [])",
  },
  {
    name: "Treemap",
    program:
      'Treemap(["Coats", "Shoes", "Jeans"], [60, 30, 10], ["Clothing", "Footwear", "Clothing"], "currency")',
    text: ["Clothing", "Footwear", "$100", "$60"],
    marks: ".openui-dashboard-treemap-cell",
    count: 3,
    empty: "Treemap([], [])",
  },
  {
    name: "Waterfall",
    program: 'Waterfall(["Start", "New", "Lost"], [100, 30, -10], "currency", "Finish")',
    text: ["Start", "+$30", "-$10", "$120", "Finish"],
    marks: ".recharts-bar-rectangle",
    count: 4,
    empty: "Waterfall([], [])",
  },
  {
    name: "Funnel",
    program:
      'Funnel(["Started", "Verified", "Activated"], [1000, 600, 300], [800, 500, 200], "compact")',
    text: ["Started", "600", "300", "60%", "50%", "Biggest drop"],
    marks: ".openui-dashboard-funnel-step",
    count: 3,
    empty: "Funnel([], [])",
  },
  {
    name: "Flow",
    program:
      'Flow([{from: "Search", to: "Signed up", value: 600}, {from: "Search", to: "Exited", value: 400}], "compact")',
    text: ["Search", "Signed up", "Exited", "600", "400", "60%"],
    marks: ".recharts-sankey-nodes > .recharts-layer",
    count: 3,
    empty: "Flow([])",
  },
];

for (const mode of ["light", "dark"] as const) {
  for (const fixture of compositionFixtures) {
    test(`${fixture.name} catalog in ${mode}`, async () => {
      await draw(
        <ThemeProvider mode={mode}>
          <Renderer library={library} response={fixture.program} />
        </ThemeProvider>,
      );
      expect(host.textContent).toContain(fixture.text);
      expect(host.querySelector("[data-state=invalid]")).toBeNull();
    });
  }
  for (const example of examples) {
    test(`${example.name} values and marks in ${mode}`, async () => {
      await draw(<ThemeProvider mode={mode}>{render(example.program)}</ThemeProvider>);
      await settle(() => {
        expect(host.querySelectorAll(example.marks)).toHaveLength(example.count);
      });
      for (const text of example.text) expect(host.textContent).toContain(text);
      expect(host.querySelector("[data-state=invalid]")).toBeNull();
    });
    test(`${example.name} has no data in ${mode}`, async () => {
      await draw(<ThemeProvider mode={mode}>{render(example.empty)}</ThemeProvider>);
      const empty = host.querySelector(".openui-dashboard-card-body .openui-dashboard-empty")!;
      expect(empty.getAttribute("data-state")).toBe("empty");
      expect(empty.textContent).toContain("No data for this period");
      expect(host.querySelectorAll(example.marks)).toHaveLength(0);
    });
    for (const [state, text] of [
      ["loading", "Loading"],
      ["empty", "No data for this period"],
      ["error", "This data didn’t load"],
      ["no-results", "No matching data"],
    ] as const) {
      test(`${example.name} Card ${state} in ${mode}`, async () => {
        await draw(
          <ThemeProvider mode={mode}>
            <StateOverride value={state}>{render(example.program)}</StateOverride>
          </ThemeProvider>,
        );
        const frame = host.querySelector(".openui-dashboard-card-body .openui-dashboard-state")!;
        expect(frame.getAttribute("data-state")).toBe(state);
        expect(frame.querySelector(".openui-dashboard-state-layer")?.textContent).toContain(text);
        expect(
          getComputedStyle(frame.querySelector(".openui-dashboard-state-content")!).visibility,
        ).toBe("hidden");
      });
    }
  }

  test(`Funnel previous markers and rate switch in ${mode}`, async () => {
    const funnel = examples.find((example) => example.name === "Funnel")!.program;
    const view = (enabled: boolean) => (
      <ThemeProvider mode={mode}>
        <CompareOverride value={enabled}>{render(funnel)}</CompareOverride>
      </ThemeProvider>
    );
    await draw(view(false));
    expect(host.querySelectorAll(".openui-dashboard-funnel-prev")).toHaveLength(0);
    await draw(view(true));
    expect(host.querySelectorAll(".openui-dashboard-funnel-prev")).toHaveLength(3);
    expect(host.textContent).toContain("Previous period");
    const row = host.querySelectorAll(".openui-dashboard-funnel-step")[1]!;
    await act(async () => {
      row.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientX: 30, clientY: 30 }));
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    });
    const tip = host.querySelector(".openui-dashboard-rowtip")!;
    expect(tip.textContent).toContain("Verified");
    expect(tip.textContent).toContain("500");
    expect(tip.textContent).toContain("600");
    expect(tip.textContent).toContain("Previous period");
    const fromStart = [...host.querySelectorAll<HTMLButtonElement>("[role=radio]")].find(
      (button) => button.textContent === "From start",
    )!;
    expect(fromStart.closest(".openui-dashboard-card-controls")).not.toBeNull();
    await act(async () => fromStart.click());
    expect(fromStart.getAttribute("aria-checked")).toBe("true");
    expect(host.querySelectorAll(".openui-dashboard-funnel-in")[1]?.textContent).toBe("30%");
    expect(host.querySelector(".openui-dashboard-funnel-flag")).toBeNull();
  });

  test(`Funnel shape responds to Card width in ${mode}`, async () => {
    const program =
      'Funnel(["Started", "Verified", "Activated"], [1000, 600, 300], [800, 500, 200], "compact", "funnel")';
    await draw(
      <ThemeProvider mode={mode}>
        <CompareOverride value={true}>{render(program)}</CompareOverride>
      </ThemeProvider>,
    );
    await settle(() => expect(host.querySelector(".openui-dashboard-funnel-shape")).not.toBeNull());
    expect(host.querySelectorAll(".openui-dashboard-funnel-heads > div")).toHaveLength(3);
    expect(
      host.querySelector(".openui-dashboard-funnel-plot svg g[stroke-dasharray]"),
    ).not.toBeNull();
    host.style.width = "300px";
    await settle(() =>
      expect(host.querySelectorAll(".openui-dashboard-funnel-step")).toHaveLength(3),
    );
  });
}

test("small parts fold into Other and unusable parts are named", async () => {
  const labels = '["A", "B", "C", "D", "E", "F", "G", "H", "I", "Zero"]';
  const values = "[90, 80, 70, 60, 50, 40, 30, 20, 10, 0]";
  for (const component of ["Donut", "SegmentedBar"]) {
    await draw(render(`${component}(${labels}, ${values})`));
    expect(host.textContent).toContain("Other");
    expect(host.querySelector(".openui-dashboard-part-note")?.textContent).toContain("Zero");
    expect(host.querySelectorAll(".openui-dashboard-parts-legend > div")).toHaveLength(8);
  }
});

test("Waterfall subtotal ignores its input and GoodWhen controls mark colors", async () => {
  for (const goodWhen of ["up", "down", "neutral"]) {
    await draw(
      render(
        `Waterfall(["Revenue", "Costs", "Subtotal", "Growth"], [100, -40, 999, 10], "currency", "Profit", "${goodWhen}", ["Subtotal"])`,
      ),
    );
    const rows = [...host.querySelectorAll("tbody tr")];
    expect(rows.map((row) => row.textContent)).toEqual([
      "Revenue$100",
      "Costs-$40",
      "Subtotal$60",
      "Growth+$10",
      "Profit$70",
    ]);
    const patterns = [...host.querySelectorAll("pattern")];
    const fill = (i: number) => patterns[i]!.querySelector("rect")!.getAttribute("fill");
    expect(fill(1)).toBe(
      `var(--openui-dashboard-${goodWhen === "neutral" ? "muted" : goodWhen === "up" ? "good" : "bad"}-mark)`,
    );
    expect(fill(2)).toBe(
      `var(--openui-dashboard-${goodWhen === "neutral" ? "muted" : goodWhen === "up" ? "bad" : "good"}-mark)`,
    );
  }
});

test("Flow skips back links and nonpositive links with a readable note", async () => {
  await draw(
    render(
      'Flow([{from: "Entry", to: "Converted", value: 12}, {from: "Converted", to: "Entry", value: 2}, {from: "Entry", to: "Exited", value: 0}])',
    ),
  );
  await settle(() =>
    expect(host.querySelectorAll(".recharts-sankey-nodes > .recharts-layer")).toHaveLength(2),
  );
  expect(host.textContent).toContain(
    "1 link not drawn, it loops back to an earlier step: Converted → Entry",
  );
  expect(host.textContent).toContain("1 link not drawn, zero or below or unnamed: Entry → Exited");
  expect(host.querySelectorAll(".recharts-sankey-links > .recharts-layer")).toHaveLength(1);
});

test("split Funnel draws one band per segment per step and suppresses previous", async () => {
  await draw(
    <CompareOverride value={true}>
      {render(
        'Funnel(["Started", "Verified", "Activated"], [100, 60, 30], [80, 50, 20], "number", "bars", [Series("Enterprise", [60, 40, 20]), Series("Self serve", [40, 20, 10])])',
      )}
    </CompareOverride>,
  );
  expect(host.querySelectorAll(".openui-dashboard-funnel-split > span")).toHaveLength(6);
  expect(host.querySelectorAll(".openui-dashboard-funnel-prev")).toHaveLength(0);
  expect(host.textContent).toContain("Enterprise");
  expect(host.textContent).toContain("Self serve");
  expect(host.textContent).not.toContain("Previous period");
  expect(host.querySelector("[data-state=invalid]")).toBeNull();
});

/** Recharts uses item mouse-enter for pies, treemaps and Sankey, and row charts use mousemove. */
async function hoverMark(mark: Element) {
  const box = mark.getBoundingClientRect();
  await act(async () => {
    mark.dispatchEvent(
      new MouseEvent("mouseover", { bubbles: true, clientX: box.left + 2, clientY: box.top + 2 }),
    );
    mark.dispatchEvent(
      new MouseEvent("mousemove", { bubbles: true, clientX: box.left + 2, clientY: box.top + 2 }),
    );
    await new Promise(requestAnimationFrame);
  });
  await expect.poll(() => host.querySelector(".openui-dashboard-tooltip")).not.toBeNull();
}

for (const mode of ["light", "dark"] as const) {
  for (const [name, inner, mark] of [
    [
      "Donut",
      'Donut(["A", "B"], [60, 40], "currency", "Revenue", [40, 60])',
      ".recharts-pie-sector",
    ],
    [
      "SegmentedBar",
      'SegmentedBar(["A", "B"], [60, 40], "currency", [40, 60])',
      ".openui-dashboard-seg",
    ],
    [
      "Treemap",
      'Treemap(["A", "B"], [60, 40], null, "currency", [40, 60])',
      ".openui-dashboard-treemap-cell",
    ],
  ] as const) {
    test(`${name} compares share in points with a dashed previous row in ${mode}`, async () => {
      const view = (enabled: boolean) => (
        <ThemeProvider mode={mode}>
          <CompareOverride value={enabled}>{render(inner)}</CompareOverride>
        </ThemeProvider>
      );
      await draw(view(false));
      await settle(() => expect(host.querySelector(mark)).not.toBeNull());
      await hoverMark(host.querySelector(mark)!);
      expect(host.querySelector(".openui-dashboard-tooltip")?.textContent).toContain("60%");
      expect(host.querySelector(".openui-dashboard-tooltip .openui-dashboard-delta")).toBeNull();
      const count = host.querySelectorAll(mark).length;
      await draw(view(true));
      await hoverMark(host.querySelector(mark)!);
      const tip = host.querySelector(".openui-dashboard-tooltip")!;
      const rows = tip.querySelectorAll(".openui-dashboard-tooltip-row");
      const share = rows[name === "Treemap" ? 1 : 0]!;
      expect(share.textContent).toBe("Share+20 pts60%");
      expect(share.querySelector(".openui-dashboard-delta-good")).not.toBeNull();
      expect(rows[rows.length - 1]?.textContent).toBe("Previous period40%");
      expect(rows[rows.length - 1]?.querySelector(".openui-dashboard-legend-line")).not.toBeNull();
      expect(host.querySelectorAll(mark)).toHaveLength(count);
      await draw(view(false));
      await hoverMark(host.querySelector(mark)!);
      expect(host.querySelector(".openui-dashboard-tooltip")?.textContent).not.toContain(
        "Previous period",
      );
    });
  }

  for (const name of ["Donut", "SegmentedBar"] as const) {
    test(`${name} compares folded Other and already-given shares in ${mode}`, async () => {
      // Nine shares total 100 now and before. H and I fold: 10 now, 20 before.
      const args = name === "Donut" ? ', "percent", null' : ', "percent"';
      await draw(
        <ThemeProvider mode={mode}>
          <CompareOverride value={true}>
            {render(
              `${name}(["A", "B", "C", "D", "E", "F", "G", "H", "I"], [30, 20, 10, 10, 10, 5, 5, 5, 5]${args}, [20, 20, 10, 10, 10, 5, 5, 10, 10])`,
            )}
          </CompareOverride>
        </ThemeProvider>,
      );
      const selector = name === "Donut" ? ".recharts-pie-sector" : ".openui-dashboard-seg";
      await settle(() =>
        expect(host.querySelectorAll(selector)).toHaveLength(name === "Donut" ? 16 : 8),
      );
      await hoverMark(host.querySelectorAll(selector)[7]!);
      const tip = host.querySelector(".openui-dashboard-tooltip")!;
      expect(tip.querySelector(".openui-dashboard-tooltip-title")?.textContent).toBe("Other");
      expect(tip.textContent).toContain("Share-10 pts10%");
      expect(tip.textContent).toContain("Previous period20%");
    });
  }

  test(`Flow compares links and steps, with fewer lost good, in ${mode}`, async () => {
    const inner =
      'Flow([{from: "Entry", to: "Converted", value: 60, previous: 40}, {from: "Entry", to: "Exited", value: 40, previous: 80}], "number")';
    const view = (enabled: boolean) => (
      <ThemeProvider mode={mode}>
        <CompareOverride value={enabled}>{render(inner)}</CompareOverride>
      </ThemeProvider>
    );
    await draw(view(true));
    await settle(() =>
      expect(host.querySelectorAll(".recharts-sankey-links > .recharts-layer")).toHaveLength(2),
    );
    const links = () => host.querySelectorAll(".recharts-sankey-links > .recharts-layer");
    await hoverMark(links()[1]!);
    let tip = host.querySelector(".openui-dashboard-tooltip")!;
    expect(tip.querySelector(".openui-dashboard-tooltip-title")?.textContent).toBe(
      "Entry → Exited",
    );
    let rows = tip.querySelectorAll(".openui-dashboard-tooltip-row");
    expect(rows[0]?.textContent).toBe("Entry-16.7%100");
    expect(rows[1]?.textContent).toBe("To Exited-50%40%40");
    expect(rows[1]?.querySelector(".openui-dashboard-delta-good")).not.toBeNull();
    expect(tip.textContent).toContain("Change vs previous period");
    await hoverMark(host.querySelector(".recharts-sankey-nodes > .recharts-layer")!);
    tip = host.querySelector(".openui-dashboard-tooltip")!;
    rows = tip.querySelectorAll(".openui-dashboard-tooltip-row");
    expect([...rows].map((row) => row.textContent)).toEqual([
      "Entered-16.7%100",
      "Moved on+50%60%60",
      "Lost-50%40%40",
    ]);
    expect(rows[2]?.querySelector(".openui-dashboard-delta-good")).not.toBeNull();
    expect(tip.textContent).toContain("100% of everyone who entered");
    await draw(view(false));
    await hoverMark(links()[1]!);
    expect(host.querySelector(".openui-dashboard-tooltip .openui-dashboard-delta")).toBeNull();
    expect(host.querySelector(".openui-dashboard-tooltip")?.textContent).not.toContain("Change vs");
  });

  for (const previous of ["", ", previous: 0"]) {
    test(`Flow requires previous on every link (${previous || "missing"}) in ${mode}`, async () => {
      await draw(
        <ThemeProvider mode={mode}>
          <CompareOverride value={true}>
            {render(
              `Flow([{from: "Entry", to: "Converted", value: 60, previous: 40}, {from: "Entry", to: "Exited", value: 40${previous}}], "number")`,
            )}
          </CompareOverride>
        </ThemeProvider>,
      );
      await settle(() =>
        expect(host.querySelectorAll(".recharts-sankey-links > .recharts-layer")).toHaveLength(2),
      );
      await hoverMark(host.querySelectorAll(".recharts-sankey-links > .recharts-layer")[0]!);
      const tip = host.querySelector(".openui-dashboard-tooltip")!;
      if (previous) {
        expect(tip.textContent).toContain("+50%");
        expect(tip.textContent).toContain("Change vs previous period");
      } else {
        expect(tip.querySelector(".openui-dashboard-delta")).toBeNull();
        expect(tip.textContent).not.toContain("Change vs");
        await hoverMark(host.querySelector(".recharts-sankey-nodes > .recharts-layer")!);
        expect(host.querySelector(".openui-dashboard-tooltip .openui-dashboard-delta")).toBeNull();
      }
    });
  }
}
