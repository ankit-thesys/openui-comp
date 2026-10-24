# First-slice implementation evidence

Issue: https://github.com/ankit-thesys/openui-comp/issues/9 (parent #7). User acceptance of the eager runtime styling cost is recorded in #8/#9 comments. This is a bounded browser-only migration, not whole-project completion or publication approval.

## Scope and provenance

Worker 1 owns package/build/root exports and existing themes. Worker 2 owns Button, Input, TextArea and their component tests in a separate worktree. The scaffold is committed as `f015d11ca`; Worker 2's component commit `321c624b6` is integrated here as `5802dcf4b`. Root exports, the minimal context and combined-package validation complete the owned integration work; the corrected browser matrix is reported passed and awaits its final evidence commit. Friend baseline paths and old production sources are untouched.

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

Theme increment results: ESM/CJS and declarations build; typecheck passes; two export tests, six DOM behavior tests and one packed-consumer test pass. Packed consumer checks run outside the workspace with normal offline dependency installation, root ESM/CJS imports and three TypeScript modes (NodeNext ESM/CJS and bundler). Its unused ThemeProvider import retains no package runtime in a normal production browser bundle. Publint and all declaration-analysis modes pass.

DOM behavior checks cover default hook values, light/dark updates and overrides, nested/independent selector scopes, a portal consumer, explicit nested selectors, deprecated alias/precedence warnings, preference persistence/reset/system changes, blocked storage, and teardown cleanup. They inspect public rendered outputs and stylesheet selectors in JSDOM; they are not Chrome visual/CSS framework certification. The integrated package additionally verifies root control exports/types/refs, native component interactions, automatic styling, unused-root pruning, Button-only independence and light/dark theme updates through a packed consumer. Chrome appearance/state/override certification is recorded separately by Worker 2.

The sandbox initially blocked npm's default user cache and pnpm's consumer store access. npm checks use a temporary cache without changing the user's cache ownership; the consumer test passed with normal local store permissions. Those initial failures were environment failures, not package defects. pnpm's resolver proposed unrelated graph churn, which was removed: only the new importer (including test-only esbuild) and Goober package/snapshot were retained and the narrowed lockfile passed a frozen offline install.

## Remaining boundaries

No SSR/hydration/streaming-server support, release, deprecation, merge, old-package edits, dependency patches, new styling API or custom cache/guard/bridge is introduced. Package version `0.0.0-beta.0` is provisional until release review. The existing local full-library cold cost remains documented in README.md; these theme checks do not erase or remeasure it. Final first-slice acceptance also requires review of the corrected component-browser evidence and the combined artifact.

## Component integration preparation

After the scaffold commit, the root-component export test and packed-consumer control assertions were run and failed specifically because `Button` was not yet exported. Those are the integration red checkpoints; the component files are independently owned and not replaced with stubs. The unchanged 22-line FormControl context is copied as internal support at `src/components/FormControl/context.tsx`; it defines its required interface locally and needs no additional types file or public export. Full FormControl migration is not included.

A production-source lint check reports zero errors and two inherited `react-hooks/exhaustive-deps` warnings about the legacy `userLightTheme` fallback object. They are disclosed rather than silently changing provider memoization in this extraction. Existing package lockfile bytes were verified unchanged after removing the new importer and Goober records.

## Integrated package results

The specific missing-Button public export checks became green after the component commit and four root re-exports were integrated. No component source files were edited by Worker 1. The packed consumer checks strict NodeNext ESM/CJS and bundler declarations for controls and themes, forwarded ref types, existing size and styling props, and rejection of `sx` and numeric Input size. It checks root-only ESM/CJS exports outside the workspace.

A production Button-only browser bundle excludes Input, TextArea and ThemeProvider data while retaining stock Goober styles. An unused root import retains no core/Goober runtime. The installed bundle renders a styled native Button without a CSS link. A separate packed-bundle consumer renders all three controls with ThemeProvider, changes light/dark mode with explicit custom token values, verifies public outputs/document variables and removes theme styles on unmount. These JSDOM checks establish packaging/runtime coupling; they do not replace Chrome state/visual checks.

An isolated build fixture copies only the new package source/configuration and the shared compiler config, reuses installed tooling/dependencies, and contains no `packages/react-ui` directory. Its ESM/CJS/declarations build and no CSS/SCSS artifact is emitted. The initial fixture invocation could not find the repository-level tsdown binary from a temporary non-workspace folder; it now invokes that existing CLI directly. This was test setup, not a legacy-style dependency.

The initial combined suite passed all 15 cases. The additional isolated-build check passed separately; the final full suite passed all 16 cases after adding the isolated-build and integrated theme-consumer checks. Lint has zero errors and two disclosed inherited warnings; formatting, Publint and all declaration-analysis modes pass. The unchanged stock Goober binary hashes to `3708e75d7cebc41beaab527374f9e0b21711437e6cf05cd3f7dff2c532086d43`. `git diff c5699fdb4 -- packages/react-ui` is empty. There are no stock-library modifications or global environment changes.

The five independent component/bundle tests also passed against `/private/tmp/openui-core-first-slice-consumer`, a normal offline installation of the integrated tarball, with React/ReactDOM 19.2.4. This consumer is separate from the workspace and imports the public root normally. Worker 2 reports 33,600 passing paired Chrome snapshots plus explicit expected custom-theme and hover-color assertions; its final evidence commit is still being integrated. The initial custom-dark review claim was corrected: the existing provider falls back from `darkTheme` to `lightTheme`, so the useful improvement was explicit overrides and independent expected-value checks, not a theme runtime fix.
