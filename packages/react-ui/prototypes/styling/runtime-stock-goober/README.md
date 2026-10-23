# Stock Goober only

Read [REPORT.md](REPORT.md). **Decision OPEN.** The user rejected maintaining the experimental patch machinery. This fresh candidate uses the published unmodified Goober distribution. Historical static and patched candidates remain unchanged.

The archive contains actual frozen source copies, ordinary authored style objects, the small stock adapter, SSR/browser/Next controls, npm tarball and source, host CSS fixtures, raw outputs and failures. No production code is migrated. Framework fixtures are the same real plain CSS/Tailwind v3/v4 fixtures used in prior comparisons; their bytes are hashed with the archive.

Generated bundles, Next build output and dependency folders are omitted. The existing workspace `/Users/ankitdas/thesys/openui-styling-prototype` and its installed styling/real/Next dependencies are prerequisites. This is reproducible in that recorded local environment, not a standalone npm consumer distribution.

Prepare a fresh run without rewriting evidence:

```sh
python3 prepare-scratch.py /private/tmp/openui-stock-rerun
cd /private/tmp/openui-stock-rerun
node stock-controls.cjs
cd components
node catalog-build.mjs
node catalog-check.mjs
LAYERED=true node catalog-check.mjs
node bundle-check.mjs
node verify-stock.mjs
node next-build.mjs
cd ../chat
node build.mjs
node check-stock.mjs
cd ../next
node node_modules/next/dist/bin/next build --webpack
cd ..
node browser-check.mjs
```

Run catalog checks sequentially; they share port4386. Chat uses4387, Next uses4388. Harnesses reject occupied ports rather than terminating another process. Localhost/Chrome may require the approved execution context outside the sandbox. Catalog checks deliberately exit nonzero because the assessed compatibility requirements fail; their JSON results are the findings, not a command failure to hide. API controls record both passing and failing requirements without a failing process exit code.

Browser checks and chat checks capture errors in JSON; inspect `fatal`, `failure`, `errors`, and completion fields. Do not equate a zero process exit code with acceptance. The first failed Next run is preserved separately and attributed to duplicate React in the fixture, then corrected. Final results supersede that failed setup attempt.

`PRESERVED-SHA256.json` covers all archived files except itself. Stock tarball integrity is separately checked by `stock-controls.cjs`. The Goober production build input is recorded in the chat build manifest and Button ownership control; neither graph contains the private vendor patch. Old scratch-path references are retained in frozen evidence; `prepare-scratch.py` rewrites source paths only in the new copy.
