import { ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { CardCases } from "./card-blocks-cases";
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    <CardCases family="context-card-block" />
  </ThemeProvider>,
);
