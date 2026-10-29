// #90: shared box sizing on every user, without changing their own layout.
// Bundled against both the current public package and #72. No intentional differences.
import { Buttons, FormControl, TagBlock, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";

const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
const child = <span data-parity-part="child">Content</span>;

createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    {([undefined, "horizontal", "vertical"] as const).map((variant) => (
      <div
        key={variant ?? "default"}
        data-parity-case={`buttons/${variant ?? "default"}`}
        data-parity-parts={JSON.stringify({ root: ".openui-buttons" })}
      >
        <Buttons variant={variant}>{child}</Buttons>
      </div>
    ))}
    {[false, true].map((hasError) => (
      <div
        key={String(hasError)}
        data-parity-case={`form-control/${hasError ? "error" : "default"}`}
        data-parity-parts={JSON.stringify({ root: ".openui-form-control" })}
      >
        <FormControl hasError={hasError}>{child}</FormControl>
      </div>
    ))}
    <div
      data-parity-case="tag-block/default"
      data-parity-parts={JSON.stringify({ root: ".openui-tag-block" })}
    >
      <TagBlock>{child}</TagBlock>
    </div>
  </ThemeProvider>,
);
