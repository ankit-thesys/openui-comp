// One family per page, with lazy mounting for the import-time registration check.
import { configureStyles, Slider, SliderBlock, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
const params = new URLSearchParams(location.search);
configureStyles({ layer: params.get("layer") || undefined });
const mount = () =>
  createRoot(document.getElementById("root")!).render(
    <ThemeProvider>
      <div style={{ width: 420, padding: "48px 20px" }}>
        {params.has("block") ? (
          <SliderBlock
            label="Budget"
            variant={params.has("discrete") ? "discrete" : "continuous"}
            min={0}
            max={100}
            step={25}
            defaultValue={params.has("range") ? [25, 75] : [50]}
            disabled={params.has("disabled")}
            isStreaming={params.has("streaming")}
          />
        ) : (
          <Slider
            data-testid="slider"
            className="consumer-slider"
            variant={params.has("discrete") ? "discrete" : "continuous"}
            min={0}
            max={100}
            step={25}
            defaultValue={params.has("range") ? [25, 75] : params.has("min") ? [0] : [50]}
            disabled={params.has("disabled")}
            ref={(node) => node?.setAttribute("data-root-ref", "true")}
            leftContent={<svg width="16" height="16" />}
            rightContent={<svg width="16" height="16" />}
          />
        )}
      </div>
    </ThemeProvider>,
  );
if (params.has("lazy")) window.mountFixture = mount;
else mount();
