// `@storybook/test` (already a devDependency of packages/react-ui) bundles
// @testing-library/dom, @testing-library/user-event and the jest-dom matchers.
// Its `expect` is the one carrying the jest-dom matchers, so tests import
// `expect` from "@storybook/test" rather than from "vitest".
import { afterEach } from "vitest";
import { cleanup } from "./render";

// Fail loudly rather than letting a missing DOM turn into dozens of confusing
// assertion errors further down.
if (typeof document === "undefined") {
  throw new Error(
    "[friend-controls-baseline] No DOM. Expected environment 'jsdom'; " +
      "check that --config points at this directory's vitest.config.ts.",
  );
}

// React 19 refuses to run `act()` unless the environment opts in.
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// ---------------------------------------------------------------------------
// jsdom gaps that several legacy controls touch (Select/DatePicker popups and
// Slider all call into pointer capture / measurement APIs jsdom lacks).
//
// These are HARNESS shims, not changes to legacy behavior. Every behavior that
// is only reachable because of a shim is called out as such in
// docs/observed-baseline.md so the evidence stays honest.
// ---------------------------------------------------------------------------
const proto = Element.prototype as unknown as Record<string, unknown>;
proto["hasPointerCapture"] ??= function hasPointerCapture() {
  return false;
};
proto["setPointerCapture"] ??= function setPointerCapture() {};
proto["releasePointerCapture"] ??= function releasePointerCapture() {};
proto["scrollIntoView"] ??= function scrollIntoView() {};

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

afterEach(() => {
  cleanup();
});
