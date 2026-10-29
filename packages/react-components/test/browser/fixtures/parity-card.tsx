import { Card, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    {(["clear", "card", "sunk"] as const).flatMap((variant) =>
      (["standard", "full"] as const).map((width) => (
        <Card
          key={`${variant}/${width}`}
          variant={variant}
          width={width}
          data-parity-case={`${variant}/${width}`}
        >
          Body
        </Card>
      )),
    )}
  </ThemeProvider>,
);
