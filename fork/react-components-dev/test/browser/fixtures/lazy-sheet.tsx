import { configureStyles, css, keyframes } from "openui-under-test";
import { lazy, Suspense, useLayoutEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";

const params = new URLSearchParams(location.search);
configureStyles({ layer: params.has("layer") ? "openui" : undefined });

// Model a bundler evaluating a newly available module synchronously in a lazy initializer.
// An ordinary import() resolves outside React and lets the microtask writer hide the gap.
function evaluateModule() {
  const animation = keyframes`from { opacity: 0.31; } to { opacity: 0.91; }`;
  const root = css`
    box-sizing: border-box;
    width: 153px;
    height: 47px;
    padding: 9px;
    animation: ${animation} 10s linear;
  `;
  return {
    default: function Measured() {
      const ref = useRef<HTMLDivElement>(null);
      useLayoutEffect(() => {
        const element = ref.current!;
        const bounds = element.getBoundingClientRect();
        const sheet = document.getElementById("openui-styles")?.textContent ?? "";
        element.dataset["firstLayout"] = JSON.stringify({
          width: bounds.width,
          height: bounds.height,
          padding: getComputedStyle(element).padding,
          animation: getComputedStyle(element).animationName,
          expectedAnimation: animation,
          keyframesWritten: sheet.includes(`@keyframes ${animation}{`),
          layered: sheet.startsWith("@layer openui{"),
        });
      }, []);
      return <div ref={ref} className={root} data-testid="measured" />;
    },
  };
}

const LazyMeasured = lazy(
  () =>
    // React accepts synchronous thenables; its type requires a Promise.
    ({
      then(resolve: (module: ReturnType<typeof evaluateModule>) => void) {
        resolve(evaluateModule());
      },
    }) as Promise<ReturnType<typeof evaluateModule>>,
);

function RenderRegistered() {
  const Measured = evaluateModule().default;
  return <Measured />;
}

const root = createRoot(document.getElementById("root")!);
// Keep registration and first layout in one task: a concurrent yield would hide a late write.
flushSync(() => {
  root.render(
    <Suspense fallback="Loading">
      {params.has("render") ? <RenderRegistered /> : <LazyMeasured />}
    </Suspense>,
  );
});
