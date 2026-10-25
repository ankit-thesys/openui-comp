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
