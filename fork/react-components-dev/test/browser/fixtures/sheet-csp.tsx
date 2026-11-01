import { Button, css, ThemeProvider } from "openui-under-test";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";

// Every style tag the library writes on a page: token defaults, the component sheet and a
// ThemeProvider's theme tag.
export const sheetCspFixture = {
  render(mode: "light" | "dark") {
    const root = createRoot(document.body.appendChild(document.createElement("div")));
    flushSync(() =>
      root.render(
        <ThemeProvider mode={mode}>
          <Button>Themed</Button>
          {/* A rule nothing registered before, so the sheet gets a browser write. */}
          <i
            className={css`
              color: rgb(7, 8, 9);
            `}
          >
            New rule
          </i>
        </ThemeProvider>,
      ),
    );
  },
};
(window as Window & { sheetCspFixture?: typeof sheetCspFixture }).sheetCspFixture = sheetCspFixture;
