# Goober prototype: generated evidence

Browser: Chromium 156.0.8078.47. 30 cases recorded; 0 execution errors.

Each cell is base styles / consumer override. Failing outcomes remain visible.

| Engine | Policy | Framework | CSS before | CSS after |
| --- | --- | --- | --- | --- |
| goober | default | none | PASS / PASS | PASS / PASS |
| goober | default | tailwind3 | PASS / FAIL | PASS / PASS |
| goober | default | tailwind4 | PASS / FAIL | PASS / FAIL |
| goober | default | bootstrap | PASS / FAIL | PASS / PASS |
| goober | default | plain | PASS / FAIL | PASS / PASS |
| goober | layered | none | PASS / PASS | PASS / PASS |
| goober | layered | tailwind3 | FAIL / PASS | FAIL / PASS |
| goober | layered | tailwind4 | PASS / PASS | PASS / PASS |
| goober | layered | bootstrap | PASS / PASS | PASS / PASS |
| goober | layered | plain | PASS / PASS | PASS / PASS |
| goober | adapted | none | PASS / PASS | PASS / PASS |
| goober | adapted | tailwind3 | PASS / PASS | PASS / PASS |
| goober | adapted | tailwind4 | PASS / PASS | PASS / PASS |
| goober | adapted | bootstrap | PASS / PASS | PASS / PASS |
| goober | adapted | plain | PASS / PASS | PASS / PASS |

## Shared Goober host check

{"before":"rgb(12, 130, 120)","after":"rgb(12, 130, 120)","hostCascadePreserved":true,"hostSheetTextPreserved":true,"hostSheetPositionPreserved":true,"ownedSheetCount":1,"pass":true}

## Classic SSR and hydration

- goober: PASS
- goober-generated-react19: PASS
- goober-generated-react19-client-only: PASS

## Built adapter assets

- goober-g6KYsim0.js: 6150 bytes; 1735 gzip bytes. Shared React/fixture code excluded; adapters include prototype policy logic, so these are not official library sizes.
- goober.modern-CN1HfR1e.js: 1972 bytes; 1154 gzip bytes. Shared React/fixture code excluded; adapters include prototype policy logic, so these are not official library sizes.

## Limits

- Representative components, not production OpenUI ports
- Chromium only
- Production Next.js evidence is recorded separately in results/next.json
- No universal CSS framework guarantee
- Adapted is an explicit framework-aware policy, not automatic detection
- Adapted policy uses generated static Goober styles in a private tag; arbitrary dynamic runtime CSS is not covered
- Traceability uses prototype data attributes and source metadata; Goober does not generate the report or source labels itself
