# Local verification

- Both chat registries generated with the stock OpenUI CLI and matched root,
  components, schema, functions and actions without normalization.
- `npm test`: 12/12 passing, including actual HTTP abort, real AI SDK against a
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
- Runnable mock server: http://127.0.0.1:4188 (owned process session78149).
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
