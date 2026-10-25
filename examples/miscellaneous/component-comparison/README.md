# Component comparison

A standalone, local comparison of the existing `openuiChatLibrary` and the
migrated chat library. One prompt produces **one server-side AI call**. The
parent forwards the same ordered response to two isolated iframe documents.
Each pane owns its form drafts; a submitted action continues the shared
conversation once. Refresh clears the session. No database or local storage.

## Set up

Use Node22+ and the repository's pinned pnpm version. Build packages in this
checkout first (generated dist only; do not edit product source or root lock):

```sh
# repository root
pnpm install --frozen-lockfile
pnpm run build:packages
cd examples/miscellaneous/component-comparison
node scripts/setup-artifacts.mjs
npm install .artifacts/*.tgz
npm run generate
cp .env.example .env.local
npm run dev
```

Open **http://127.0.0.1:4188**. Default mock mode is deterministic and makes no
AI requests. `setup-artifacts` uses ordinary pnpm pack on already-built packages;
no source aliases, linked workspace runtimes or custom styling adapters are used.
The example's own lock records its dependencies and local archive integrity.
Explicitly installing the newly packed tarballs refreshes those integrity entries
when rebuilding artifacts. It does not modify the repository root lockfile.

For an existing directory containing exactly one tarball per required package,
use `node scripts/setup-artifacts.mjs --from=/absolute/path/to/archives` instead.
Required packages: lang-core, observability, devtools, react-lang, react-ui,
react-ui-core and kits. Newly extracted packages are unpublished; a plain registry
install cannot supply them. Do not substitute source aliases. Source exports are
`@openuidev/kits/react/chat/libs`, root core and root legacy UI.

`npm run generate` uses the stock OpenUI CLI twice and rejects mismatching chat
registries/schemas. The server passes the matching library and promptOptions
separately to `generateSystemPrompt`, following the Vercel AI SDK example.

## Live mode (configuration required)

The exact **development API base path and model remain unverified**. Ask your
team for them; do not derive a path from the production URL. In ignored
`.env.local`, set:

```dotenv
COMPARISON_MODE=live
THESYS_API_KEY=your-temporary-key
THESYS_BASE_URL=https://dev.thesys.dev/CONFIRM_THE_API_BASE_PATH
THESYS_MODEL=CONFIRM_THE_ENABLED_MODEL
```

The URL above is a placeholder, not an endpoint recommendation. Base URL and
model have no defaults. Missing/incomplete settings show a setup-needed message.
Only the server reads these variables; never use a VITE_ credential variable.
Restart the server after changing configuration. No paid/live vendor request
was made during development; tests use a local OpenAI-compatible mock upstream.

## Use

- Send a prompt once; both panes receive its full incremental response.
- Stop aborts the server's upstream request and fences late chunks. Clear also
  invalidates prior frame actions and clears conversation memory.
- Replay re-presents retained original chunks without a request. Interrupted
  replay does not destroy the original response; replay actions are ignored.
- Draft form values stay independent. A submitted action forwards the actual
  Renderer event (params, form name and values included) into one next turn.
- Shared theme applies through each library's existing ThemeProvider.
- Inspect response shows retained assistant source. Errors stay visible in the
  affected pane or shared transport notice; one failed pane does not break the
  other. Pane packets require the expected window source and exact origin.

The iframes isolate styles and JavaScript runtime state; they are not claimed
as a sandbox for arbitrary untrusted executable HTML. Only the chat libraries'
normal Renderer surface is used. AgentInterface, OpenUIChat, external tools and
the general assembled openuiLibrary are not extracted or added here.

## Checks

```sh
npm test
npm run build
# Standard installed Chrome, or point to an isolated Chrome for Testing binary:
COMPARISON_CHROME=/absolute/path/to/chrome npm run test:browser
```

The browser test starts an actual local OpenAI-compatible HTTP upstream and
uses the actual Vercel AI SDK, parser and both packed UI libraries. It covers
one-call fanout, cancellation, replay, form isolation/actions, next-prompt draft
retention, themes, iframe source validation and independent rendering errors.
No model key is needed. Build artifacts/test screenshots stay ignored.

This visual playground is not a new parity or performance certificate. Existing
beta evidence and inherited library limitations remain unchanged. The root chat
library includes its full component registry, so the browser bundles are large.
