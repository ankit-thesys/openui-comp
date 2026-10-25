# CURRENT — targeted border correction independently PASS; browser released

New9fc archive / source9ee057613:6/6framework/order cases,360observations pass, including arm-specific darklogos, real hover/open/nested close, consumer-exposed and explicitoverride borders. Fulltargeted report:model-border-verification.md. No source/runtimepatch needed. Earlier streaming/assets results retain7adprovenance and were not repeated. Historicaloldarchive strict failure remains failed, no blanket originalmatrix rerun claimed. AllownChrome/server closed.

---

# CURRENT — independent verification complete; browser released

Corrected kits SHA2567ad36554f9a619b6ea0da7feb9280570078e2451051e8ac3d5d09abb30225880 and corea5d002d20a6fbed1cdb61cddc255f1619dc945d08cf9406eb3ce94e135988fe2. Metadata finding resolved.6/6independent browser/order cases and3asset-consumer cases pass. Exact results below and in independent-browser-results.json / asset-results.json. No new scoped product defect; known Worker2 strict hover comparison remains unpassed. Library cost1,899,071bytesJS /571,915gzip +217,634injectedCSS; accepted emittedfontcost1,072,948bytes/no unused downloads. #17performance/memory/SSR not inferred. All own Chrome/server resources closed; browser explicitly released.

Earlier checkpoint wording below is retained as historical evidence; final browser/assets section supersedes its pending statuses.

---

# Independent chat-kit #16 verification — non-browser checkpoint

Production frozen commit: `8405f44e0c4d53113802209cc2e9ce77528b4c0b`.
Verifier: isolated `/private/tmp/openui-chat16-independent-verification/` consumers, Node22.22.2/npm10.9.7. No production/worker/preview files changed. No browser, heavy pressure, performance or memory run.

## Actionable finding [P2]

`packages/kits/package.json:54` declares `zod: ^3.25.0 || ^4.0.0`; README line8 says 3.25+.
A normal consumer can install exact Zod3.25.0 successfully, but importing `@openuidev/kits/react/chat/libs` fails with ERR_MODULE_NOT_FOUND for `zod/dist/esm/v4/index.js`. Strict declaration checks also fail for zod/v4 and zod/v4/core. This is an upstream Zod artifact problem and an existing renderer ecosystem limitation, surfaced by the NEW kits package's advertised supported range; it is not a Goober regression or authorization to edit old packages.

Reproduction in isolated consumer:

```sh
npm install zod@3.25.0 --ignore-scripts --no-audit --no-fund
node native.mjs
node /Users/ankitdas/.codex/worktrees/2d0f/openui/node_modules/typescript/bin/tsc --noEmit --strict --skipLibCheck false --target es2022 --module nodenext --moduleResolution nodenext types.mts
```

Evidence: install-zod3-minimum.log, native-zod3-minimum.log, types-zod3-minimum.log. Choose a validated lower bound/documented range in the new package; test it rather than guessing which intermediate Zod version first works. Zod3.25.76 and4.4.3 pass below.

## Passed independently

- Expected SHA256 values for both handed-off tarballs verified.
- Normal npm-ci installed independent Zod4 consumer; all566 kits and2202 core archived files byte-match installed files; no links/source aliases. archive-verification.json.
- Native ESM AND CJS both approved subpaths, exact runtime export sets, package-root/private-subpath rejection.
- Strict skipLibCheck=false Bundler, NodeNext ESM, NodeNext CJS consumer modes on Zod4.4.3 and3.25.76. Six zero-error logs.
- Actual createStreamingParser at chunk sizes1,2,7,31,189; correct Table/BarChart/FollowUpBlock nodes, series payload and FollowUpItem text; prompt contracts.
- Actual Renderer with real React/jsdom: streaming disables input/submit; disabled clicks emit no action; empty required field blocks submit; completed input emits exact continue_conversation message plus formState containing Ada; followup emits its exact message; clear removes field; history restores Grace; unmount clears container. Passed on both tested Zod versions. This is functional cleanup, not transport cancellation or memory certification.
- Bundle checks: unused imports17bytes (console only); selected FollowUpItem12639bytes; ModelSwitcher143124bytes. Neither selected component retains library/react-lang/chart code; FollowUpItem does not retain ModelSwitcher. JS-only analysis externalizes CSS, so it makes no browser unused-style/download claim. Results/metafiles at bundle-results.json.
- Dist runtime/declaration scan finds no legacy react-ui runtime import/SCSS or deferred AgentInterface/ToolCall/ToolResult/assembled openuiLibrary references. Source maps may naturally retain original source paths and are not runtime imports.
- React19.2.4 and Goober2.1.19 deduped on inspected dependency graph, no installed old @openuidev/react-ui.

## Not tested / still pending

- Browser window remains Worker2's; independent Chrome style/theme/TW3/TW4 checks not run.
- Cancellation after an observed active transport connection and immediate server/timer cleanup not independently tested. Worker fixture retry/idle/final liveStreams assertions do not by themselves certify each cancellation boundary.
- Worker browser runner at frozen source appends after-order host stylesheet without explicitly awaiting link load or checking host-rule readiness. Final evidence should establish actual host CSS presence before computed-style claims; no false failure inferred yet.
- Assembled-library bundle/asset cost comparison not run while browser/worker resources are reserved.
- No whole-range Zod3/4 compatibility certification from these representative versions. Minimum3.25.0 demonstrably fails.
- SSR, phase-matched chart parity, #17 performance/soak acceptance remain out of this checkpoint.

## Provenance notes

The independent parser fixture initially guessed FollowUpBlock used a children key; source schema actually uses items. Correcting that verifier assertion produced the documented pass; it was a test-assumption correction, not product repair. An offline install first used an incomplete cache and failed; retry against existing chat16 cache completed normally. Zod3 download was made in a separate consumer; original/frozen consumer remained unchanged. Prior worker passes are not counted as independent results.

## Targeted metadata correction confirmation

W1 correction d9cc96898 / evidence da3b2c560 verified independently. Corrected kits archive SHA256 `7ad36554f9a619b6ea0da7feb9280570078e2451051e8ac3d5d09abb30225880`,237869bytes. Same566files; ONLY package.json and README changed. All566 installed files match corrected archive in BOTH isolated consumers; core untouched. Metadata now declares `^3.25.76 || ^4.0.0`.

Normal local-tarball installation, native ESM/CJS exports and strict NodeNext ESM/CJS consumer declarations pass on exact Zod3.25.76 and4.4.3. Logs: install-corrected-zod3/4.log, native-corrected-zod3/4.log, types-corrected-zod3/4.log. Initial peer-range finding is resolved for this corrected archive; no product-source or unaffected browser/function matrices repeated. An explicit npm dry-run downgrade reports the peer mismatch but exits0 even with strict-peer-deps, so this report does not claim the installer hard-rejects all unsupported explicit overrides. Both actual consumer installations remain at supported versions.

Browser still queued after Worker1's bounded library checks. W2 reports36semantic cases pass but a zero-width/border-style-none hover border-color strict comparison remains UNPASSED; evidence review must preserve it without claiming blanket visual parity. Not independently classified/reproduced here yet. Remaining independent transport-cancellation/asset-cost/browser checks remain pending.

## Independent browser/transport/assets checkpoint — completed; browser released

Explicit root browser window used after W1/W2 release. Chrome156.0.8078.47. Corrected kits7ad36554... and corea5d002... unchanged, normal independent consumer-zod4. Standard Playwright library + Vite already used by repository validation; no new tooling dependency/plugin/production machinery. Browser fixture authored independently; only generated framework CSS copied read-only from committed W1 evidence (TW3.4.19, TW4.3.3). Exact fixture hashes: browser-fixture-hashes.json.

**6/6 cases passed**: plainCSS/Tailwind3/Tailwind4, host before/after. Asserted CSS rule readiness and actual head order; sampled independent host normal/hover colors and compared component values after settling without assuming browser color syntax; native disabled and important cursor; real scoped theme logo change and portal model selection; live streamed UI and actions; required validation and exact form payload; followup action; clearing content. Zero page errors. This is scoped independent behavior/style evidence, not legacy screenshot equality or a full-component parity certification.

Cancellation was observed after server wrote a partial response (4–5chunks) while its active flag remained true. All6: AbortController caused browser net::ERR_ABORTED; response closed with ended=false; server timer cleared; writes and rendered response length stopped changing during bounded100ms observation; retry completed, actions worked. All12total streams closed, zero active at end. These prove this application fixture's cancellation/cleanup using public fetch+Renderer APIs; no kit-specific transport API or #17 memory guarantee is invented.

Automatic math: TextContent with supported double-dollar math rendered .katex without manual stylesheet setup; vendor stylesheet loaded automatically and math requested KaTeX Math Italic/Main Regular woff2fonts. The ordinary TextContent renderer had already loaded its lazy vendor stylesheet before explicit math, so stylesheet delivery is not claimed conditional on presence of math syntax. Math-only new requests are recorded separately.

Raw output: independent-browser-results.json and browser-final-run.log. Six full cases/streams and CSS order are explicit; no skipped case counted as pass. All node-run finally paths closed their browser/server resources, and the final scripts printed BROWSER_RELEASED / ASSET_BROWSER_RELEASED.

### Asset results (independent production Vite builds and actual browser requests)

| Entry | Requested main JS bytes | gzip bytes (offline calculation) | Injected Goober CSS bytes | CSS/font browser requests |
| --- | ---: | ---: | ---: | ---: |
| unused component imports |746|421|0|0|
| rendered FollowUpItem |198017|62505|883|0|
| assembled library only |1899071|571915|217634|0|

Each build emits59KaTeXfontfiles totaling1072948bytes although unused and component-only pages download none. This is the accepted emitted-font exception. Library build also emits1653JSfiles totaling3031325bytes (includes dynamic icon/math chunks),29288bytes vendorCSS, and those fonts. Only its1.90MBmainJS was requested on the library-only page. Costs include their dependencies and fixture code; no legacy/static baseline performance comparison or load-time threshold was run. Retain these costs for #17 rather than claiming runtime impact is proven small. Sources/requests/counts/raw+gzip distinctions in asset-results.json / asset-run.log.

### Evidence limitations retained

Worker2's strict ModelSwitcher hover border-color computed-value mismatch stays **UNPASSED** despite zero-width/border-style-none making that border unpainted. Passing our explicit FollowUpItem override checks does not waive that separate comparison or establish exact ModelSwitcher visual parity. Root must retain that disclosure/classification; no silent repair/waiver.

No new production defect was established by these final scoped checks. Original Zod minimum support finding resolved by corrected metadata. #17 performance, memory soak, SSR and broad unconditional chart/component parity remain untested by this verifier checkpoint.

### Verifier fixture corrections and command history

- Initial math check incorrectly used MarkDownRenderer/single-dollar syntax. Corrected to math-capable TextContent/double-dollar syntax. Original timeout was visible in tool output; its first raw log was accidentally overwritten by subsequent sandbox-listen failure, so only the honest correction note math-fixture-correction.md remains; no recreated raw original is claimed.
- A partial run passed plainCSS/TW3 but TW4 host-hover wait used hardcoded rgb while the browser computes oklch. Stopped it, replaced literal-color assumptions with host-derived settled comparison and added15s per-operation timeouts; final6/6run recertifies the corrected assertions. Partial log: browser-partial-fixed-math.log. No assertions weakened to avoid a product difference.
- Local listen initially denied by sandbox; authorized escalation reran the same isolated fixture.
- Reproduction from consumer-zod4: `node browser-run.mjs`, then `node asset-run.mjs`; requires installed artifacts, existing repository Vite/Playwright tools and Chrome. Both script/tool inputs live under /private/tmp except read-only tooling.

**Browser window explicitly RELEASED.** No production/push/merge/release/legacy/worker/preview/friend changes.
