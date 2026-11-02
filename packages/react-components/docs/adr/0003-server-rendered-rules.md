# ADR 0003: Server-rendered component rules

- **Status:** Accepted (2026-11-02). Implemented on `claude/react-components-ssr-rules` (fork PR #189); spec [server-rendered-rules](../specs/server-rendered-rules.md) (#178), tickets #179–#188.
- **Scope:** how `@openuidev/react-components` component rules, token defaults and ThemeProvider themes reach server-rendered HTML, and how the browser sheet works alongside them.

## Context

#1523 writes the component sheet only in the browser. Server-rendered pages are unstyled until scripts run. In layered mode, four of the compat apps (Next App Router, Next Pages, React Router, TanStack Start) break even after hydration: either Tailwind's base layer beats the components, or the head insertion triggers React #418. The earlier answer, the whole sheet from the server (#1526, closed), sent 211 KB and 713 classes on every page, which throws away the tree-shaking the component library keeps in the browser.

Goal: the server sends the rules of the classes a page rendered, and only those, in every React 19 framework, with no app setup.

## Decisions

### Mechanism

| #   | Decision                                                                                                                                                                                                                                                                                                                                                    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Server rules use React 19 hoisted styles: `<style href={class} precedence="openui">`. React dedupes by `href`, merges a flush's tags into one, streams a Suspense boundary's rules with that boundary, and skips these tags when hydrating. Rejected: scanning finished HTML for class names, because Next App Router exposes no hook into its HTML stream. |
| D2  | `css` and `keyframes` record each generated class's own rule text in the shared, `Symbol.for`-keyed style store. Records are added to a store an older copy of the package created.                                                                                                                                                                         |
| D3  | `styleRules(...classNames)` is a public plain function, not a hook. On the server it returns the token-defaults tag, then one tag per known generated class, with the keyframes those rules animate with. In browsers it returns `null`.                                                                                                                    |

### Granularity and wiring

| #   | Decision                                                                                                                                                                                                                                                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D4  | Exact classes: each element passes its final class string. On the compat page this sends 24 classes (10.4 KB), where whole modules would send 63 (22.9 KB).                                                                                                                                                                                               |
| D5  | Inside `<svg>`, React renders `<style>` in place rather than hoisting it, which breaks hydration. So a chart's HTML root sends the whole style modules its SVG parts use (`moduleClasses`). The contract test allows "served but not rendered" only for those modules' classes.                                                                           |
| D6  | `styleRules` renders after its element, never before: before it, React adds a `<!-- -->` text separator when text precedes the element, which changes the markup.                                                                                                                                                                                         |
| D7  | A rerunnable, idempotent codemod (`fork/react-components-dev/scripts/wire-style-rules.mjs`) wires every element whose class comes from a style module. It skips portal content, client-only components (IconWrapper, Select's portalled parts) and SVG content; single-child parents (Radix `asChild`, `Slot`, TooltipWrapper) get the call outside them. |

### Placement, layers and the browser sheet

| #   | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D8  | Before hydration, the browser moves server tags of the component-rule and token-defaults precedences to the start of `<head>`, in their order. React places them after app stylesheets it has already seen (Next's CSS), and inside the container when it renders one rather than the whole document.                                                                                                                                                     |
| D9  | `configureStyles({ order })` declares the app's whole layer order, written first in the server's token-defaults tag and in the browser sheet's first write. Component rules come first in `<head>`, so the app's own order statement would come too late.                                                                                                                                                                                                 |
| D10 | A browser that never calls `configureStyles` adopts the layer and order from the server's tags, so server-rendered apps configure once, on the server, and a late browser call cannot leave rules unlayered.                                                                                                                                                                                                                                              |
| D11 | The browser sheet carries `data-precedence="openui"`, so React's head hydration skips it (this fixes React #418), and it skips classes the server sent, re-reading them on every write. It writes immediately. On a page still streaming, it drops the classes later Suspense boundaries served once the document completes. Rejected: holding the first write until `DOMContentLoaded`, which leaves browser-only renders unstyled for the whole stream. |
| D12 | Unlayered apps accept a short window before scripts run in which an equal-weight app stylesheet that the framework places first loses to component rules. Layered mode is the documented recommendation for server-rendered apps.                                                                                                                                                                                                                         |

### Theme and CSP

| #   | Decision                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D13 | ThemeProvider renders its variables and portal selector as a hoisted tag (`openui-theme` precedence) whose `href` hashes the rule, so equal themes are written once. Its insertion effect owns the browser tag and removes the server copy.                                                                                                                                                  |
| D14 | React keeps a hoisted tag's rules only when the tag's nonce matches the render's `nonce.style`. `configureStyles({ nonce })` takes a getter for the current request's nonce, which the app reads from request-scoped storage such as AsyncLocalStorage. Rejected: a static nonce setting, which two concurrent streaming requests overwrite, and a provider, which breaks the hook-free API. |

## Consequences

- Every server-rendered compat app is styled before scripts run, and none repeats a rule after hydration (rendered-rules specs, smoke checks, and the browser no-repeated-rules check on a streamed page).
- Each import still bundles only its own component; tree-shaking adds about 0.5 KB gzip per import for the records and `styleRules`.
- A component that renders an element with a style-module class and no `styleRules` call fails the codemod's check and the server-rules contract test. Modal is the one contract entry with no server markup; it fails its check if it ever renders generated classes on the server.
- `configureStyles` replaces every option on each call, so layer, order and nonce are passed together.
