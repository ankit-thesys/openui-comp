# Integrated slice #11 — ready for review

Production integration: `66547405c`. Final browser runner: `135da0d8f`. Worker 2 commits `fb46c2103` and `1234eb902` were integrated as `d0bccb9b9` and `d179585bf`. The root exports Modal/ModalProps and TooltipWrapper/TooltipWrapperProps; Tooltip uses the legacy dependency range `^1.2.7`.

## Final checks

- Combined core CI at production revision: **64/64 tests**, formatting, lint, strict types, isolated old-source-free build, normal packed consumer, publint and attw passed. Two inherited ThemeProvider hook warnings remain; zero lint errors.
- Normal installed package: **53/53 public component, native ESM/CJS import and bundle-pruning tests** passed. Button-only imports exclude both overlays; each overlay excludes unrelated layout code/styles.
- Strict TypeScript 5.9.3 consumers, `skipLibCheck: false`, passed Bundler, NodeNext ESM and NodeNext CommonJS, covering container and overlay public APIs.
- Final Chrome 156.0.8078.47: **12 configurations / 4,674 paired snapshots** passed for Modal and Tooltip, plain CSS/Tailwind v3/v4, both stylesheet orders, five theme states, real positioning/truncation, responsive geometry, explicit overrides, controlled state, dismissal, nested/independent portal themes and unmount/remount cleanup. Final exit status was zero. Comparisons use Radix Tooltip 1.4.1 in both arms.
- Container checkpoint evidence remains separately archived under `../layout-containers`: 30 configurations / 132,051 paired snapshots plus loading animation checks. Those completed matrices were not repeated without a new reason. Combined installed tests and CI were rerun after overlay integration.
- Exact normal-installed tarball: **246,462 bytes**, SHA256 `784a951ebf8cf974b6a275b72a7c58fa8ed8abc0c400266efc8808a4fa9f09ea`. Its 637 dist files match the current build byte for byte; it contains no CSS/SCSS archive entries. Legacy source diff is empty. This 5.26% archive-size increase over the container checkpoint is not a runtime performance measurement.

React/ReactDOM 19.2.4 and stock Goober 2.1.19. Workspace Tooltip 1.2.7 passed producer checks; the normal consumer resolved Tooltip 1.4.1, Accordion 1.3.1 and Tabs 1.2.1. Results do not certify every dependency version in the published ranges. No consumer CSS import, setup plugin, runtime patch or old stylesheet dependency was added.

## Standards

Independent GPT-6.1 Sol review: **zero actionable findings**. Conventional public Goober css/keyframes; legacy logic retained. Test-only dependency alignment also reviewed with zero findings.

## Spec

Independent GPT-6.1 Sol review: **zero actionable extraction findings**. Public APIs and styling boundary preserved. The review does not approve inherited accessibility deficiencies or establish SSR support.

## Inherited limitations requiring review

Modal initially focuses content but has no focus trap or focus restoration; nested dialogs share a title ID. Tooltip truncation replaces its child ref. A composed tooltip can remain mounted after pointer leave/dialog focus in both arms; parent unmount cleans it up. See `../../src/components/Modal/__tests__/INHERITED_LIMITATIONS.md` and raw inherited observations in browser-final.json. No accessibility redesign or baseline repair was silently introduced.

These are explicit review items, not extraction-only failures. Do not claim accessible Modal certification or complete child-ref preservation. SSR/hydration/concurrent server style isolation, performance and memory soak are outside this slice's validation. Settled animation endpoints are checked, not every intermediate frame.

## Evidence and reproduction

Raw logs, strict type logs (empty on success), consumer lock, artifact/source/build hashes and exact tarball are preserved here. `COMPARISON_DIAGNOSIS.md` explains the two retained failed runs: unmatched Radix versions produced different hidden accessibility subtrees. The test-only correction uses the same public Tooltip dependency for both arms and preserves all node-count/style assertions. Product code did not change.

Run the package's `pnpm --filter @openuidev/react-ui-core run ci`; run public `src/components/*/__tests__/*.test.mjs` against CORE_CONSUMER; run Modal/__tests__/compatibility.browser.mjs with the documented normal browser/Sass/host-style tooling environment. The container and overlay test READMEs describe the seams. Temporary paths in logs are maintainer tooling, not consumer setup requirements.

No merge, publication, upstream write or issue closure is authorized by this archive. Neither preview checkout was modified. Slice #11 is ready for orchestrator review and a stacked draft; inherited product decisions remain for review.
