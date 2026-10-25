# Chat component Chrome matrix (#16)

Status: completed on frozen product `8405f44e0`; strict style parity failed.
All 36 cases completed behavior checks; 42 of 330 paired style-state comparisons
failed on the color of a zero-width `none` trigger border. See
[BROWSER_REPORT.md](./BROWSER_REPORT.md). Browser and server are closed and
released to Worker1, then the verifier. This harness does not certify the
combined chat library, parser, transport, SSR or unaffected core components.

## Matrix and observations

36 cells: plain CSS, Tailwind v3 and Tailwind v4; host stylesheet before and after
component styles; no provider, light, dark, custom light, custom dark and nested
dark inside light. Every cell uses independent legacy and installed-package
pages, real Chrome, production React, Vite 6.4.2 and identical fixtures/host CSS.

The baseline uses the unchanged legacy components and their owned SCSS plus
Select, Tag and default variables. The runtime imports only
`@openuidev/kits/react/chat` and `@openuidev/react-ui-core`. It must not pull
legacy source or the chat-library entry. No CSS import is supplied to runtime.
The consumer must be a normal installed artifact, not a workspace source link.
Each isolated Vite fixture resolves its dependencies through a validated symlink
to that consumer's node_modules. No styling plugin, injector or custom loader
is added. Vite handles official vendor assets under the accepted KaTeX exception.

- Compare computed styles for trigger, name, logo, chevron, hidden badge,
  follow-up block/header/items/text/icon and unrelated host content.
- Compare normal, hover, focus, disabled and explicit override states, including
  a stylesheet-order assertion and independent expected token/dimension checks.
- Open the actual ModelSwitcher portal. Check group order, recommended-badge
  precedence, row/tag styling, custom theme inheritance and nested theme
  isolation outside the parent DOM scope.
- Use keyboard Enter/Home/ArrowDown/Enter, pointer option selection and Escape;
  assert selected values, callback sequence and returned focus.
- Click and keyboard-activate FollowUpItem; assert callbacks and native form
  submits. The default item has no type attribute and acts as a submit button;
  the explicit `type="button"` item does not submit. Disabled clicks suppress
  both callbacks and submission and keyboard navigation skips that item.
- Check class/style updates on follow-ups with actual Tailwind important
  utilities or plain explicit author CSS. ModelSwitcher retains its existing
  API: no className/style/disabled props. Its trigger override uses ordinary
  consumer CSS targeting the existing DOM class under a consumer wrapper.

Assertions compare both arms and independently check intended behavior. A
missing probe fails, apart from the intentionally absent logo after selecting
the model that has no logo. Native finite animations finish through the public
Web Animations API before computed-style sampling; no layout is mocked.
No test shim modifies component behavior, themes or Goober.

## Run after artifact and browser release

```sh
KIT_CONSUMER=/absolute/normal-installed-consumer \
KIT_BROWSER_TOOLS=/absolute/package-containing-vite-and-playwright \
KIT_SASS_TOOLS=/absolute/package-containing-sass \
KIT_HOST_CSS=/absolute/frozen-framework-css-directory \
KIT_BROWSER_RELEASE=1 \
node packages/kits/src/react/chat/components/ModelSwitcher/__tests__/browser.mjs
```

Host CSS directory must contain `plain.css`, `tailwind3.css`, `tailwind4.css`
with preflight and the explicit override utilities used by the fixture. The
existing compiled framework CSS in `/private/tmp/core-forms-host/frameworks`
is a candidate input; final evidence records its hashes. Framework palette
assertions intentionally match those frozen fixtures, not arbitrary configured
Tailwind colors. An ordinary consumer CSS rule targeting the model trigger is
appended to each served host sheet and archived with it.

`--prepare` builds both arms and SCSS and inventories the installed packages
without opening a server or browser; it does not require the release flag.
Neither mode installs dependencies or changes package contents.

Outputs stay inside this owned test directory (`results/browser` by default).
The report records every sampled state, behavior sequence, failure, runner and
fixture hashes, emitted asset hashes/rendered module lengths, baseline input
hashes and framework hashes. Vite builds and served CSS are retained locally;
raw reports are committed as lossless gzip archives with exact runner/fixture
copies. Installed kits/core manifests
and complete dist trees plus consumer manifest/lock are hashed before and after;
any mutation fails acceptance. Default mode stops at the first failure.
`KIT_DIAGNOSTIC_CONTINUE=1` records failed comparisons and continues collecting
cases; any failure still produces failed status and a nonzero exit. Differences
require explicit triage, not broad ignored-property filters.

## Preparation checks

Runner JavaScript syntax, fixture TSX transformation and the independent legacy
Sass compilation pass. Baseline compilation produces 48,362 bytes from eight
SCSS inputs. These are preparation checks, not package or browser results.
Formatting checks pass. Independent Spec and Standards reviews found no
actionable scoped harness findings in preparation. Runtime execution found two
test timing races; normal waits for Radix's public focused-option/focus-return
state corrected them. A later Standards review found a stale fixture dependency
symlink risk; current code validates its target, and all measured fixture links
were independently checked against the inventoried frozen consumer.
