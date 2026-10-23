# Rerun the expanded runtime candidate

Start with [REPORT.md](REPORT.md). **Decision open.** The candidate uses a private experimental Goober 2.1.19 parser patch plus an OpenUI-owned cascade guard serializer. It is not stock Goober. Production source and prior static/runtime evidence are unchanged.

`PRESERVED-SHA256.json` lists the exact retained source and evidence bytes. Original scratch paths inside source/build manifests are intentional. Generated bundles, `.next` and dependencies are omitted; their measured hashes remain in the manifests. Reproduction creates new executable copies and new results, not a replacement for measured evidence.

## Prerequisites and scope

These diagnostics use the existing checkout at `/Users/ankitdas/thesys/openui-styling-prototype`, its installed `packages/react-ui/prototypes/styling/node_modules`, `real/node_modules`, `next-fixture/node_modules`, and compiled baseline `.real-dist/baseline.css`. Chrome must be installed. This is not a fresh npm package-install validation. On another machine, change the checkout path only in the new scratch copies and record the change. The prior `runtime-detailed` and `runtime-inline-followup/cascade-research` evidence remains in sibling directories; the preparation command copies their needed helpers/assets.

## Prepare and check correctness

From this directory:

```sh
python3 prepare.py /private/tmp/openui-expanded-rerun
cd /private/tmp/openui-expanded-rerun/openui-runtime-expanded-components
node verify-serializers.mjs
node catalog-build.mjs
node catalog-check.mjs
cd ../openui-runtime-expanded-chat
node build.mjs
node ssr-check.mjs
node check.mjs
node next-build.mjs
npm run build --prefix next
node next-check.mjs
```

Run sequentially. Checkers own their server processes. `debug-resource.mjs` with `SSR_DOCUMENT_MODE=fragment` reproduces the unsupported fragment-root style-remount case; do not present that expected failure as full-document support. The Next fixture server-renders an empty actual chat shell and a separately labeled Renderer/parser companion. Actual conversation streaming starts through HTTP after hydration.

## Measure in an exclusive window

Finish all builds first, then stop unrelated tests/builds. Fresh runs should write a fresh freeze, not verify an old manifest with rewritten paths. The performance fixture copies the checked candidate into its own snapshot.

```sh
cd /private/tmp/openui-expanded-rerun/openui-runtime-expanded-performance
SOURCES_FROZEN=1 node build-renderer.mjs
SOURCES_FROZEN=1 node freeze.mjs
PERF_EXCLUSIVE=1 node bench-renderer.mjs
PERF_EXCLUSIVE=1 node bench-fullchat.mjs
PERF_EXCLUSIVE=1 node ssr-pressure.mjs
PERF_EXCLUSIVE=1 node soak-server.mjs
PERF_EXCLUSIVE=1 node soak-browser-rss.mjs
node summarize.mjs
```

Use the versioned `soak-browser-rss.mjs` for the final browser protocol. The older `run-all.mjs` and `memory-all.mjs` remain execution history and name the earlier checker without RSS sampling. The final soak is four five-minute measured phases: server baseline/runtime, browser baseline/runtime. Setup/warmup/terminal idle are additional. `PERF_SMOKE=1` and `SOAK_SMOKE=1` shorten execution and must never be reported as full measurements. No forced GC occurs during load. Browser RSS sums are gross per-process observations, may count shared pages more than once, and are not a style-engine allocation measurement or a pass/fail budget.

`chat/inventory-v2-check.mjs` is the post-timing accounting audit: it checks the original executed source/build manifest and consumes the recorded browser soak and encoding control. Its historical hashes will not match a rebuilt scratch automatically. The preserved v2 result is the authoritative byte inventory; do not substitute the older `inventory.mjs` total, which omitted guard CSS. `encoding-check-v1.mjs` is the separately versioned UTF-8 header-only diagnostic.

For the separate Button bundle audit, run `node audit-bundle.mjs` from the prepared `openui-runtime-expanded-report` folder. React is external; baseline CSS is excluded. This is not public package-barrel/tarball certification.

## Evidence navigation

- `components/`: frozen descriptors, per-component metadata, actual catalog, private engine provenance/patch, parser and selector checks, bounded coverage.
- `chat/`: actual full-chat and production Next fixtures, correctness results, aggregate style inventory, failed fragment/initial-store experiments.
- `performance/`: exact workloads/checkers, raw matched measurements, per-phase source/build manifests, full soak series and preserved failed harness attempts.
- `bundle-audit.json`: corrected dedicated Button audit; `bundle-audit-first-aggregate-retention.json` preserves the initial payload failure.
- `PROTOCOL.md`: pre-measurement parent protocol. Read the final report for deviations and limitations.
