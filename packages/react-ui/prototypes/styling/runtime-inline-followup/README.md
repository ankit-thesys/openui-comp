# Rerun without changing the evidence

Start with [REPORT.md](REPORT.md). Sources and raw results are frozen exactly as measured; original absolute paths in hashes are intentional. Build artifacts and dependency directories are omitted. See `PRESERVED-SHA256.json` for the frozen-file inventory.

These diagnostics use the existing prototype checkout at `/Users/ankitdas/thesys/openui-styling-prototype`, its installed `packages/react-ui/prototypes/styling` dependency groups (`node_modules`, `real/node_modules`, `next-fixture/node_modules`, framework generators), and its baseline `.real-dist/baseline.css` and `public/frameworks` assets. Chrome must be installed. This is not a fresh package-install validation. The preceding `runtime-detailed` experiment and its fixture dependencies must be present. On another machine, change checkout paths only in the scratch copy and record that change.

Prepare a fresh directory. This copies the frozen controls and prior helper sources, replacing only temporary-directory references in executable source copies. It does not modify the stored results. Rerun commands write NEW results over the copied results; historical hashes in those copies are not a new provenance manifest.

```sh
python3 prepare.py /private/tmp/openui-inline-rerun
cd /private/tmp/openui-inline-rerun/inline-next/combined-control
node next-build.mjs
npm run build --prefix next
node next-check.mjs
```

The checker starts and stops the production Next server on port 4235. Run controls sequentially; use `inline-next/scoped-control` for the 29-check isolated scope control, or `inline-next` for the first candidate that preserves the body leak. Do not interpret all gates in that first candidate as expected passes. `table-baseline-reference.mjs` requires its production Next server to be running; the saved measured reference includes independent baseline asset hashes.

For the isolated cascade checks (port 4236):

```sh
cd /private/tmp/openui-inline-rerun/cascade-research
node build.mjs
node refined-check.mjs
node size-check.mjs
node cursor-check.mjs
```

Checked-in framework assets include full Preflight and cursor utilities; `frameworks.mjs` can regenerate them using the original installed generators. `root-metadata.mjs` records the source selector ownership method; no need to regenerate metadata to replay the measured candidate. `check.mjs` is the earlier comparative matrix; `refined-check.mjs` is the final 16-property candidate matrix. The strict cursor suite intentionally retains four failing contract cases. Read JSON outcomes, not only shell exit codes.

Next's 85 checks include overlapping correctness assertions, not 85 independent performance measurements. No new full-chat or long-soak claim is made. Old static and runtime evidence remains in sibling directories.
