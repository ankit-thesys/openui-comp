import { library, ThemeProvider } from "@openuidev/dashboard-library-next";
import { ThemeProvider as ComponentsThemeProvider } from "@openuidev/react-components";
import { Renderer } from "@openuidev/react-lang";
import { cdp } from "@vitest/browser/context";
import { act, version, type ReactNode } from "react";
import { createRoot, hydrateRoot, type Root } from "react-dom/client";
// The browser build by name: the React 18 alias points at the package folder, past its "browser" field.
import { renderToString } from "react-dom/server.browser";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

declare const __REACT_MAJOR__: string;

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
function themeStyles() {
  return [...document.head.querySelectorAll("style[data-openui-dashboard-theme]")];
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

/**
 * Server-renders a tree and hydrates it as its own React root. React 18's server renderer warns
 * about every useLayoutEffect, even ones a real server (no window) never calls; here it runs in
 * the browser, so that warning alone is accepted, from the server step only. Hydration must
 * still log nothing.
 */
async function hydrated(tree: ReactNode) {
  const element = document.createElement("div");
  element.innerHTML = renderToString(tree);
  const serverOnly = /useLayoutEffect does nothing on the server/;
  expect(errors.mock.calls.filter(([message]) => !serverOnly.test(String(message)))).toEqual([]);
  errors.mockClear();
  document.body.append(element);
  let hydratedRoot!: Root;
  await act(async () => {
    hydratedRoot = hydrateRoot(element, tree);
  });
  extraRoots.push({ host: element, root: hydratedRoot });
  return element;
}

test("a server-rendered dashboard hydrates without a mismatch", async () => {
  const element = await hydrated(<ThemeProvider mode="dark">{dashboard()}</ThemeProvider>);
  expect(token(roots(element)[0]!)).toBe("#141414");
});

test("dashboards in two hydrated React roots keep their own themes", async () => {
  // Server ids follow tree position, so two hydrated roots start from the same useId.
  const light = await hydrated(
    <ThemeProvider lightTheme={{ page: "#123456" }}>{dashboard()}</ThemeProvider>,
  );
  const dark = await hydrated(<ThemeProvider mode="dark">{dashboard()}</ThemeProvider>);
  expect(token(roots(light)[0]!)).toBe("#123456");
  expect(token(roots(dark)[0]!)).toBe("#141414");
  // So do two dashboards with no provider, each applying a theme itself.
  const plain = await hydrated(dashboard());
  expect(token(roots(plain)[0]!)).toBe("#ffffff");
  expect(token(roots(dark)[0]!)).toBe("#141414");
});

test("an inline lightTheme keeps its style tag across re-renders", async () => {
  const draft = (page: string) => (
    <ThemeProvider lightTheme={{ page }}>{dashboard()}</ThemeProvider>
  );
  await draw(draft("#123456"));
  const [style] = themeStyles();
  expect(themeStyles()).toHaveLength(1);
  // A new but equal theme object: the same tag stays in place.
  await draw(draft("#123456"));
  expect(themeStyles()).toEqual([style]);
  expect(style!.isConnected).toBe(true);
  // A changed value replaces it.
  await draw(draft("#654321"));
  expect(themeStyles()).toHaveLength(1);
  expect(themeStyles()[0]).not.toBe(style);
  expect(token(roots()[0]!)).toBe("#654321");
});

test("the portal class carries the provider's tokens", async () => {
  await draw(
    <ThemeProvider mode="dark" darkTheme={{ surface: "#234567" }}>
      {dashboard()}
    </ThemeProvider>,
  );
  const scope = host.querySelector("[data-dashboard-mode]")!.className;
  // A portal renders outside the provider's subtree, e.g. straight into body.
  const portal = document.createElement("div");
  portal.className = `${scope}-portal`;
  document.body.append(portal);
  try {
    expect(token(portal)).toBe("#141414");
    expect(token(portal, "surface")).toBe("#234567");
    expect(getComputedStyle(portal).colorScheme).toBe("dark");
  } finally {
    portal.remove();
  }
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
