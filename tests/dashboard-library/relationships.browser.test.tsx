// Use the public library from source so the internal host overrides share its contexts.
import { Renderer } from "@openuidev/react-lang";
import { act, createContext, useContext, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { library, ThemeProvider } from "../../packages/libraries/dashboard/src/index";
import { CompareOverride } from "../../packages/libraries/dashboard/src/shared/compare";
import { useReportFilter } from "../../packages/libraries/dashboard/src/shared/filterRegistry";
import { StateOverride } from "../../packages/libraries/dashboard/src/shared/viewState";
import { accountPoints, card, relationshipsFixtures } from "./fixtures/relationships";

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
const program = (content: string) => card(`Card("Relationships", [${content}], "full")`);
const renderProgram = (response: string, isStreaming = false) => (
  <Renderer library={library} response={response} isStreaming={isStreaming} />
);
async function click(element: Element) {
  await act(async () => (element as HTMLElement).click());
}
async function choose(text: string) {
  const radio = [...host.querySelectorAll('[role="radio"]')].find(
    (element) => element.textContent === text,
  );
  expect(radio).toBeDefined();
  await click(radio!);
  expect(radio!.getAttribute("aria-checked")).toBe("true");
}
const radios = () => [...host.querySelectorAll('[role="radio"]')].map((radio) => radio.textContent);
const checked = () => host.querySelector('[role="radio"][aria-checked="true"]')?.textContent;
async function hoverCell(cell: Element) {
  const box = cell.getBoundingClientRect();
  await act(async () => {
    cell.dispatchEvent(
      new MouseEvent("mousemove", {
        bubbles: true,
        clientX: box.x + box.width / 2,
        clientY: box.y + box.height / 2,
      }),
    );
    await new Promise(requestAnimationFrame);
  });
}
const gridCells = () =>
  [...host.querySelectorAll<HTMLTableCellElement>(".openui-dashboard-cohort tbody td")].filter(
    (cell) =>
      !cell.classList.contains("openui-dashboard-cohort-label") &&
      !cell.classList.contains("openui-dashboard-cohort-size") &&
      !cell.closest(".openui-dashboard-cohort-gap"),
  );
const contents = {
  Scatter: 'Scatter([{label: "Acme", x: 12000, y: 3.4}], "Spend", "ROAS", "currency", "number")',
  Heatmap: 'Heatmap(["Mon"], ["Morning", "Evening"], [[12, 24]], "number", true)',
  Cohorts: 'Cohorts(["Nov"], [1000], ["W0", "W1"], [[100, 42.2]], null, null, true)',
};
const emptyContents = {
  Scatter: 'Scatter([], "Spend", "ROAS")',
  Heatmap: 'Heatmap(["Mon"], ["Morning"], [[null]])',
  Cohorts: 'Cohorts([], [], ["W0"], [])',
};

// Exercise Empty's filter registry while the filter components are being ported separately.
// A host wrapper reports the filter inside the Dashboard's provider, then renders the public Card.
const FilterValueContext = createContext("all");
const publicCard = library.components["Card"]!;
const PublicCard = publicCard.component;
const libraryWithFilter = library.extend({
  components: {
    override: [
      {
        ...publicCard,
        component: function FilterReportingCard(props) {
          useReportFilter("relationships-test-region", useContext(FilterValueContext));
          return <PublicCard {...props} />;
        },
      },
    ],
  },
});

for (const mode of ["light", "dark"] as const) {
  test(`catalog Scatter has seven sized points and formatted measures in ${mode}`, async () => {
    await draw(
      <ThemeProvider mode={mode}>{renderProgram(relationshipsFixtures[0]!.program)}</ThemeProvider>,
    );
    await expect.poll(() => host.querySelectorAll(".recharts-scatter-symbol").length).toBe(7);
    for (const text of [
      "Accounts by usage and spend",
      "Weekly active %",
      "ACV",
      "Acme",
      "84%",
      "$48K",
      "1,200",
    ]) {
      expect(host.textContent).toContain(text);
    }
    expect(host.querySelectorAll(".openui-dashboard-sr-only tbody tr")).toHaveLength(7);
    expect(host.querySelectorAll(".openui-dashboard-size-step")).toHaveLength(3);
    expect(host.querySelectorAll(".recharts-scatter-symbol .recharts-symbols")).toHaveLength(14);
    expect(
      host.querySelector(".openui-dashboard-size-dot")!.getBoundingClientRect().width,
    ).toBeGreaterThan(0);
  });

  test(`Scatter shows references, quadrants, groups and omitted points in ${mode}`, async () => {
    await draw(
      <ThemeProvider mode={mode}>
        {renderProgram(
          program(`Scatter([
          {label: "Acme", x: 12000, y: 3.4, size: 612, group: "Search"},
          {label: "Hooli", x: 8000, y: 2.1, size: 401, group: "Social"},
          {label: "Missing spend", x: null, y: 1},
          {label: "Missing return", x: 100, y: null}
        ], "Spend", "ROAS", "currency", "number",
        [Reference("Avg spend", 10000, "x"), Reference("Target", 3)], "Signups",
        ["Efficient", "Scale", "Develop", "Review"])`),
        )}
      </ThemeProvider>,
    );
    await expect.poll(() => host.querySelectorAll(".recharts-scatter-symbol").length).toBe(2);
    expect(host.querySelectorAll(".recharts-reference-line")).toHaveLength(2);
    expect(host.querySelectorAll(".recharts-reference-area")).toHaveLength(4);
    for (const text of [
      "Avg spend · $10,000",
      "Target · 3",
      "Efficient",
      "Scale",
      "Develop",
      "Review",
      "Search",
      "Social",
      "Signups",
      "2 points not drawn, no x or y: Missing spend, Missing return",
    ]) {
      expect(host.textContent).toContain(text);
    }
    const marks = host.querySelectorAll(".recharts-scatter-symbol .recharts-symbols");
    // Different groups use different shapes as well as colours.
    expect(marks[1]!.getAttribute("d")).not.toBe(marks[3]!.getAttribute("d"));
    await act(async () => {
      host
        .querySelector(".recharts-scatter-symbol")!
        .dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    });
    await expect
      .poll(() => host.querySelector(".recharts-tooltip-wrapper")?.textContent)
      .toContain("Acme · Search");
    expect(host.querySelector(".recharts-tooltip-wrapper")?.textContent).toContain("$12,000");
    expect(host.querySelector(".recharts-tooltip-wrapper")?.textContent).toContain("612");
  });

  test(`Scatter folds the smallest groups into Other in ${mode}`, async () => {
    const points = Array.from(
      { length: 10 },
      (_, i) => `{label: "Account ${i}", x: ${i + 1}, y: ${i + 2}, group: "Group ${i}"}`,
    ).join(", ");
    await draw(
      <ThemeProvider mode={mode}>
        {renderProgram(program(`Scatter([${points}], "Usage", "Spend")`))}
      </ThemeProvider>,
    );
    await expect.poll(() => host.querySelectorAll(".recharts-scatter-symbol").length).toBe(10);
    const legend = host.querySelector(".openui-dashboard-legend")!;
    expect(legend.textContent).toContain("Other");
    expect(legend.textContent).toContain("Group 6");
    expect(legend.textContent).not.toContain("Group 7");
    expect(host.querySelectorAll(".recharts-scatter")).toHaveLength(8);
  });

  test(`catalog Heatmap values, rows and cell tooltips in ${mode}`, async () => {
    await draw(
      <ThemeProvider mode={mode}>{renderProgram(relationshipsFixtures[3]!.program)}</ThemeProvider>,
    );
    expect(host.querySelectorAll(".openui-dashboard-heat tbody tr")).toHaveLength(7);
    expect(gridCells()).toHaveLength(56);
    expect(gridCells().every((cell) => cell.textContent === "")).toBe(true);
    for (const text of ["Activity by hour", "Sessions · local time", "Mon", "Sun", "12a", "9p"]) {
      expect(host.textContent).toContain(text);
    }
    // One labelled Show switch in the card header: None until a viewer picks a reading.
    const show = host.querySelector('.openui-dashboard-card-slot [aria-label="Show in cells"]')!;
    expect(show.parentElement!.querySelector(".openui-dashboard-view-label")!.textContent).toBe(
      "Show",
    );
    expect(radios()).toEqual(["None", "Count", "% of total", "% of row"]);
    expect(checked()).toBe("None");
    expect(host.querySelector('input[type="checkbox"]')).toBeNull();
    const before = gridCells()[0]!.getBoundingClientRect().width;
    const height = host.querySelector(".openui-dashboard-card")!.getBoundingClientRect().height;
    await choose("Count");
    expect(host.querySelector(".openui-dashboard-card")!.getBoundingClientRect().height).toBe(
      height,
    );
    expect(gridCells()[0]!.textContent).toBe("12");
    expect(gridCells()[12]!.textContent).toBe("151");
    expect(gridCells()[0]!.getBoundingClientRect().width).toBeCloseTo(before, 1);
    const ink = getComputedStyle(gridCells()[0]!).backgroundColor;
    expect(ink).not.toBe("rgba(0, 0, 0, 0)");
    await hoverCell(gridCells()[0]!);
    const tip = host.querySelector(".openui-dashboard-rowtip")!;
    for (const text of ["Mon · 12a", "Value", "12", "Share of total", "Share of Mon"]) {
      expect(tip.textContent).toContain(text);
    }
    expect(gridCells()[0]!.hasAttribute("data-hover")).toBe(true);
  });

  test(`Heatmap switches readings and preserves null cells in ${mode}`, async () => {
    await draw(
      <ThemeProvider mode={mode}>
        {renderProgram(
          program('Heatmap(["Mon", "Tue"], ["AM", "PM"], [[1, 3], [6, null]], "number", true)'),
        )}
      </ThemeProvider>,
    );
    expect(gridCells().map((cell) => cell.textContent)).toEqual(["1", "3", "6", ""]);
    expect(host.querySelectorAll(".openui-dashboard-cohort-empty")).toHaveLength(1);
    await choose("% of total");
    expect(gridCells().map((cell) => cell.textContent)).toEqual(["10%", "30%", "60%", ""]);
    await choose("% of row");
    expect(gridCells().map((cell) => cell.textContent)).toEqual(["25%", "75%", "100%", ""]);
    await choose("Count");
    expect(gridCells()[0]!.textContent).toBe("1");
    await choose("None");
    expect(gridCells().every((cell) => cell.textContent === "")).toBe(true);
  });

  test(`Heatmap diverges symmetrically around its midpoint in ${mode}`, async () => {
    await draw(
      <ThemeProvider mode={mode}>
        {renderProgram(
          program(
            'Heatmap(["Variance"], ["Low", "Plan", "High"], [[-10, 0, 10]], "percent", true, 0, "row")',
          ),
        )}
      </ThemeProvider>,
    );
    expect(gridCells().map((cell) => cell.textContent)).toEqual(["-10%", "0%", "10%"]);
    // A diverging grid has one reading: it prints its values or not.
    expect(radios()).toEqual(["None", "Values"]);
    expect(checked()).toBe("Values");
    const colors = gridCells().map((cell) => getComputedStyle(cell).backgroundColor);
    expect(new Set(colors).size).toBe(3);
    await hoverCell(gridCells()[0]!);
    expect(host.querySelector(".openui-dashboard-rowtip")?.textContent).toContain("-10%");
    expect(host.querySelector(".openui-dashboard-rowtip")?.textContent).not.toContain(
      "Share of total",
    );
  });

  test(`catalog Cohorts has weighted totals and unreached periods in ${mode}`, async () => {
    await draw(
      <ThemeProvider mode={mode}>{renderProgram(relationshipsFixtures[1]!.program)}</ThemeProvider>,
    );
    expect(host.querySelectorAll(".openui-dashboard-cohort tbody tr")).toHaveLength(8);
    expect(gridCells()).toHaveLength(42);
    expect(host.querySelectorAll('[aria-label="Not reached yet"]')).toHaveLength(15);
    expect(host.querySelector(".openui-dashboard-cohort-all")?.textContent).toContain("4,331");
    expect(gridCells().every((cell) => cell.textContent === "")).toBe(true);
    expect(radios()).toEqual(["None", "Percent", "Count"]);
    expect(checked()).toBe("None");
    await choose("Percent");
    expect(gridCells()[0]!.textContent).toBe("100%");
    expect(gridCells()[1]!.textContent).toBe("42.8%");
    await choose("Count");
    expect(gridCells()[0]!.textContent).toBe("4,331");
    await hoverCell(gridCells()[1]!);
    for (const text of [
      "All cohorts · W1",
      "Retained",
      "42.8%",
      "People",
      "Cohort size",
      "3,600",
    ]) {
      expect(host.querySelector(".openui-dashboard-rowtip")?.textContent).toContain(text);
    }
  });

  test(`Cohorts weights only reached cohorts and opens on people in ${mode}`, async () => {
    await draw(
      <ThemeProvider mode={mode}>
        {renderProgram(
          program(
            'Cohorts(["Oct", "Nov"], [100, 300], ["W0", "W1", "W2"], [[100, 20, 10], [100, 60, null]], null, "people", true)',
          ),
        )}
      </ThemeProvider>,
    );
    expect(
      gridCells()
        .slice(0, 3)
        .map((cell) => cell.textContent),
    ).toEqual(["400", "200", "10"]);
    await choose("Percent");
    expect(
      gridCells()
        .slice(0, 3)
        .map((cell) => cell.textContent),
    ).toEqual(["100%", "50%", "10%"]);
    await hoverCell(gridCells()[2]!);
    expect(host.querySelector(".openui-dashboard-rowtip")?.textContent).toContain("100");
  });

  test(`non-percent Cohorts uses its format without a Count option in ${mode}`, async () => {
    await draw(
      <ThemeProvider mode={mode}>
        {renderProgram(
          program(
            'Cohorts(["Nov"], [1000], ["M0", "M1"], [[30, 12.5]], "currency-precise", "people", true)',
          ),
        )}
      </ThemeProvider>,
    );
    expect(host.querySelector(".openui-dashboard-cohort-all")).toBeNull();
    expect(radios()).toEqual(["None", "Percent"]);
    expect(checked()).toBe("Percent");
    expect(gridCells().map((cell) => cell.textContent)).toEqual(["$30.00", "$12.50"]);
  });

  for (const name of ["Scatter", "Heatmap", "Cohorts"] as const) {
    for (const [state, copy] of [
      ["loading", "Loading"],
      // A Card shows each state's full title (his STATE_COPY); the short forms are for Kpi tiles.
      ["empty", "No data for this period"],
      ["error", "This data didn’t load"],
      ["no-results", "No matching data"],
    ] as const) {
      test(`${name} Card shows ${state} in ${mode}`, async () => {
        await draw(
          <ThemeProvider mode={mode}>
            <StateOverride value={state}>{renderProgram(program(contents[name]))}</StateOverride>
          </ThemeProvider>,
        );
        const frame = host.querySelector(".openui-dashboard-card-body > .openui-dashboard-state")!;
        expect(frame.getAttribute("data-state")).toBe(state);
        expect(frame.querySelector(".openui-dashboard-state-layer")?.textContent).toContain(copy);
        expect(
          getComputedStyle(frame.querySelector(".openui-dashboard-state-content")!).visibility,
        ).toBe("hidden");
        expect(host.querySelector(".openui-dashboard-sheen") !== null).toBe(state === "loading");
      });
    }

    test(`${name} draws its own empty state inside a Card in ${mode}`, async () => {
      await draw(
        <ThemeProvider mode={mode}>{renderProgram(program(emptyContents[name]))}</ThemeProvider>,
      );
      const empty = host.querySelector(".openui-dashboard-card-body .openui-dashboard-empty")!;
      expect(empty.getAttribute("data-state")).toBe("empty");
      expect(empty.textContent).toContain("No data for this period");
      expect(host.querySelector('[data-state="invalid"]')).toBeNull();
      await draw(
        <ThemeProvider mode={mode}>
          {renderProgram(program(emptyContents[name]), true)}
        </ThemeProvider>,
      );
      expect(
        host
          .querySelector(".openui-dashboard-card-body .openui-dashboard-state")
          ?.getAttribute("data-state"),
      ).toBe("loading");
    });

    test(`${name} keeps its readings in Compare mode in ${mode}`, async () => {
      const scene = (compare: boolean) => (
        <ThemeProvider mode={mode}>
          <CompareOverride value={compare}>
            {renderProgram(program(contents[name]))}
          </CompareOverride>
        </ThemeProvider>
      );
      await draw(scene(false));
      if (name === "Scatter") {
        await expect.poll(() => host.querySelectorAll(".recharts-scatter-symbol").length).toBe(1);
      }
      const before = host.querySelector(".openui-dashboard-card-body")!.textContent;
      await draw(scene(true));
      expect(host.querySelector(".openui-dashboard-card-body")!.textContent).toBe(before);
      expect(host.querySelector('[data-state="invalid"]')).toBeNull();
    });

    test(`${name} says filters hid everything and recovers when cleared in ${mode}`, async () => {
      const scene = (value: string) => (
        <ThemeProvider mode={mode}>
          <FilterValueContext.Provider value={value}>
            <Renderer library={libraryWithFilter} response={program(emptyContents[name])} />
          </FilterValueContext.Provider>
        </ThemeProvider>
      );
      await draw(scene("all"));
      const state = () => host.querySelector(".openui-dashboard-card-body .openui-dashboard-empty");
      expect(state()?.getAttribute("data-state")).toBe("empty");
      await draw(scene("eu"));
      await expect.poll(() => state()?.getAttribute("data-state")).toBe("no-results");
      expect(state()?.textContent).toContain("Try changing or clearing a filter.");
      await draw(scene("all"));
      await expect.poll(() => state()?.getAttribute("data-state")).toBe("empty");
    });
  }
}

for (const name of ["Scatter", "Heatmap", "Cohorts"] as const) {
  test(`${name} reports a failed live query through a Card`, async () => {
    const content = {
      Scatter: 'Scatter(data.rows, "Spend", "ROAS")',
      Heatmap: 'Heatmap(data.rows, ["Morning"], [])',
      Cohorts: 'Cohorts(data.rows, [], ["W0"], [])',
    }[name];
    const response = `data = Query("relationships", {}, {rows: []})\n${program(content)}`;
    await draw(
      <Renderer
        library={library}
        response={response}
        toolProvider={{
          relationships: async () => {
            throw new Error("Fixture unavailable");
          },
        }}
      />,
    );
    await expect
      .poll(() =>
        host
          .querySelector(".openui-dashboard-card-body .openui-dashboard-empty")
          ?.getAttribute("data-state"),
      )
      .toBe("error");
    expect(host.querySelector(".openui-dashboard-card-body")?.textContent).toContain(
      "This data didn’t load",
    );
    // react-lang logs the failed query; that is the only console error this test allows.
    expect(errors.mock.calls.map(([message]) => String(message))).toEqual([
      'Query "relationships" failed:',
    ]);
    errors.mockClear();
  });
}

test("grouped catalog points preserve all seven accounts", async () => {
  await draw(renderProgram(program(`Scatter(${accountPoints("group")}, "Usage", "ACV")`)));
  await expect.poll(() => host.querySelectorAll(".recharts-scatter-symbol").length).toBe(7);
  expect(host.querySelector(".openui-dashboard-legend")?.textContent).toContain("Enterprise");
  expect(host.querySelector(".openui-dashboard-legend")?.textContent).toContain("Business");
  expect(host.querySelector(".openui-dashboard-legend")?.textContent).toContain("Team");
});

// His ramps, as he wrote them (styles.css): each step's fill and the text ink that reads on it.
const RAMPS = {
  light: {
    ink: "rgb(13, 13, 13)",
    seq1: "rgb(245, 246, 255)",
    seq9: "rgb(66, 41, 186)",
    seqInk9: "rgb(255, 255, 255)",
    div1: "rgb(179, 47, 91)",
    div5: "rgb(231, 231, 231)",
    div9: "rgb(90, 86, 199)",
    poleInk: "rgb(255, 255, 255)",
  },
  dark: {
    ink: "rgb(250, 250, 250)",
    seq1: "rgb(27, 28, 52)",
    seq9: "rgb(189, 195, 255)",
    seqInk9: "rgb(13, 13, 13)",
    div1: "rgb(235, 125, 152)",
    div5: "rgb(58, 58, 60)",
    div9: "rgb(149, 153, 249)",
    poleInk: "rgb(13, 13, 13)",
  },
} as const;
const paint = (cell: Element) => {
  const style = getComputedStyle(cell);
  return [style.backgroundColor, style.color];
};

for (const mode of ["light", "dark"] as const) {
  const ramp = RAMPS[mode];
  test(`Heatmap's sequential ramp runs light to dark with readable ink in ${mode}`, async () => {
    await draw(
      <ThemeProvider mode={mode}>
        {renderProgram(program('Heatmap(["Mon"], ["Low", "High"], [[0, 100]], "number", true)'))}
      </ThemeProvider>,
    );
    await expect.poll(() => gridCells().length).toBe(2);
    const [low, high] = gridCells();
    expect(paint(low!)).toEqual([ramp.seq1, ramp.ink]);
    expect(paint(high!)).toEqual([ramp.seq9, ramp.seqInk9]);
  });
  test(`Heatmap with a midpoint uses the diverging ramp in ${mode}`, async () => {
    await draw(
      <ThemeProvider mode={mode}>
        {renderProgram(
          program('Heatmap(["Mon"], ["Down", "Flat", "Up"], [[-10, 0, 10]], "number", true, 0)'),
        )}
      </ThemeProvider>,
    );
    await expect.poll(() => gridCells().length).toBe(3);
    const [down, flat, up] = gridCells();
    expect(paint(down!)).toEqual([ramp.div1, ramp.poleInk]);
    expect(paint(flat!)).toEqual([ramp.div5, ramp.ink]);
    expect(paint(up!)).toEqual([ramp.div9, ramp.poleInk]);
  });
  test(`Cohorts shade retention on the sequential ramp in ${mode}`, async () => {
    await draw(
      <ThemeProvider mode={mode}>
        {renderProgram(
          program('Cohorts(["Jan", "Feb"], [100, 100], ["W0", "W1"], [[100, 80], [100, 20]])'),
        )}
      </ThemeProvider>,
    );
    await expect.poll(() => gridCells().length).toBeGreaterThan(0);
    const shaded = gridCells().filter((cell) => paint(cell)[0] === ramp.seq9);
    // The strongest week-1 retention takes the darkest step and its own ink.
    expect(shaded.length).toBeGreaterThan(0);
    expect(paint(shaded[0]!)[1]).toBe(ramp.seqInk9);
    expect(gridCells().some((cell) => paint(cell)[0] === ramp.seq1)).toBe(true);
  });
}
