# Dark-logo failure — proven fixture package-identity error

Scope: source/build diagnosis only; no Chrome/server started and no product or
frozen consumer changed. Worker1 owns the next browser window following the
verifier's release. This diagnosis/preparation step claims no new browser result.

## Evidence and attribution

Worker1's archived failure is commit `c6741fe98`, run
`browser-model-border-9ee057613`: plain/host-before none/light completed strict
checks, then dark failed `L !== D`. Both arms' sampled normal colors were dark.
The old assertion did not record its arm or logo observations, so the raw
stack alone cannot directly attribute that assertion to a page.

The archived runtime module graph does establish an invalid mixed product graph:

- ModelSwitcher came from Worker1's workspace `packages/kits/dist`.
- Its useTheme came from workspace `packages/react-ui-core/dist` (only 227
  rendered bytes of that ThemeProvider module).
- The fixture ThemeProvider came from the normally installed consumer's core
  (2,890 rendered bytes).

In the emitted runtime chunk, ModelSwitcher calls useTheme reading workspace
`ThemeContext$1`, whose default mode is light. The fixture provides the installed
`ThemeContext` instead. These are different React contexts, explaining dark CSS
from one provider while the model logo reads light from the other context.
The baseline chunk has one matching context. This statically identifies the
runtime causal path; the archive's missing arm label remains disclosed.

The only product change since the earlier matrix is not a theme change.
No product/logo workaround is justified by this invalid fixture run.

## Conventional fixture correction

Generated Vite apps were nested inside the workspace `@openuidev/kits` package
without their own package manifest. Package self-reference can therefore select
the enclosing workspace package even with a node_modules link to the installed
consumer. This was not exposed in Worker2's earlier checkout, where Worker1's
kits package metadata was intentionally absent.

A direct Node public-import resolution probe at Worker1's original fixture
reproduces the split: kits resolves to the workspace dist, while core resolves to
the installed consumer. A standalone private app manifest resolves both imports
to the installed consumer. This is package scope resolution, not theme readiness
or a reason to weaken the expected dark logo.

The runner now writes an ordinary private fixture package.json for each arm.
It also rejects compiled kits/core module paths outside the inventoried installed
package roots, records those module origins, waits for the requested fixture
theme state to commit and records arm-labelled logo observations. The existing
`D` expectation remains unchanged. No resolver aliases, custom style runtime,
dependency deduplication patch or production change is introduced.

## Exact historical component-run qualification

The archived runtime module maps in both component evidence directories were
audited, deduplicating identical copied reports:

| Run                                            | Product modules resolved                                               | Valid scope of its claims                                                                                                                                                             |
| ---------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `browser-8405f44e0-run2`                       | Installed kits/core only; one provider module                          | Authentic installed-artifact strict hover failure in its first case; no full-matrix pass.                                                                                             |
| `browser-8405f44e0-run3-diagnostic`            | Installed kits/core only; one provider module                          | Historical partial observations; timing failures prevent full behavior certification.                                                                                                 |
| `browser-8405f44e0-run4-diagnostic`            | Installed kits/core only; one provider module                          | Historical partial observations; timing failures prevent full behavior certification.                                                                                                 |
| `browser-8405f44e0-run5-diagnostic`            | Installed kits/core only; one provider module                          | Its scoped 36-case behavior completion and 42 strict style failures remain correctly attributed to installed 8405. It is not a green styling result or evidence for a later artifact. |
| `browser-model-border-9ee057613` (`c6741fe98`) | Workspace kits plus workspace and installed core; two provider modules | All three recorded cells use an invalid mixed graph. Neither the none/light passes nor the dark-logo failure certify normally installed 9ee behavior.                                 |

Worker2's source-only scratch producer and unit/type checks were explicitly
separate evidence; they are not retroactively treated as final browser results.
This audit covers these retained component reports, not unrelated library,
performance or package-check reports. Those require their own provenance checks.
Machine-readable module-path proof is retained in
`results/module-origin-9ee057613/historical-component-origins.json`.

## Validation and Worker1 handoff

`--prepare` on `/private/tmp/chat16-model-border-consumer`, labelled product
`9ee057613`, builds both arms with the corrected fixture. Origin guards pass,
the product graph uses the normally installed kits/core, and pre/post installed
inventories match. No browser is launched in prepare mode. The lossless prepared
report, source copies and resolution proof are retained in
`results/module-origin-9ee057613`.

Syntax/format checks pass. Independent Spec and Standards reviews found no
actionable issue in the correction. Worker1 can integrate this harness-only
correction, use its next browser window and rerun the strict focused matrix
against the same immutable product, with `KIT_PRODUCT_COMMIT` and a fresh output
directory. No product refreeze is needed for a fixture change. Readiness and
module-origin assertions must remain enabled, and the dark-logo expectation
must remain `D`. Preserve the earlier failed archive as invalid-fixture evidence.
