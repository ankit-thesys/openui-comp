# Local verification

- Both chat registries generated with the stock OpenUI CLI and matched root,
  components, schema, functions and actions without normalization.
- `npm test`: 13/13 passing, including actual HTTP abort, real AI SDK against a
  localhost upstream, zero upstream calls when setup is incomplete, one attempt
  on upstream failure, replay interruption, malformed stream abortion, duplicate
  actions, exact submitted event retention, Clear fencing and visible errors.
- `npm run build`: passes schema generation, source TypeScript and Vite production
  build. Standard skipLibCheck is enabled; this does not certify inherited legacy
  dependency declarations. Vite notes the expected large chat-library bundles.
- Production browser flow passed on Chrome for Testing156.0.8078.47 via stock
  Playwright. Actual AI SDK/HTTP/parser/packed libraries; no vendor service used.
  It verified one call per prompt, shared source, independent drafts, form action
  values, no-call replay, active upstream cancellation, next-prompt preservation,
  theme delivery, stylesheet isolation, forged-source rejection, pane-local
  renderer notices/recovery and no390px horizontal overflow. Zero page errors.
- Runnable mock server: http://127.0.0.1:4188 (restarted after the UTF-8 decoding fix).
  `/api/config` reports mock/configured and exposes no credentials.

Raw current results and packed artifact/schema hashes are in evidence/. The
ignored screenshots/build output are available under .test-results/ and dist/.
The local archives were copied from the previously verified beta artifacts;
README documents conventional source build/pack/install for reproduction.
Production packages, root lockfile, old checkout, previews and frozen beta
fixtures were not edited. No push, PR, publication or paid request was performed.

The exact dev.thesys.dev API base path, enabled model and temporary key remain
pending. A fake localhost API base/model and nonsecret test credential were used
to exercise the real SDK. They are not proposed deployment configuration.

Independent source-review regressions now cover both archive filenames together
and stopping replay before any chunk appears without omitting the prior
assistant turn from the next model request. The red regression run is retained
separately. Original response chunks remain independent of playback content;
full Renderer action events reach the next request without lossy flattening.

Browser window explicitly released after the passing flow. The mock server
remains live on4188; verification can use it without credentials or paid calls.

Independent bounded runtime verification passed against c7d5be0ed, including
real-pane actions, cancellation, replay, stylesheet isolation and server-only
synthetic credential handling. Original report and raw results are retained at
/private/tmp/openui-component-comparison-independent/runtime/. No vendor was
contacted. This does not claim an expanded performance or visual parity matrix.

The subsequent request-decoding fix uses standard Buffer accumulation and a
single UTF-8 decode, preserving the existing raw-byte request limit. A real HTTP
regression deliberately splits an emoji between request chunks: it reproduced
corruption before the fix and passes afterward. Unicode red/green evidence is
retained alongside the full 13-test run. No production package was changed.

## Offline atlas validation (2026-10-26)

- `npm test`: 16/16 pass, including actual parser verification of all 84 shared
  registry entries in both schemas: 80 through Card, four direct. No fixture
  validation errors, unresolved references, or orphaned statements.
- Unit behavior covers instant content, interrupted playback, immutable replay,
  exact local action event/pane retention and stale-action rejection after Clear.
- Production build passes; inherited dependency declaration and large-bundle
  caveats above still apply. No production package or schema was modified.
- Chrome for Testing156.0.8078.47 bounded offline browser pass: both packed
  libraries render the same source; form drafts are independent, submitted values
  and originating pane appear in the log; tabs/accordion/switches, local media and
  both themes exercised. Stop retains partial content, Replay completes the saved
  fixture, and active local-mock live streaming cannot populate offline state
  after a mode switch. Zero offline API requests, zero external requests, zero
  page errors and zero completed-response renderer notices in either pane.
- Data-only Slice and standalone SwitchItem return null; this is explained in
  their labeled sections. SwitchItem controls are exercised through SwitchGroup.
  Nested helpers count via their actual valid parent composition. This does not
  imply every variant or hidden interaction has been exhaustively verified.
- Evidence: `evidence/offline/` contains test/build/browser logs, browser results
  and the coverage inventory. No real vendor request or credential was used by
  this work. Existing ignored live environment configuration was preserved.

Offline URL: http://127.0.0.1:4188/?mode=offline. The running server retains the
existing environment configuration; entering Offline demo requires no API setup.

The first browser chart-count assertion used an incorrect Recharts selector;
these components expose their own accessible SVG labels. The test selector was
corrected, with the failed control retained in offline evidence. No chart
implementation or production styling was changed to make that check pass.
