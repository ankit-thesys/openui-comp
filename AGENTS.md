# AGENTS.md

## Cursor Cloud specific instructions

OpenUI is a **pnpm workspace monorepo** (`packages/*`, `examples/**/*`, `docs/`). Always use
`pnpm` — never `npm`/`yarn` (see `.cursor/rules/use-pnpm.mdc`). CI uses Node 20 + pnpm 9.x
(`.github/workflows/build-js.yml`); Node 22 + pnpm 10 also work.

### Install builds everything
`pnpm install` also builds every workspace package: each package under `packages/*` has a
`prepare: pnpm run build` hook, so install populates each package's `dist/`. Examples and docs
consume packages via `workspace:*` from those `dist/` folders, so you do **not** need a separate
build step after a clean install. To rebuild after editing package source, run `pnpm -r build`
(or `pnpm --filter <name> build`). Package build order is handled by pnpm (`lang-core` →
`react-lang`/`react-headless` → `react-ui` → `browser-bundle`).

### Lint / test / build (standard commands)
- Tests: `pnpm test` (root) or `pnpm -r run test`. Only `lang-core`, `react-headless`,
  `vue-lang`, `svelte-lang` have tests; `react-lang`/`react-ui` pass with no test files.
- Lint + format check (matches CI): `pnpm -r run ci` (= `lint:check` + `format:check`). Packages
  use `lint:check`/`format:check`; example apps use `lint` (`eslint`). Lint currently reports
  `react-hooks/exhaustive-deps` **warnings** (0 errors) — that is expected and non-blocking.
- Build all: `pnpm -r build`.
- Per-package/app: `pnpm --filter <name> run <script>` (see `CONTRIBUTING.md`).

### Running an example app
The canonical end-to-end app is `examples/openui-chat` (Next.js). Run it with
`pnpm --filter openui-chat dev` — its `dev` script first runs `generate:prompt` (builds
`@openuidev/cli` and regenerates `src/generated/system-prompt.txt` from `src/library.ts`) then
`next dev` on port 3000. Edit `src/library.ts` and re-run `dev` (or `generate:prompt`) to change
the components the model may emit. Most other `examples/*` chat apps follow the same pattern.

### LLM key requirement (non-obvious)
Chat example `/api/chat` routes instantiate an OpenAI client and stream OpenUI Lang back to the
renderer, so they need `OPENAI_API_KEY` to actually generate UI. The client is
OpenAI-compatible: set `OPENAI_BASE_URL` (and `OPENAI_MODEL`) to point at any compatible
endpoint (or a local mock) instead of api.openai.com. Without a reachable LLM the app loads but
the chat response errors. `supabase-chat` additionally needs external Supabase + OpenRouter.

### Caveat: environment.json `start` is broken
`.cursor/environment.json` sets `start: pnpm dev:start`, but no `package.json` defines a
`dev:start` script, so the auto-start step fails. Start example apps manually with the
`pnpm --filter <app> dev` command above.
