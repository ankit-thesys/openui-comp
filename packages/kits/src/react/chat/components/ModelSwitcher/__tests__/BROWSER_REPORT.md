# Component matrix — strict parity failed (#16)

Frozen product: `8405f44e0`. Chrome 156.0.8078.47, Vite 6.4.2.
No production source, installed dependency or legacy file was changed.
Browser and server are closed; browser released to Worker1, then verifier.

## Results

All 36 framework/order/theme cases completed both arms' behavior checks, with
no case exceptions or browser console/page errors. Keyboard and pointer model
selection, callback sequences, focus restoration, group order, recommended badge
precedence, portaled custom themes and nested dark/light isolation passed their
independent assertions. Follow-up native submit defaults, explicit button type,
click/keyboard callbacks, disabled suppression and tab exclusion passed.
Plain author CSS and Tailwind v3/v4 explicit overrides worked in both stylesheet
orders, including hover/disabled states. ModelSwitcher has no public disabled,
className or style prop; none was added or claimed tested.

**Strict computed-style parity remains failed.** Of 330 paired style-state
comparisons, 42 failed: all 36 trigger-hover cases and the six nested-isolation
cases whose inner trigger remains hovered. Each differs in four border colors
(168 property differences). Both arms report `0px none`; legacy resolves the
color to current text color, while runtime retains Select's hover border token.
No other sampled properties differ. This is not a blanket parity pass or a
pixel-based proof of identical appearance. Raw comparisons retain the difference
and the final diagnostic run exits nonzero.

The mismatch is local CSS cascade/reset behavior between the model trigger and
shared Select, rather than evidence of a Goober parser failure. A conventional
explicit border-color reset in the model hover/open rule is a possible narrowly
scoped fix. It has **not** been applied: product changes require coordinated
refreeze and affected validation. Do not normalize away the raw differences.

The three public component consumer tests and public Bundler-resolution type
fixture also pass against the same actual installed package. NodeNext package
checks, library integration/streaming, performance and SSR are outside this
component result; SSR remains deferred.

## Frozen artifacts and provenance

Consumer: `/private/tmp/chat16-final-consumer`, never reinstalled or replaced.

| Artifact     | SHA-256                                                            |
| ------------ | ------------------------------------------------------------------ |
| kits tarball | `3f70b06104ac8112f5146ee2aa85747c0bb582865defeb0f06d4523779c90831` |
| core tarball | `a5d002d20a6fbed1cdb61cddc255f1619dc945d08cf9406eb3ce94e135988fe2` |

Hashes were verified before execution. Complete installed kits/core dist trees
and manifests plus consumer manifest/lock were hashed before/after each reported
Chrome run and remained unchanged. Worker1's subsequent peer-minimum metadata
correction requires its separate archive; these hashes do not include it.

Authoritative completed diagnostic evidence:
`results/browser-8405f44e0-run5-diagnostic/report.json.gz`.
`results/browser-summary.json` lists every mismatch and archive hash;
`results/artifact-provenance.json` identifies both tarball paths/hashes.
The archived run5 runner and fixture exactly match recorded input hashes.
Current runner differs only by the subsequent existing-symlink target guard;
all historical measured fixture links were separately verified to point to the
inventoried consumer. Reproduction should preserve the pinned artifact and use
the recorded runner/fixture source in their normal test location.

Reports are gzip-compressed byte for byte; decompress normally to inspect JSON.
Generated Vite outputs, including vendor assets, are retained in local
`vite-builds` directories and identified by per-file hashes in each report;
generated dependency links and duplicate build outputs are excluded from Git.
Served CSS is retained with the authoritative run. Emitted assets are not a
measurement of network downloads or performance.

## Earlier attempts retained for diagnosis

- Bare-esbuild preflight failed before Chrome on vendor CSS/fonts. That harness
  did not match the accepted Vite contract. See the preflight JSON; no custom
  loader or package patch was introduced.
- Vite run1 built successfully, but sandbox policy blocked local server binding
  (`EPERM`). The authorized run used the normal execution escalation.
- Strict run2 stopped at its first hover border-color mismatch, with unchanged
  artifacts. Its raw failure is retained. Its earlier runner hash is recorded;
  an exact source archive of that intermediate runner was not retained.
- Diagnostic runs3/4 reached all cells but their behavior checks were incomplete
  because the harness asserted before Radix's asynchronous keyboard/close focus
  changes. They are historical test-timing failures, not accepted product
  behavior results. Both reports are retained; run3 also retains its exact
  runner source. Run4 records its runner hash without an exact source archive.
- Run5 waits for actual public focus state and completes all behavior checks;
  it still fails strict style parity. No filters dismiss properties or make
  failed diagnostic cases green.
