import { SourceFaviconImage, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { favicon, useParityReady } from "./citations-sources-shared";

function Fixture() {
  useParityReady(1);
  return (
    <>
      {[20, 24].map((size) => (
        <section key={size} data-case={`image-${size}`} style={{ width: size }}>
          <SourceFaviconImage url={favicon} alt="Example" width={size} height={size} />
        </section>
      ))}
      <section data-case="fallback" style={{ width: 24 }}>
        <SourceFaviconImage url="" alt="Example" width={24} height={24} />
      </section>
    </>
  );
}
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    <Fixture />
  </ThemeProvider>,
);
