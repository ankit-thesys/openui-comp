import { library, ThemeProvider } from "@openuidev/dashboard-library";
import { Renderer } from "@openuidev/react-lang";
import { renderToString } from "react-dom/server";
import { expect, test } from "vitest";

const program = `root = Dashboard([Section("Revenue", [Row([Card("Sales", [], "half")])])])`;
const dashboard = () => <Renderer library={library} response={program} />;

test("renders on the server", () => {
  const html = renderToString(<ThemeProvider mode="dark">{dashboard()}</ThemeProvider>);
  expect(html).toContain('data-dashboard-mode="dark"');
  expect(html).toContain("openui-dashboard-root");
  expect(html).toContain("Sales");
});

test("server HTML already carries the theme tokens, before any script runs", () => {
  const html = renderToString(
    <ThemeProvider mode="dark" darkTheme={{ surface: "#234567" }}>
      {dashboard()}
    </ThemeProvider>,
  );
  expect(html).toContain("--openui-dashboard-page:#141414");
  expect(html).toContain("--openui-dashboard-surface:#234567");
  expect(html).toContain("--openui-dashboard-seq-ink-1:var(--openui-dashboard-ink)");
  expect(html).toContain("--openui-dashboard-space-2xl:36px");
  expect(html).toContain("color-scheme:dark");
  expect(html).not.toContain("<style");
});
