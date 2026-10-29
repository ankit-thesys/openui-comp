import { ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { TextCases, type TextFamily } from "./text-blocks-cases";
const params = new URLSearchParams(location.search);
createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    mode={params.get("mode") === "dark" ? "dark" : "light"}
    cssLayer={params.get("layer") ?? undefined}
  >
    <TextCases family={(params.get("family") ?? "text-block") as TextFamily} />
  </ThemeProvider>,
);
