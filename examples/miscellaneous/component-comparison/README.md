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

For a new setup, obtain the exact development API base path and enabled model
from your team; do not derive a path from the production URL. Existing ignored
local configuration is preserved. In `.env.local`, set:

```dotenv
COMPARISON_MODE=live
THESYS_API_KEY=your-temporary-key
THESYS_BASE_URL=https://dev.thesys.dev/CONFIRM_THE_API_BASE_PATH
THESYS_MODEL=CONFIRM_THE_ENABLED_MODEL
```

The URL above is a placeholder, not an endpoint recommendation. Base URL and
model have no defaults. Missing/incomplete settings show a setup-needed message.
Only the server reads these variables; never use a VITE_ credential variable.
Restart the server after changing configuration. Automated tests use a local OpenAI-compatible mock upstream; offline validation
makes no vendor requests.

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

## Offline component atlas

Open `http://127.0.0.1:4188/?mode=offline`, or choose **Offline demo** in the Mode
selector. No credentials are needed. Render all instantly and Stream demo use
identical curated OpenUI source. Stop retains the partial response; Replay starts
again from the immutable saved source. Switching modes clears both conversations
and activity logs and stops active work. Live AI keeps the existing server path.

The shared response includes all **80 entries reachable from Card**. The labeled
direct section exercises **Label, Slice, SwitchGroup and SwitchItem** through the
unchanged registry and public Renderer. Slice and standalone SwitchItem return
null by design; their sections explain this rather than inventing visible output.
SwitchItem also supplies real controls through the direct SwitchGroup example.
Helper entries such as Series, Col and card items count through their valid parent
composition, not because their names appear in prose. Some examples require
opening the Details tab / accordion, scrolling the carousel or opening a control.
`offline-inventory.json` maps every entry to its actual parsed path, parent,
example and delivery mode. Regenerate it with `npm run generate:offline-inventory`
after changing the fixture. The inventory test validates both generated schemas,
reachability, no missing/orphaned entries and every curated example.

Offline form submissions and follow-ups log the original event and originating
pane below the controls. They never call generation. Draft inputs stay independent.
All demo media use the included local SVG; local fonts/static assets are allowed.
HorizontalBarChart retains its inherited default-height / legend-fit limitations.
The demo does not change production schemas, styles or component APIs.

```sh
COMPARISON_CHROME=/absolute/path/to/chrome npm run test:offline-browser
```

This browser pass blocks/counts offline `/api/*` requests and external requests,
checks both real panes and local media, instant/stream identity, Stop/Replay,
form values and pane logging, independent drafts, themes, tabs, accordion and
switches. Its mode-switch cancellation check uses only the server's local mock.
This is bounded functional coverage, not exhaustive variants, visual parity,
performance or accessibility certification.

## Component parity bench

Open `/bench.html` for searchable deterministic cases, separate manual renderer
panes, per-layer results, coverage and local history. Manual exploration is not
credited as an automated pass. Choose **Quick** (plain CSS) or **Full** (plain CSS,
Tailwind 3 and Tailwind 4, with each framework before and after component styles),
then run selected cases or the complete inventory.

The current inventory has 218 cases covering 84 registry entries and 775 explicit
state/variant checks. The Default full matrix requests 12,450 cells: each supported
case at 390/768/1280px, light/dark and instant/local-stream delivery. Data helpers
are exercised through valid parents; the original direct examples remain
non-streamed. No test calls the generation API or a vendor service.

```sh
npm run bench:cases                 # regenerate cases from the public libraries
npm run build                       # schemas, genuine host fixtures, types, assets
npm run bench -- --mode=full --concurrency=8
npm run bench -- --case=button-keyboard-action --width=390 --theme=light
npm run bench -- --preset=cyberpunk --case=form-default
npm run bench -- --from-run=YOUR_RUN_ID --case=YOUR_CASE_ID
```

Use Chrome for Testing **156.0.8078.47**. The runner records and verifies the exact
binary version and SHA-256. Set `COMPARISON_CHROME` or pass `--chrome=/absolute/path`
when that binary is installed elsewhere. It never silently switches browsers.
Each CLI run starts its own local mock server and freezes built assets in its run
folder, so rebuilding the manual preview cannot change an active test. Historical
reproduction verifies the frozen bundle hashes and keeps its original case,
package, registry and theme identities. Reusing an existing run ID is rejected.

Default, Cyberpunk and Crimson Desert are one shared, versioned JSON definition
used by both pane providers. Switching presets preserves source, playback and
independent drafts. Saved cases and runs record the preset definition hash;
changing the preview does not give an unexecuted preset coverage credit. Theme
consumer/portal checks are separate from the Default full-suite result.

A run distinguishes **Pass**, **Fail**, **Known issue**, **Review**, **Not covered**
and **Not applicable**. Layout/styles compare exactly. Screenshot tolerance is
zero: differing pixels require review. Both iframe screenshots use the same screen
origin to avoid position-dependent Chromium raster differences. Real media decode,
font readiness and stable SVG markup are awaited; intentionally held-loading
fixtures retain their pending state. Keyboard tests use normal 50ms held keys so
Radix's deferred focus occurs before keyup. These are test-harness controls, not
component fixes. They do not change production styles or event handlers.

An inherited bug is Known issue only when its exact recorded assertion signature
matches. An extra failure, changed signature or new layout/style difference stays
Fail. Known issues never produce an unqualified green result. This bench does not
certify performance, SSR or comprehensive accessibility.

History lives in ignored `.bench-runs/`; explicit saved cases in `.bench-cases/`;
child process logs in `.bench-logs/`. The UI can export JSON or an offline HTML +
evidence tarball. Keep the HTML beside its relative evidence paths after unpacking.
Runs contain source, assertions, raw compressed measurements, screenshots/diffs,
artifact/browser/CSS identities and a file-hash manifest. Operational progress and
cancellation files are excluded from new manifests. Missing artifacts are reported
as missing, never accepted as passes. Save a live response only through its explicit
selection control: it starts Not covered until independent assertions are supplied.
No environment files or credentials are included in exports.
