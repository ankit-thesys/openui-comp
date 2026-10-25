// `@storybook/test` (already a devDependency of packages/react-ui) bundles
// @testing-library/dom, user-event and the jest-dom matchers. Its `expect` is
// the one carrying those matchers, so tests import `expect` from
// "@storybook/test" rather than from "vitest".
import { afterEach } from "vitest";
import { cleanup } from "./render";

// Fail loudly rather than letting a missing DOM turn into dozens of confusing
// assertion errors further down. This also asserts the claim the config makes
// about jsdom being resolvable from vitest's own context.
if (typeof document === "undefined") {
  throw new Error(
    "[friend-text-media-baseline] No DOM. Expected environment 'jsdom'; " +
      "check that --config points at this directory's vitest.config.ts.",
  );
}

// React 19 refuses to run `act()` unless the environment opts in.
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// ---------------------------------------------------------------------------
// jsdom gaps touched by the in-scope families.
//
// These are HARNESS shims. They do not change legacy behavior, and every
// behavior that is only reachable because of a shim is recorded as such in
// docs/observed-baseline.md so the evidence stays honest.
//
//  * ResizeObserver  -- ScrollableTable observes its scroll container to decide
//                       whether to show its scroll affordances.
//  * scrollIntoView / scrollTo -- ScrollableTable's arrow buttons call these.
//  * IMPORTANT: image loading is deliberately NOT shimmed. jsdom never loads
//    images, so `onLoad`/`onError` never fire on their own. Tests dispatch those
//    events explicitly and set `naturalWidth`/`naturalHeight` per case, because
//    SourceFaviconImage's fallback is driven by natural dimensions. That makes
//    those assertions simulations of a browser event, not observations of real
//    decoding -- which is why the same behavior is also exercised against real
//    local image files in the Chrome runner.
// ---------------------------------------------------------------------------
const proto = Element.prototype as unknown as Record<string, unknown>;
proto["scrollIntoView"] ??= function scrollIntoView() {};
proto["scrollTo"] ??= function scrollTo() {};

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

afterEach(() => {
  cleanup();
});
