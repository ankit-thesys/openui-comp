import { ThemeProvider, TooltipWrapper } from "openui-under-test";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
declare const __PARITY_BASELINE__: boolean;
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
function App() {
  useEffect(() => {
    // Focus opens Radix's real portal; attributes name owned parts without changing their styles.
    const observer = new MutationObserver(() => {
      const content = document.querySelector('[data-state="instant-open"][data-side]');
      if (!content || content.hasAttribute("data-parity-case")) return;
      // Preserve trigger focus when the parity harness presses inside non-focusable content.
      // Otherwise Radix closes the portal on trigger blur before the active snapshot.
      content.addEventListener("mousedown", (event) => event.preventDefault());
      content.setAttribute("data-parity-case", "heading-and-content");
      content.setAttribute(
        "data-parity-parts",
        JSON.stringify({
          body: __PARITY_BASELINE__ ? ".openui-tooltip-body" : ".openui-tooltip-wrapper-body",
          heading: __PARITY_BASELINE__
            ? ".openui-tooltip-heading"
            : ".openui-tooltip-wrapper-heading",
          text: __PARITY_BASELINE__
            ? ".openui-tooltip-text-content"
            : ".openui-tooltip-wrapper-text",
        }),
      );
    });
    observer.observe(document.body, { subtree: true, childList: true });
    document.querySelector("button")!.focus();
    return () => observer.disconnect();
  }, []);
  return (
    <ThemeProvider mode={mode}>
      <TooltipWrapper tooltipHeading="Heading" tooltipContent="Content" delayDuration={0}>
        <button style={{ margin: 100 }}>Show tooltip</button>
      </TooltipWrapper>
    </ThemeProvider>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
