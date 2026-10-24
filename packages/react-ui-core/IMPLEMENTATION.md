# First-slice implementation evidence

Issue: https://github.com/ankit-thesys/openui-comp/issues/9 (parent #7). User acceptance of the eager runtime styling cost is recorded in #8/#9 comments. This is a bounded browser-only migration, not whole-project completion or publication approval.

## Scope and provenance

Worker 1 owns package/build/root exports and existing themes. Worker 2 owns Button, Input, TextArea and their component tests in a separate worktree. This record currently covers the theme/scaffold increment; component integration is pending. Friend baseline paths and old production sources are untouched.

Starting revision: `c5699fdb4`. Theme data, algorithms and hooks originate from the read-only `packages/react-ui/src/components/ThemeProvider` directory at that revision. `preferences.ts` and the shared isomorphic layout effect are copied locally so the new package has no chart-folder or old-package build dependency. Runtime theme behavior remains unchanged. Contexts are excluded from the public root, as specified. No old SCSS/generated CSS input is required.

The public legacy theme contract includes top-level `body` targeting unless `cssSelector` is supplied, automatic nested scope, portal class selectors, light/dark and deprecated theme props, JSON preference persistence and document mode attributes. This extraction preserves those behaviors; it does not promise isolation between multiple default-body providers or cross-tab preference synchronization.

## TDD and checks

The first public-root test was executed before implementation and failed with `ERR_MODULE_NOT_FOUND` for the absent built entry. This is the new-package red checkpoint, not a bug in existing React UI. Copying the existing theme implementation and adding the build/root exports made the two root API/format tests pass. Six additional behavioral regression tests then passed without changing copied behavior. They are parity checks, not claimed as separate test-first bug fixes.

Node 22.22.2, pnpm 10.33.0, TypeScript 6.0.3, tsdown 0.21.10 and React/ReactDOM 19.2.4 were used. Goober is pinned to the evaluated 2.1.19 runtime. The exact dependency graph is in the workspace lockfile. React 19 is the declared major peer boundary; these checks do not certify every released minor or browser.

Executed commands:

```sh
pnpm --filter @openuidev/react-ui-core build
pnpm --filter @openuidev/react-ui-core typecheck
node --test packages/react-ui-core/tests/theme-exports.test.mjs
node --test packages/react-ui-core/tests/theme-behavior.test.mjs
node --test packages/react-ui-core/tests/packed-consumer.test.mjs
pnpm --filter @openuidev/react-ui-core check:publint
npm_config_cache=/private/tmp/openui-core-npm-cache pnpm --filter @openuidev/react-ui-core check:attw
pnpm install --filter @openuidev/react-ui-core --frozen-lockfile --ignore-scripts --offline
```

Results: ESM/CJS and declarations build; typecheck passes; two export tests, six DOM behavior tests and one packed-consumer test pass. Packed consumer checks run outside the workspace with normal offline dependency installation, root ESM/CJS imports and three TypeScript modes (NodeNext ESM/CJS and bundler). Its unused ThemeProvider import retains no package runtime in a normal production browser bundle. Publint and all declaration-analysis modes pass.

DOM behavior checks cover default hook values, light/dark updates and overrides, nested/independent selector scopes, a portal consumer, explicit nested selectors, deprecated alias/precedence warnings, preference persistence/reset/system changes, blocked storage, and teardown cleanup. They inspect public rendered outputs and stylesheet selectors in JSDOM; they are not Chrome visual/CSS framework certification. Component rendering, appearance, states, real browser overrides and root-only component bundle pruning are pending the component integration.

The sandbox initially blocked npm's default user cache and pnpm's consumer store access. npm checks use a temporary cache without changing the user's cache ownership; the consumer test passed with normal local store permissions. Those initial failures were environment failures, not package defects. pnpm's resolver proposed unrelated graph churn, which was removed: only the new importer (including test-only esbuild) and Goober package/snapshot were retained and the narrowed lockfile passed a frozen offline install.

## Remaining boundaries

No SSR/hydration/streaming-server support, release, deprecation, merge, old-package edits, dependency patches, new styling API or custom cache/guard/bridge is introduced. Package version `0.0.0-beta.0` is provisional until release review. The existing local full-library cold cost remains documented in README.md; these theme checks do not erase or remeasure it. Final first-slice acceptance also requires integrated component checks and review.
