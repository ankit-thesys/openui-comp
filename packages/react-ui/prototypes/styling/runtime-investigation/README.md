# Throwaway runtime Goober investigation

**Execution model reopened. Neither approach is accepted.** Start with [the measured report](results/RUNTIME-INVESTIGATION.md). Production extraction has not started.

This directory is an independent runtime experiment. It preserves prior static evidence rather than replacing it. The actual OpenUI component implementations and pinned dependency installations come from the sibling `openui-styling-prototype` checkout. Paths are intentionally recorded for this local spike; adapt `build-shared.mjs` and the explicit dependency imports before running on another machine.

From this directory, run `npm run check` to rebuild and execute the browser and production Next checks sequentially, then generate the report. Expect a nonzero exit because the final runtime candidate fails consumer overrides and Button hover parity. `npm run demo` starts the browser fixture on port4216; open `http://127.0.0.1:4216/standalone` for the actual import-only Button or `/?arm=runtime&scenario=dashboard`. The streaming route exposes `window.__run()` as its diagnostic start action. The Next checker uses and stops port4215. Keep unknown existing listeners intact.

Prerequisites: Node/npm, Google Chrome, and existing dependency installations/build assets in `/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/prototypes/styling`. Checked-in runtime descriptors are the measured inputs. Their one-time generator in `build-shared.mjs` documents the SCSS-to-object spike, but is not part of the runtime consumer path. Do not regenerate them casually while a test build is running. The complete source conversion required by the spec has not been performed.

`runtime/` owns actual component adapters, descriptor objects and scoped theme resources. `browser-*` replay the real SSE adapter/parser. `next/` demonstrates actual production SSR/hydration/Suspense delivery. `bundle-check.mjs` separately audits a component-only import and an unused import. `results/failed-where-source/` and earlier Next result files preserve the rejected selector attempt; they are not the current candidate.

Generated browser bundles, Next output, copied framework CSS and dependency links are intentionally not versioned. Raw reports and hashes record the exact tested source/builds. There is no full-runtime memory soak, full chat-store test, all-chart/portal certification, nested/dark-theme test or broad package-root tree-shaking claim in this focused pass.
