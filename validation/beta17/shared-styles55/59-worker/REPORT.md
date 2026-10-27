# Ticket #59 — shared root border-box extraction

**PASS within this bounded worker validation.** Independent runtime verification
and the combined #60 gate remain pending. This is not approval of #58 fallback
removal, #56 selector migration, merging, publishing or general beta readiness.

## Source and artifact boundary

- Base: independently verified #57 commit `50df8768157c5e76abda45bf39098ec4b87fa702`.
- Candidate commit: `67369bc07261c726cdc01f065b6e9b0fa70b3eab`; package tree `aacb627a0efe5c6ce36e9c3675e76577f35b90c2`.
- Worktree `/private/tmp/openui-shared-base-59`, branch `codex/shared-base-59`.
- Exactly seven owned production files: three root TSX files, their three style
  files, and private `src/styles/base.ts`. One stock-Goober css() class now supplies
  unlayered `box-sizing: border-box` only to Buttons, FormControl and TagBlock roots.
- All three spacing fallbacks are RETAINED. No fallback deletion is part of #59,
  following the user decision to preserve CSS-wide cleared-token behavior.
- Props, refs, stable hooks, descendants, layout, variants, error context and theme
  code remain intact. No defaults/entry/metadata, charts, kits, legacy or PR42 changes.
- Literal position inside the Goober stylesheet changes; this report establishes
  tested consumer precedence rather than claiming identical internal rule order.
- Baseline packed archive SHA256:
  `a7c562a0f284d8f290f414ce4bee2fae632c601470677d71046800a021e808e4`.
- Fresh candidate archive SHA256:
  `5d88d8a440a865ec7b3395a2b1888a8f4e288bb32f9efbb6b7565a4cd1b4ea9f`.
  Candidate was built here; W1's ignored failed-trial dist was never reused.
- `artifact-provenance.json` binds archive members. `source-binding.json` verifies
  all 371 owned embedded source-map files byte-for-byte against this checkout;
  external vendor source paths are recorded separately.

## Checks performed

Existing package build and typecheck pass. Native ESM/CJS imports preserve all
166 exports. Matched strict public consumer typechecks pass, including refs,
Buttons variants and TagBlock's existing `styles` prop. Unsupported variants
remain rejected. No new test dependency or tooling was installed.

A fresh isolated packed consumer uses the baseline dependency lock with only
local package path/integrity adjusted. It installs offline from the existing
store; baseline files are read-only. One dependency-store-location failure and
one malformed scratch lock-copy attempt are preserved in logs. The corrected
pinned install and consumer build pass; these setup errors are not product
failures. Existing tooling was reused: pnpm/tsdown/tsc, esbuild and Playwright.
The JSX fixture/server/runner are separate lab evidence, not production tooling.

Browser results: **480/480 checks pass**, 36 configurations: actual plain CSS,
Tailwind v3 and v4, each before/after library stylesheet placement, with six
consumer modes (none, caller class, stable root hook, more-specific root rule,
same-instance Goober caller class before import, and after import).

Each configuration compares baseline and candidate through optimized installed
public imports. Twenty-one captured states per arm include initial rendering,
horizontal/vertical Buttons, error-context Hint, disabled Button, inline boxSizing,
reverse mount order, explicit light/dark and nested theme scopes, inherited valid
spacing values and root/container remove/initial/unset/inherit token controls,
hover, keyboard focus and an Enter callback. Refs are checked across those states.
Default and reset gaps match the baseline. `cleared-token-observations.json`
extracts 120 spacing observations from the no-consumer-override controls.

Roots use 173px width, 11px padding and 5px borders. Independent positive controls
assert actual 173px border-box versus 205px content-box geometry according to
supported cascade order. Comparison includes child computed styles/geometry and
host button/input/text plus host divs carrying only the existing public root
hooks. Host observations remain unchanged across states and match the baseline.
Fonts load and finite CSS transitions settle before comparisons; no animations
or CSS rules are disabled to force a pass.

Four individual/combined imports per arm additionally check initial defaults
and stability over 100 render calls. Public package evaluation completes before
later consumer stylesheet insertion and first root mount in the after-order
fixture. Browser tests verify behavior, not generated hash text. Browser version
is recorded in SUMMARY.json/results.json (Chrome 156.0.8078.48).

Optimized metadata shows one Goober origin, retained defaults in all eight small
builds and retained shared-base contribution in all four candidate builds. No
unrelated chart, KaTeX, syntax-highlighter or Modal JS contributes to those small
imports. Combined JS changes from 229,516 to 229,485 bytes (-31); individual imports
are +16 bytes each. These are build observations, not a performance claim.

## Review, limitations and release

Source Standards and Spec reviews found no actionable findings after all gap
fallbacks were restored. Both final evidence reviews found no actionable findings; the Standards review
also checked this report wording. Independent browser reproduction is separate. This is
parity validation of a small refactor; no artificial red test or helper/hash test
was invented to claim a TDD cycle. The pre-agreed seam is built public component
behavior, and the existing baseline is the independent reference.

These roots introduce no portal rule. Full #60 portal/default integration remains
necessary. No expanded SSR/hydration, duplicate Goober versions, all-component
matrix, chart validation, performance, memory-soak or release-readiness claim is
made. Historical known failures and #58's reset incompatibility remain separate;
none was reclassified as passing here.

Owned browser and private HTTP server closed at
`2026-10-27T10:30:18.714Z` (16:00:18 Asia/Kolkata). The heavy-build/browser window
is explicitly RELEASED for the verifier. No browser/build reruns are planned
while packaging. Raw observations, checks, fixture, runner, build metadata, logs,
archives and hashes are retained in this directory.
