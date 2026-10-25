# Independent installed math integration verification

Production revision: `a288334807643bdc63acb75c08af3e7aef7d759e`.
Worker2 reviewed the committed integration and exercised the exact frozen normal npm install supplied by Worker1. This is math integration evidence only; previous non-math matrices retain their original artifact scope.

## Final result

**PASS: six cases / 3,444 paired math element snapshots**, Chrome156.0.8078.47, Vite6.4.2. Plain CSS, Tailwind3 and Tailwind4, each host stylesheet before/after the active vendor stylesheet. Each case compares automatic styling against an isolated official vendor-CSS reference through light/dark/custom state, a nested dark provider, then ordinary text followed by a new formula via the existing prop.

- Automatic CSS and real WOFF2 fonts load through ordinary public imports; no consumer CSS import, loadStyles call, setup command or styling plugin.
- Two wrappers use one effective automatic stylesheet. Candidate never requests the test-only reference URL. Reference disables automatic CSS and keeps only its explicit vendor link active; host order is asserted against the active stylesheet in each arm.
- The entire fixture is built with Vite base `/review/`; lazy JS/CSS/font requests succeed at that non-root deployment path without server asset rewrites.
- Unrelated host sentinel remains unchanged; no page errors, failed requests or HTTP asset errors.
- Late text-to-math updates match the explicit reference. Existing effect still starts loading on wrapper mount; this does not claim content-based loading.
- Button-only output contains no math JS/CSS, and its browser downloads none of the math CSS/fonts. The accepted **59 emitted unused font files / 1,072,948 bytes** remain. Emission and transfer are different measurements.
- Independent native public-root ESM and CJS imports pass. CSS and renderer resolve0.16.47 and identical vendor CSS bytes.

The source/lock review found one unrelated lockfile change described below. A math browser pass is not full integration acceptance while that review item remains unresolved.

## Artifact and immutability

Tarball: `/private/tmp/core-math-final-artifact/openuidev-react-ui-core-0.0.0-beta.0.tgz`,401873 bytes.
SHA256: `8709be66bc8b6b5ffd859b3df4fda1507ee63f9b7a75506c149a2aaf56012537`.
Normal install: `/private/tmp/core-math-final-consumer`.

Before building, the runner verifies tarball bytes/hash, non-symlink package installation and **every installed package file against the extracted verified archive**. It records the installed manifest, consumer lock hash, runner hash, fixture source hash, host stylesheet hashes and used/unused output manifests in `final/report.json`. After testing it confirms the installed package and lock are unchanged. Scratch fixture uses a symlink to the frozen consumer's node_modules; the installed core package itself is a normal npm directory. No files are created in or deleted from the consumer.

Final runner SHA256: `784de97b5c717d44ab8300f53e6bae0c9a5d58ea0a93eaaa8b3fb2bd9c1cae5b`.
`verify.mjs` is the exact measured runner. It uses default Vite CSS processing; only fixture root/output/base options are supplied. The HTTP server serves built assets at their emitted paths; explicit vendor-reference and host styles are comparison inputs, not product delivery machinery. Snapshots wait for real fonts and settle finite animations; they certify settled endpoints, not transition frames.

## Review

Production implementation matches the accepted stable candidate: existing effect imports private mathRenderer, which imports unmodified vendor CSS and re-exports rehype-katex. Direct runtime dependency is declared; public props/export map and tsdown configuration stay unchanged. No custom injector/parser/cache/pruner, experimental CSS plugin, CDN or font-copy mechanism.

Independent Spec review found no source/spec mismatch. Existing full markdown/header/GFM/literal-dollar behavior and strict declaration checks are owned by Worker1's integrated package CI; this independent math runner does not replace them. Independent Standards review identified reference-isolation and installed-to-archive provenance gaps in the first test version; both were corrected and re-reviewed with no remaining actionable test findings. The active stylesheet order assertion was also independently reviewed.

### Actionable integration review item: unrelated lock drift

At source revisiona28833480, `pnpm-lock.yaml` changes the pre-existing `@openuidev/thesys@0.3.2(...)` snapshot's direct KaTeX dependency **0.16.44 → 0.16.47**, and removes the0.16.44 package/snapshot entries (new line13988 vs baseline line13928). This is outside adding the new core dependency and changes an existing application's dependency resolution despite the preserve-existing-code scope. Restore that unrelated resolution and its required entries unless the root explicitly accepts the broader update. Do not fix by adding global overrides or modifying legacy source. Worker1 owns this lockfile correction and the appropriate frozen-lock check. No shared files were edited here.

## Preserved attempts and limits

`first-run/`: original test-tool failure resolving Playwright through ESM named exports; no browser matrix ran. Corrected to Playwright's normal CommonJS API; no product change.
`pre-review/`: initial passing run before reviewer-requested reference/provenance strengthening; not the final acceptance evidence.
`pre-order-check/`: passing strengthened run before an explicit host-order assertion against each active reference stylesheet was added. Retained separately, not relabeled.
`final/`: final reviewed-run raw report/log. No assertions weakened; all changes strengthened the test or corrected its tooling.

No unrelated historical matrices or full suite were repeated. Worker1 already records integrated CI97/97, strict three-mode consumers and original public behavior; this document does not turn those into independently rerun results. SSR/hydration/streaming, concurrency, failures/offline/CSP and performance/memory remain outside this check. Bare-esbuild extra setup and unused emitted font cost are accepted limits, not patched away.

**Browser released to Worker1.** Final runner exited successfully and closed its browser/server in finally cleanup. No active measurement remains. No production/legacy/previews/crates changes, ticket closure, merge, publication or slice13 work.
