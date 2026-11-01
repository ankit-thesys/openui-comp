import { ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { MediaCases } from "./media-cases";
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    <MediaCases family="image-gallery" parity />
  </ThemeProvider>,
);
