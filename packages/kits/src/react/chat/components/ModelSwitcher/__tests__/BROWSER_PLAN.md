# Chat component Chrome matrix (#16)

Status: harness prepared only. No Chrome matrix has run for this batch.
Worker1 retains the browser until explicit release and identification of the
immutable installed kits/core artifacts. This harness does not certify the
combined chat library, parser, transport, SSR or unaffected core components.

## Matrix and observations

36 cells: plain CSS, Tailwind v3 and Tailwind v4; host stylesheet before and after
component styles; no provider, light, dark, custom light, custom dark and nested
dark inside light. Every cell uses independent legacy and installed-package
pages, real Chrome, production React and identical fixtures/host CSS.

The baseline uses the unchanged legacy components and their owned SCSS plus
Select, Tag and default variables. The runtime imports only
`@openuidev/kits/react/chat` and `@openuidev/react-ui-core`. It must not pull
legacy source or the chat-library entry. No CSS import is supplied to runtime.
The consumer must be a normal installed artifact, not a workspace source link.

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
KIT_BROWSER_TOOLS=/absolute/package-containing-esbuild-and-playwright \
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
fixture hashes, bundle hashes/metafiles, baseline input hashes and framework
hashes. Both bundles and served CSS are archived. Installed kits/core manifests
and complete dist trees plus consumer manifest/lock are hashed before and after;
any mutation fails acceptance. Failure is retained and stops the run; inherited
differences require explicit triage, not broad ignored-property filters.

## Preparation checks

Runner JavaScript syntax, fixture TSX transformation and the independent legacy
Sass compilation pass. Baseline compilation produces 48,362 bytes from eight
SCSS inputs. These are preparation checks, not package or browser results.
