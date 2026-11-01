// Node seam: a server render carries ThemeProvider's theme variables in a hoisted tag, so a dark
// or custom theme is right before scripts run (#185).
import { defaultDarkTheme, defaultLightTheme, ThemeProvider } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

/** The hoisted theme tags in `html`: their `href`s and text. */
function themeTags(html: string) {
  return [...html.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)]
    .filter(([, attrs]) => /data-precedence="openui-theme"/.test(attrs!))
    .map(([, attrs, text]) => ({
      hrefs: (/data-href="([^"]*)"/.exec(attrs!)?.[1] ?? "").split(" ").filter(Boolean),
      text: text!,
    }));
}

describe("ThemeProvider on the server", () => {
  it("sends the dark theme's variables and portal selector", () => {
    const html = renderToString(
      <ThemeProvider mode="dark">
        <span>content</span>
      </ThemeProvider>,
    );
    const tags = themeTags(html);
    expect(tags).toHaveLength(1);
    expect(tags[0]!.hrefs).toHaveLength(1);
    expect(tags[0]!.text).toMatch(/^body, \.openui-theme-portal-\S+ \{/);
    expect(tags[0]!.text).toContain(`--openui-background: ${defaultDarkTheme.background};`);
    expect(tags[0]!.text).not.toContain(`--openui-background: ${defaultLightTheme.background};`);
  });

  it("scopes a nested provider to its own wrapper", () => {
    const html = renderToString(
      <ThemeProvider>
        <ThemeProvider mode="dark">
          <span>inner</span>
        </ThemeProvider>
      </ThemeProvider>,
    );
    const text = themeTags(html)
      .map((tag) => tag.text)
      .join("");
    const scoped = /<div class="(openui-theme-[^"]+)"/.exec(html)![1]!;
    expect(text).toContain(`.${scoped}, .openui-theme-portal-`);
    expect(text).toContain(`--openui-background: ${defaultDarkTheme.background};`);
  });

  it("names a theme by its rules, so a different theme gets a different tag", () => {
    const hrefsOf = (element: React.ReactElement) =>
      themeTags(renderToString(element)).flatMap((tag) => tag.hrefs);
    const light = hrefsOf(<ThemeProvider mode="light" />);
    expect(hrefsOf(<ThemeProvider mode="light" />)).toEqual(light);
    expect(hrefsOf(<ThemeProvider mode="dark" />)).not.toEqual(light);
    expect(hrefsOf(<ThemeProvider mode="light" cssSelector=".app" />)).not.toEqual(light);
  });

  it("adds no markup of its own around the children", () => {
    const children = (
      <>
        text<b>bold</b>more
      </>
    );
    const bare = renderToString(children);
    const withProvider = renderToString(<ThemeProvider>{children}</ThemeProvider>).replace(
      /<style[^>]*>[\s\S]*?<\/style>/g,
      "",
    );
    expect(withProvider).toBe(bare);
  });
});
