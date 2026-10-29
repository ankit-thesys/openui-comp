import { ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { TextCases } from "./text-blocks-cases";
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    <TextCases family="text-content" />
  </ThemeProvider>,
);
