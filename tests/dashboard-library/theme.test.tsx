import { library, ThemeProvider } from "@openuidev/dashboard-library-next";
import { Renderer } from "@openuidev/react-lang";
import { renderToString } from "react-dom/server";
import { afterEach, expect, test, vi } from "vitest";

const program = `root = Dashboard([Section("Revenue", [Row([Card("Sales", [], "half")])])])`;
const dashboard = () => <Renderer library={library} response={program} />;

afterEach(() => {
  vi.restoreAllMocks();
});

test("renders on the server", () => {
  const html = renderToString(<ThemeProvider mode="dark">{dashboard()}</ThemeProvider>);
  expect(html).toContain('data-dashboard-mode="dark"');
  expect(html).toContain("openui-dashboard-root");
  expect(html).toContain("Sales");
});

test("warns once about unknown theme keys and non-string values", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const lightTheme = { page: "#123456", pagee: "#654321", radius: 8 } as never;
  renderToString(<ThemeProvider lightTheme={lightTheme}>{dashboard()}</ThemeProvider>);
  renderToString(<ThemeProvider lightTheme={lightTheme}>{dashboard()}</ThemeProvider>);
  renderToString(
    <ThemeProvider darkTheme={{ shadoww: "none" } as never}>{dashboard()}</ThemeProvider>,
  );
  expect(warn.mock.calls.map(([message]) => message)).toEqual([
    '[OpenUI dashboard] lightTheme contains unknown key "pagee". It will be ignored.',
    '[OpenUI dashboard] lightTheme key "radius" has a non-string value (number). All theme values should be strings.',
    '[OpenUI dashboard] darkTheme contains unknown key "shadoww". It will be ignored.',
  ]);
});

test("gives no warnings for a valid theme", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  renderToString(
    <ThemeProvider lightTheme={{ page: "#123456" }} darkTheme={{ surface: "#234567" }}>
      {dashboard()}
    </ThemeProvider>,
  );
  expect(warn).not.toHaveBeenCalled();
});
