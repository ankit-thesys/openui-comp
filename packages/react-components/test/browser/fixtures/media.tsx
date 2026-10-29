import { ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { MediaCases, type MediaFamily } from "./media-cases";
const params = new URLSearchParams(location.search);
createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    mode={params.get("mode") === "dark" ? "dark" : "light"}
    cssLayer={params.get("layer") ?? undefined}
  >
    <MediaCases family={(params.get("family") ?? "image") as MediaFamily} />
  </ThemeProvider>,
);
