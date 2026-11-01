import { Citation, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { source, sources, useParityReady } from "./citations-sources-shared";

function Fixture() {
  useParityReady(2, true);
  return <Citation sources={[...sources, { ...source, faviconUrl: "" }]} />;
}
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    <Fixture />
  </ThemeProvider>,
);
