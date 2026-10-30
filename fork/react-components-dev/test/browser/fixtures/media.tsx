import { configureStyles, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { MediaCases, type MediaFamily } from "./media-cases";
const params = new URLSearchParams(location.search);
configureStyles({ layer: params.get("layer") ?? undefined });
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={params.get("mode") === "dark" ? "dark" : "light"}>
    <MediaCases family={(params.get("family") ?? "image") as MediaFamily} />
  </ThemeProvider>,
);
