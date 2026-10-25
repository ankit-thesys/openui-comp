# Independent targeted ModelSwitcher border verification — PASS; browser released

## Exact artifacts and source

Production9ee0576133fbb1c444d03c169a81893ebf7631fd.
Kits:/private/tmp/chat16-model-border-artifacts/openuidev-kits-0.0.0-beta.0.tgz
SHA2569fc227a88cbf6d949247aee90e729efa58d669ba738674880396903db98785bb,237948bytes.
Core:/private/tmp/chat16-final-artifacts/openuidev-react-ui-core-0.0.0-beta.0.tgz
SHA256a5d002d20a6fbed1cdb61cddc255f1619dc945d08cf9406eb3ce94e135988fe2.

Independent archive comparison against7ad: only4ModelSwitcher style JS/map files changed;562others unchanged. Source adds borderColor:currentColor to the existing hover/open selector, preserving legacy border:none reset despite eager registration order. Conventional CSS; no new prop/runtime patch/core/legacy changes. New isolated normally installed consumer-border used. All566kits and2202core files match their archives AFTER the browser run; exact proof border-final-artifact-proof.json.

## Independent Chrome result

Chrome156.0.8078.47; **6/6framework/order cases PASS**,60observations each (360total). PlainCSS/TW3.4.19/TW4.3.3, both actual stylesheet orders; host rules loaded before assertions.0pageerrors. No screenshot normalization or property exclusion.

In each combination, all3arms (unthemed, outer provider, nested provider),2modes(light/dark),3consumer variants(default, exposed border, explicit color override),3real states(hover, open, closed while pointer remains) passed:

- Default computed bordercolor equals actual textcolor, width0px/style none.
- Existing consumer DOM-class CSS exposes1px solid border using only important width/style; computed bordercolor STILL equals textcolor. This demonstrates correction when a consumer makes the border visible.
- A winning explicit consumer border-color rgb(1,99,180)!important remains honored in allstates; existing width/style overrides remain1pxsolid. No ModelSwitcher className/style props added or assumed.
- Custom outer/nested text and interactive-border tokens deliberately differ, so inheriting the wrong interactive token cannot accidentally pass. Nested state and closing the nested menu preserve the intended reset.

Dark-logo assertions are arm-specific and passed: unthemed U stays UL in both rootmode states; outer O switches OL→OD; nested I inherits rootmode and switches IL→ID. This does not reproduce W1's ambiguous earlier L-vs-D failure. It does not establish which arm the prior harness sampled; retain that historical failure until its owner finishes diagnosis rather than assigning it to product or silently changing its expectation.

Raw results:border-browser-results.json. Exact authored inputs:consumer-border/border-run.mjs,border-app/app.tsx,border-app/index.html, hashes border-fixture-hashes.json. Command from consumer-border:`node border-run.mjs` with existing repository Vite/Playwright tools and Chrome. Raw log:border-browser.log ends BORDER_BROWSER_RELEASED; allownbrowser/server resources closed in finally.

## Scope and remaining limits

These targeted checks independently validate correction of the specific state-cascade defect on9fc. The old7ad/3f archive's strict failure remains historical FAILED evidence; it has not been relabeled as passed. No full rerun of Worker2's original36case broad component matrix is claimed here. Broader source/form/parser/native/asset/cancellation results retain their prior artifact provenance: product runtime8405 with metadata7ad. The only9fc runtime delta has been independently inventoried and tested in affectedstates; unchanged streaming/assets were not repeated.

Original Zod minimum peer issue remains resolved. No new actionable production issue found in this targeted run. #17performance/memory,SSR and unconditional broad parity remain outside this evidence. Allproduction/worker/legacy/friend/preview sources remained read-only. Verifier checkout's preexisting untracked files preserved.

**Browser explicitly RELEASED to orchestrator.**
