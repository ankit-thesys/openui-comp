# Component-owned runtime Goober experiment

**Decision OPEN.** Read [REPORT.md](REPORT.md) first. CSS payload and SSR overhead improved, but the long-run Chrome RSS excess and unpaced dashboard overhead remain. [DESIGN-REVIEW.md](DESIGN-REVIEW.md) explicitly distinguishes ordinary optimizations from the inherited private parser, cascade guards and server-target dependency.

This archive preserves the tested source, raw results, failures, and hashes from the October24 follow-up. The original SCSS baseline and historical static/runtime prototypes remain unchanged. Production components have not been migrated. Frozen subordinate READMEs/protocols describe their preparation checkpoint; the completed run is documented in [the final measurement analysis](performance/results/FINAL-ANALYSIS.md).

## Contents and provenance

- `components`: actual copied components, per-module styles, private engine, ownership/coverage inventory and correctness tests.
- `chat`: actual copied chat shell, real store/parser integration, standalone SSR and production Next fixture.
- `performance`: copied Renderer candidate, matched browser/SSR/soak harnesses, raw outputs and per-phase source/build hashes.
- Top-level controls isolate the old eager-boundary defect and immutable compilation cost. They are microdiagnostics, not the final performance comparison.
- `PRESERVED-SHA256.json` hashes every archived file except itself. Archived files retain the exact measured bytes. Large generated browser/server bundles, maps, Next outputs and dependency folders are excluded; their measured hashes remain in manifests. This is not a standalone installed distribution.

Original scratch paths are retained in frozen evidence. `prepare.py` creates a new scratch copy and rewrites only known scratch-path references in source scripts; it never rewrites raw JSON evidence or the source archive. New builds/runs receive new hashes. The workspace and installed dependencies remain prerequisites: `/Users/ankitdas/thesys/openui-styling-prototype`, its styling/real dependency folders, and the TypeScript installation noted in component tooling. The production-source base is commit `c2ba24f390d5ebf14ba19178769bfda0a1005d6e` on the prototype branch; later archive-only commits do not change those production inputs.

## Reproduce without overwriting this evidence

```sh
python3 prepare.py /private/tmp/openui-owned-rerun
```

Use a fresh destination. Dependency directories are linked only when the existing local installed directories are present. Otherwise restore the recorded project dependency environment first; this helper does not fetch new versions.

In the generated `openui-runtime-owned-components` directory:

```sh
node check-ownership.mjs
node catalog-build.mjs
node catalog-check.mjs
node check-browser-target.mjs
node verify-serializers.mjs
node switch-engine-control.mjs
```

The archived authored copies already contain the ownership fixes. `build-shared.mjs` is an authoring regeneration step, not required merely to rebuild the frozen candidate. Review regenerated source separately before measurements.

In generated `openui-runtime-owned-chat`:

```sh
node build.mjs
node next-build.mjs
(cd next && npm run build)
node check.mjs
node ssr-check.mjs
node next-check.mjs
```

Its optional `prepare-shell.mjs` authoring step includes the reproducible portal-theme pass. Do not regenerate anything while measurements run.

In generated `openui-runtime-owned-performance`, after all correctness gates pass and other builds/Chrome sessions are stopped:

```sh
node build-renderer.mjs
SOURCES_FROZEN=1 node freeze.mjs
PERF_EXCLUSIVE=1 node run-all.mjs
node freeze.mjs --verify
```

Reserve ports4264/4265/4270 for performance; correctness uses4342/4343/4366. Never kill unknown occupied servers. Localhost/Chrome may need the normal approved execution context outside the sandbox. The full run includes ten alternating pairs per cell, pressure repetitions, three fresh-process short RSS pairs, then twenty measured minutes of server/browser soak plus warmups. Keep all failed gates; no candidate edits after freezing.

Top-level `audit-bundle.mjs`, `repro.mjs` and `cache-control.mjs` live in the generated `openui-runtime-standard-optimization`. The eager-boundary `repro.mjs` is expected to fail its no-unused-family assertion; this proves the preserved old defect. The helper also copies the prior expanded component and shared historical fixtures those controls reference.

## Archive verification

A fresh `prepare.py` copy rebuilt and passed the Button ownership/cache and eight concurrent late-resource checks. All archived-file hashes were verified. Git whitespace checking reports preserved trailing whitespace/blank EOFs in frozen copied sources, vendor/raw logs and generated JSX; these bytes are intentionally retained to match measured inputs. Newly authored top-level documentation/scripts pass the separate whitespace check.
