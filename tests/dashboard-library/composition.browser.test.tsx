// Use the public library from source so host overrides share its context instances.
import { Renderer } from "@openuidev/react-lang";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { library, ThemeProvider } from "../../packages/libraries/dashboard-next/src/index";
import { CompareOverride, StateOverride } from "../../packages/libraries/dashboard-next/src/shared";
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
    marks: ".recharts-sankey-node",
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
      await vi.waitFor(() => {
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
    await vi.waitFor(() =>
      expect(host.querySelector(".openui-dashboard-funnel-shape")).not.toBeNull(),
    );
    expect(host.querySelectorAll(".openui-dashboard-funnel-heads > div")).toHaveLength(3);
    expect(
      host.querySelector(".openui-dashboard-funnel-plot svg g[stroke-dasharray]"),
    ).not.toBeNull();
    host.style.width = "300px";
    await vi.waitFor(() =>
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
  await vi.waitFor(() => expect(host.querySelectorAll(".recharts-sankey-node")).toHaveLength(2));
  expect(host.textContent).toContain(
    "1 link not drawn, it loops back to an earlier step: Converted → Entry",
  );
  expect(host.textContent).toContain("1 link not drawn, zero or below or unnamed: Entry → Exited");
  expect(host.querySelectorAll(".recharts-sankey-link")).toHaveLength(1);
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
