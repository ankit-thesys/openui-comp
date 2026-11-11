import { library, ThemeProvider } from "@openuidev/dashboard-library-next";
import { Renderer } from "@openuidev/react-lang";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

const program = `root = Dashboard([
  Section("Revenue", [Row([
    Card("Sales", [], "third", "Weekly · USD"),
    Card("Customers", [], "two-thirds"),
  ], 320)], "Trading performance"),
  Section("Operations", [Row([Card("Uptime", [], "full")])]),
])`;
const dashboard = () => <Renderer library={library} response={program} />;
let host: HTMLDivElement;
let root: Root;
let errors: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div");
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
function token(element: Element, name = "page") {
  return getComputedStyle(element).getPropertyValue(`--openui-dashboard-${name}`).trim();
}
function roots() {
  return [...host.querySelectorAll(".openui-dashboard-root")];
}

for (const mode of ["light", "dark"] as const) {
  test(`renders the layout program in ${mode}`, async () => {
    await draw(<ThemeProvider mode={mode}>{dashboard()}</ThemeProvider>);
    for (const text of ["Revenue", "Sales", "Weekly · USD", "Customers", "Operations", "Uptime"]) {
      expect(host.textContent).toContain(text);
    }
    expect(token(roots()[0]!)).toBe(mode === "light" ? "#ffffff" : "#141414");
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
