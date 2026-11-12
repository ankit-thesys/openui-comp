import { library, ThemeProvider } from "@openuidev/dashboard-library";
import { ThemeProvider as ComponentsThemeProvider } from "@openuidev/react-components";
import { Renderer } from "@openuidev/react-lang";
import { cdp, commands } from "@vitest/browser/context";
import { act, version, type ReactNode } from "react";
import { createRoot, hydrateRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

declare const __REACT_MAJOR__: string;

/** A tree the server renders and the browser hydrates: a program, optionally in a provider. */
type ServerTree = {
  program: string;
  provider?: boolean;
  mode?: "light" | "dark";
  lightTheme?: Record<string, string>;
};
declare module "@vitest/browser/context" {
  interface BrowserCommands {
    serverRender: (
      react: string,
      trees: ServerTree[],
    ) => Promise<{ html: string[]; stderr: string }>;
  }
}

const program = `root = Dashboard([
  Section("Revenue", [Row([
    Card("Sales", [], "third", "Weekly · USD"),
    Card("Customers", [], "two-thirds"),
  ], 320)], "Trading performance"),
  Section("Operations", [Row([Card("Uptime", [], "full")])]),
])`;
const dashboard = (response = program, isStreaming = false) => (
  <Renderer library={library} response={response} isStreaming={isStreaming} />
);
/** One Row of Cards with these Widths. */
const row = (...widths: string[]) =>
  dashboard(
    `root = Dashboard([Section("Widths", [Row([${widths
      .map((width, i) => `Card("Card ${i + 1}", [], "${width}")`)
      .join(", ")}])])])`,
  );

let host: HTMLDivElement;
let root: Root;
let errors: ReturnType<typeof vi.spyOn>;
const extraRoots: { host: HTMLElement; root: Root }[] = [];

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  errors = vi.spyOn(console, "error");
});
afterEach(async () => {
  await act(async () => root.unmount());
  for (const extra of extraRoots.splice(0)) {
    await act(async () => extra.root.unmount());
    extra.host.remove();
  }
  host.remove();
  const calls = [...errors.mock.calls];
  errors.mockRestore();
  expect(calls).toEqual([]);
});
async function draw(children: ReactNode, target = root) {
  await act(async () => target.render(children));
}
/** A second React root on the page, next to the first. */
function secondRoot() {
  const element = document.createElement("div");
  document.body.append(element);
  const extra = { host: element, root: createRoot(element) };
  extraRoots.push(extra);
  return extra;
}
function token(element: Element, name = "page") {
  return getComputedStyle(element).getPropertyValue(`--openui-dashboard-${name}`).trim();
}
function roots(within: ParentNode = host) {
  return [...within.querySelectorAll(".openui-dashboard-root")];
}
function spans() {
  return [...host.querySelectorAll<HTMLElement>(".openui-dashboard-cell")].map(
    (cell) => getComputedStyle(cell).gridColumnStart,
  );
}

test("runs on the React version of its project", () => {
  expect(version.split(".")[0]).toBe(__REACT_MAJOR__);
});

for (const mode of ["light", "dark"] as const) {
  test(`renders the layout program in ${mode}`, async () => {
    await draw(<ThemeProvider mode={mode}>{dashboard()}</ThemeProvider>);
    for (const text of ["Revenue", "Sales", "Weekly · USD", "Customers", "Operations", "Uptime"]) {
      expect(host.textContent).toContain(text);
    }
    expect(token(roots()[0]!)).toBe(mode === "light" ? "#ffffff" : "#141414");
    // The page colour is what the reader sees behind the dashboard.
    expect(getComputedStyle(roots()[0]!).backgroundColor).toBe(
      mode === "light" ? "rgb(255, 255, 255)" : "rgb(20, 20, 20)",
    );
    const cells = host.querySelectorAll<HTMLElement>(".openui-dashboard-cell");
    expect(cells).toHaveLength(3);
    expect(cells[0]!.classList.contains("openui-dashboard-w-third")).toBe(true);
    expect(getComputedStyle(cells[0]!).getPropertyValue("--openui-dashboard-row-h")).toBe("320px");
  });
}

test("Dashboard supplies default tokens without a provider", async () => {
  await draw(dashboard());
  expect(token(roots()[0]!)).toBe("#ffffff");
  expect(token(roots()[0]!, "series-1")).toBe("#6155e8");
});

test("a dashboard inside react-components' dark ThemeProvider stays light", async () => {
  await draw(<ComponentsThemeProvider mode="dark">{dashboard()}</ComponentsThemeProvider>);
  expect(token(roots()[0]!)).toBe("#ffffff");
  expect(getComputedStyle(roots()[0]!).backgroundColor).toBe("rgb(255, 255, 255)");
});

test("nested providers inherit mode and allow explicit mode", async () => {
  await draw(
    <ThemeProvider mode="dark">
      {dashboard()}
      <ThemeProvider>
        {dashboard()}
        <ThemeProvider mode="light">{dashboard()}</ThemeProvider>
      </ThemeProvider>
    </ThemeProvider>,
  );
  expect(roots().map((element) => token(element))).toEqual(["#141414", "#141414", "#ffffff"]);
});

test("light overrides and independent sibling dashboards", async () => {
  await draw(
    <>
      <ThemeProvider lightTheme={{ page: "#123456", spaceMd: "23px" }}>{dashboard()}</ThemeProvider>
      <ThemeProvider mode="dark" darkTheme={{ surface: "#234567" }}>
        {dashboard()}
      </ThemeProvider>
    </>,
  );
  expect(roots().map((element) => token(element))).toEqual(["#123456", "#141414"]);
  expect(token(roots()[0]!, "space-md")).toBe("23px");
  expect(token(roots()[1]!, "surface")).toBe("#234567");
  await draw(<ThemeProvider mode="light">{dashboard()}</ThemeProvider>);
  expect(token(roots()[0]!)).toBe("#ffffff");
});

test("dashboards in two client-rendered React roots keep their own themes", async () => {
  const second = secondRoot();
  await draw(<ThemeProvider lightTheme={{ page: "#123456" }}>{dashboard()}</ThemeProvider>);
  await draw(<ThemeProvider mode="dark">{dashboard()}</ThemeProvider>, second.root);
  expect(token(roots()[0]!)).toBe("#123456");
  expect(token(roots(second.host)[0]!)).toBe("#141414");
  // Re-rendering either root leaves the other alone.
  await draw(<ThemeProvider lightTheme={{ page: "#654321" }}>{dashboard()}</ThemeProvider>);
  expect(token(roots()[0]!)).toBe("#654321");
  expect(token(roots(second.host)[0]!)).toBe("#141414");
});

// Every layout effect runs here: a Kpis strip with a trend, and a Card with a Stat.
const metricsProgram = `root = Dashboard([
  Section("", [Kpis([Kpi("Revenue", 412600, "currency-compact", 398200, "up", null, [356, 368, 384, 398, 412])])]),
  Section("Activity", [Row([Card("Weekly active users", [Stat(18420, "compact", 17210)], "full")])])
])`;

function clientTree(tree: ServerTree) {
  return tree.provider ? (
    <ThemeProvider mode={tree.mode} lightTheme={tree.lightTheme}>
      {dashboard(tree.program)}
    </ThemeProvider>
  ) : (
    dashboard(tree.program)
  );
}

/**
 * Server-renders trees in Node, as a server would (no window), on this project's React, then
 * hydrates each as its own React root. Neither step may log anything.
 */
async function hydrated(...trees: ServerTree[]) {
  const server = await commands.serverRender(__REACT_MAJOR__, trees);
  expect(server.stderr).toBe("");
  const warnings = vi.spyOn(console, "warn");
  const elements: HTMLElement[] = [];
  try {
    for (const [i, tree] of trees.entries()) {
      const element = document.createElement("div");
      element.innerHTML = server.html[i]!;
      document.body.append(element);
      let hydratedRoot!: Root;
      await act(async () => {
        hydratedRoot = hydrateRoot(element, clientTree(tree));
      });
      extraRoots.push({ host: element, root: hydratedRoot });
      elements.push(element);
    }
    expect(warnings.mock.calls).toEqual([]);
  } finally {
    warnings.mockRestore();
  }
  return elements;
}

test("a server-rendered dashboard hydrates without a warning", async () => {
  const [layout, metrics] = await hydrated(
    { program, provider: true, mode: "dark" },
    { program: metricsProgram, provider: true },
  );
  expect(token(roots(layout)[0]!)).toBe("#141414");
  expect(metrics!.textContent).toContain("$412.6K");
  expect(metrics!.textContent).toContain("18.4K");
});

test("dashboards in two hydrated React roots keep their own themes", async () => {
  // Server ids follow tree position, so hydrated roots start from the same useId.
  const [light, dark, plain] = await hydrated(
    { program, provider: true, lightTheme: { page: "#123456" } },
    { program, provider: true, mode: "dark" },
    // A dashboard with no provider applies a theme itself.
    { program },
  );
  expect(token(roots(light)[0]!)).toBe("#123456");
  expect(token(roots(dark)[0]!)).toBe("#141414");
  expect(token(roots(plain)[0]!)).toBe("#ffffff");
});

test("a changed override updates the dashboard's tokens", async () => {
  const draft = (page: string) => (
    <ThemeProvider lightTheme={{ page }}>{dashboard()}</ThemeProvider>
  );
  await draw(draft("#123456"));
  expect(token(roots()[0]!)).toBe("#123456");
  await draw(draft("#654321"));
  expect(token(roots()[0]!)).toBe("#654321");
});

/* ---------- Widths ---------- */

test("Widths take their share of a wide row", async () => {
  host.style.width = "1280px";
  await draw(row("quarter", "quarter", "half"));
  expect(spans()).toEqual(["span 3", "span 3", "span 6"]);
  await draw(row("third", "two-thirds"));
  expect(spans()).toEqual(["span 4", "span 8"]);
  await draw(row("three-quarters", "quarter"));
  expect(spans()).toEqual(["span 9", "span 3"]);
});

test("a Row's cards fill the whole row, even when its Widths fall short", async () => {
  host.style.width = "1280px";
  // two-thirds + half wraps the half onto a line of its own; each line still fills.
  await draw(row("two-thirds", "half"));
  expect(spans()).toEqual(["span 12", "span 12"]);
  const rowBox = host.querySelector(".openui-dashboard-row")!.getBoundingClientRect();
  for (const cell of host.querySelectorAll(".openui-dashboard-cell")) {
    const box = cell.getBoundingClientRect();
    expect(box.left).toBeCloseTo(rowBox.left, 0);
    expect(box.right).toBeCloseTo(rowBox.right, 0);
  }
  // A full line is untouched: its cards meet edge to edge across the row.
  await draw(row("third", "third", "third"));
  const cells = [...host.querySelectorAll(".openui-dashboard-cell")].map((cell) =>
    cell.getBoundingClientRect(),
  );
  expect(cells[0]!.left).toBeCloseTo(rowBox.left, 0);
  expect(cells[2]!.right).toBeCloseTo(rowBox.right, 0);
  expect(cells.every((box) => Math.abs(box.top - cells[0]!.top) < 1)).toBe(true);
});

test("narrow dashboards reflow Widths at the container breakpoints", async () => {
  host.style.width = "900px";
  // Below 1100px quarters become halves; the odd one out takes the whole line.
  await draw(row("quarter", "quarter", "quarter"));
  expect(spans()).toEqual(["span 6", "span 6", "span 12"]);
  await draw(row("two-thirds", "third"));
  expect(spans()).toEqual(["span 12", "span 12"]);
  host.style.width = "600px";
  // Below 720px only quarters pair up; thirds and halves stack.
  await draw(row("half", "half"));
  expect(spans()).toEqual(["span 12", "span 12"]);
  await draw(row("quarter", "quarter"));
  expect(spans()).toEqual(["span 6", "span 6"]);
});

/* ---------- Motion ---------- */

test("reduced motion stops the sheen and slows the refresh spinner", async () => {
  const motion = async (value: "reduce" | "no-preference") =>
    cdp().send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value }],
    });
  // While streaming, the card being written draws the sheen.
  await draw(dashboard(program, true));
  const sheen = host.querySelector(".openui-dashboard-sheen")!;
  expect(sheen).not.toBeNull();
  // The refresh spinner needs live data refetching; draw its markup inside the same styles.
  const shell = document.createElement("div");
  shell.className = roots()[0]!.className;
  shell.innerHTML = `<span class="openui-dashboard-refresh"><svg viewBox="0 0 16 16"></svg></span>`;
  document.body.append(shell);
  const spinner = shell.querySelector("svg")!;
  try {
    await motion("no-preference");
    expect(getComputedStyle(sheen).animationName).toBe("openui-dashboard-shimmer");
    expect(getComputedStyle(spinner).animationDuration).toBe("0.9s");
    await motion("reduce");
    expect(getComputedStyle(sheen).animationName).toBe("none");
    expect(getComputedStyle(spinner).animationDuration).toBe("2.4s");
  } finally {
    await motion("no-preference");
    shell.remove();
  }
});
