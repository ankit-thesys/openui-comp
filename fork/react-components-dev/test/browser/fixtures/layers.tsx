// One app-wide layer, including rules registered before configuration and in a lazy module.
import { Button, configureStyles, css, getComponentStyles, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";

const imported = css`
  color: rgb(21, 43, 65);
`;
const layer = new URLSearchParams(location.search).get("layer") ?? undefined;

configureStyles({ layer });

export const layersFixture = {
  configureStyles,
  getComponentStyles,
  imported,
  loadLater: () => import("./layers-lazy"),
};
(window as Window & { layersFixture?: typeof layersFixture }).layersFixture = layersFixture;

createRoot(document.getElementById("root")!).render(
  <>
    <div data-testid="imported" className={imported}>
      Import-time rule
    </div>
    <Button data-testid="outside">Outside</Button>
    <ThemeProvider>
      <Button data-testid="default">Default</Button>
      <Button
        data-testid="icon"
        variant="secondary"
        size="small"
        tone="destructive"
        iconLeft={
          <svg viewBox="0 0 24 24" width="24" height="24">
            <circle cx="12" cy="12" r="10" />
          </svg>
        }
      >
        Icon
      </Button>
      <Button data-testid="disabled" variant="tertiary" disabled>
        Disabled
      </Button>
      <Button data-testid="utility" className="bg-red-500">
        Utility
      </Button>
      <Button data-testid="important-utility" className="!bg-red-500">
        Important utility
      </Button>
      <ThemeProvider>
        <Button data-testid="inherited">Inherited</Button>
      </ThemeProvider>
      <ThemeProvider>
        <Button data-testid="nested">Nested</Button>
      </ThemeProvider>
    </ThemeProvider>
  </>,
);
