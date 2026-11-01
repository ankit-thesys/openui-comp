# Spec: server-rendered component rules

Published as [#178](https://github.com/ankit-thesys/openui-comp/issues/178).

## Problem Statement

A server-rendered app that uses `@openuidev/react-components` sends HTML with no component rules. #1523 writes the component sheet only in the browser, so:

- Pages are unstyled until scripts run.
- In layered mode, four of the server-rendered compat apps break even after hydration:
  - In Next App Router and Next Pages, the browser sheet lands before the app's layer-order statement, so Tailwind's base styles beat the components.
  - In React Router and TanStack Start, the sheet's head insertion causes a React #418 hydration error.
- Content streamed in a Suspense boundary arrives without its rules.
- A server-rendered app must call `configureStyles` in browser code, which nothing documents.

The earlier answer (#1526, now closed) sent the whole component sheet from the server: 211 KB and 713 classes on every page, however few components the page rendered. That throws away the tree-shaking the component library keeps in the browser.

## Solution

The server sends the rules of the classes the page rendered, and only those. Each rendered element hands its final class string to `styleRules`, a plain function rather than a hook. On the server, `styleRules` renders React 19 hoisted style tags.

React then does the rest:

- It writes each class once per page.
- It merges each flush's rules into one tag.
- It streams a Suspense boundary's rules with that boundary.

This works with no setup in every React 19 framework: Next App Router, Next Pages, React Router, TanStack Start and plain Vite SSR.

In browsers, `styleRules` renders nothing:

- Before hydration, the server's tags move to the start of `<head>`, ahead of app CSS.
- The browser sheet still writes every rule the client bundle imports, but skips classes the server already sent, so no rule appears twice.
- When the app has not configured the browser, it adopts the layer and layer order from the server's tags.

`configureStyles` gains an `order` option: the app's whole layer order, declared before any component layer. ThemeProvider renders its theme variables the same way, so a dark or custom theme is right before scripts run.

On the compat page, the server sends 10.4 KB of component rules (24 classes) instead of 211 KB (713 classes).

## User Stories

1. As an app developer using a server-rendered framework, I want the server HTML to carry the rules for the components it rendered, so that the page is styled before any script runs.
2. As an app developer, I want the server to send only the rules of classes the page rendered, so that HTML weight tracks what the page uses, not the whole component library.
3. As an app developer, I want a variant my page did not render (another Button variant or size) left out of the HTML, so that unused variants cost nothing.
4. As an app developer, I want each component rule to appear once per page however many times a component renders, so that repeated components add no CSS.
5. As an app developer, I want a page's server rules merged into one tag per flush, so that the head is not flooded with one tag per class.
6. As an app developer using Suspense streaming, I want a late boundary's rules to arrive with that boundary, so that streamed content is styled when React reveals it.
7. As an app developer using Next App Router, I want server rules to work with no registry, `useServerInsertedHTML` or stream hook, so that setup is nothing.
8. As an app developer using Next Pages, React Router, TanStack Start or plain Vite SSR, I want the same zero-setup behaviour, so that every React 19 framework works alike.
9. As an app developer whose app renders into a container rather than the whole document, I want the server's rules moved into `<head>` before hydration, so that they sit ahead of my CSS, not inside my root element.
10. As an app developer, I want hydration to succeed with no mismatch or React #418 error when server rules are present, so that the component library never breaks hydration.
11. As an app developer, I want the browser sheet never to repeat a rule the server already sent, so that the page carries each rule once.
12. As an app developer, I want components that first render in the browser (client navigation, lazy parts, portals) styled by the browser sheet, so that nothing depends on the server having rendered it.
13. As an app developer using cascade layers, I want `configureStyles({ layer, order })` to declare my whole layer order before any component layer, so that `openui` lands where I put it, not lowest.
14. As an app developer using cascade layers with Tailwind, I want Tailwind's base layer not to beat component rules in any framework or streaming case, so that layered mode works everywhere.
15. As an app developer, I want the browser to adopt the layer and order from the server's tags when I have not configured the browser, so that I configure once, on the server, and a late browser `configureStyles` cannot leave rules unlayered.
16. As an app developer without layers, I want my equal-weight override stylesheet to beat component rules once the page has hydrated, so that unlayered overrides keep working.
17. As an app developer without layers, I want the docs to say that equal-weight overrides lose until scripts move the server rules, and to recommend layered mode for server-rendered apps, so that I know the trade-off.
18. As an app developer with a strict Content Security Policy, I want React to put my style nonce on the tags it hoists when I pass `nonce: { style }` to its server render, so that the browser allows the server rules.
19. As an app developer with a strict Content Security Policy, I want the browser sheet to keep using the page nonce, so that client-written rules are allowed too.
20. As an app developer using ThemeProvider, I want its theme variables rendered as a hoisted tag on the server, so that a dark or custom theme is correct before hydration.
21. As an app developer, I want the token defaults sent once with the server rules, so that variables resolve before scripts run.
22. As an app developer who styles my own components with the component library's `css`, I want to call `styleRules` with my class strings, so that my rules travel from the server the same way.
23. As an app developer, I want `styleRules` to be a plain function, not a hook, so that it keeps the hook-free contract and works anywhere a component renders.
24. As an app developer, I want a component's keyframes sent with the rules that animate with them, so that server-rendered animations work.
25. As an app developer, I want my bundle to keep tree-shaking by import, so that importing one component still pulls in only that component.
26. As an app developer with two copies of the package on a page (an ESM and a CJS build, or two versions), I want server and browser rules still written once, so that the shared style store keeps working with server rules.
27. As a component library maintainer, I want every element that takes a class from a style module to pass its final class string to `styleRules`, so that what the server sends is exact by construction.
28. As a component library maintainer, I want the wiring of all 432 elements done by a reviewed codemod in batches by component area, so that it is mechanical and consistent.
29. As a component library maintainer, I want a test that fails when a rendered class has no served rule, so that a missed wiring cannot ship.
30. As a component library maintainer, I want a test that fails when the server sends a class the page did not render, so that exactness cannot erode into whole modules.
31. As a component library maintainer, I want a test that fails when a class is served twice, so that the dedupe guarantee holds.
32. As a component library maintainer, I want every server-rendered compat app tested in both modes, so that framework regressions show up before release.
33. As a component library maintainer, I want server-rendered pages checked for repeated rules after hydration and lazy parts, so that server tags and the browser sheet never overlap.
34. As a component library maintainer, I want the stable classes and generated names unchanged, so that existing overrides and snapshots keep meaning the same thing.

## Implementation Decisions

- **Mechanism.** Component rules on the server use React 19 hoisted style elements: an `href` per class and one shared precedence for component rules. React owns deduping, merging per flush, streaming with Suspense boundaries and keeping these tags out of hydration. The approach of scanning the finished HTML for class names was rejected: Next App Router exposes no hook into its HTML stream.
- **Rule records.** `css` and `keyframes` record the rule text each class registers, which keyframes are keyframes, and the order classes registered in. These records live in the shared style store (the `Symbol.for` store from #1523), so every copy of the package sees them.
- **`styleRules(...sources)`** is public and hook-free.
  - Its sources are class strings, typically the same string an element passes to `className`. It takes only the generated classes it knows and ignores stable classes and app classes.
  - On the server, it returns the token-defaults tag, then one hoisted tag per known class, then the keyframes those rules animate with.
  - In browsers, it returns nothing.
- **Granularity is exact classes**, not whole style modules. Each element passes its own final class string.
- **Wiring.**
  - A codemod adds a `styleRules` call beside every element whose class comes from a style module: 432 elements in 105 files.
  - Where an element is a component's root, the codemod wraps it in a fragment.
  - Batches go by component area, and each batch is reviewed.
- **Browser behaviour.**
  - At module load, before hydration, every server tag of the component-rule and token-defaults precedences moves to the start of `<head>`, keeping its relative order.
  - The browser sheet reads the classes the server sent from those tags and skips them. Its own tag sits after the server tags and carries the same precedence marker, so React's head hydration skips it. That fixes React #418.
- **Layer order.**
  - `configureStyles` gains `order`: the app's whole layer order.
  - When it is set, the server's token-defaults tag and the browser sheet's first write both begin with that order statement.
  - When the browser is not configured and server tags exist, the browser adopts the layer and order from them.
- **ThemeProvider** renders its variables as a hoisted tag. The `href` is derived from the variables and selector, so equal themes dedupe. This replaces its insertion effect on the server path.
- **Token defaults** are rendered by `styleRules` once per page as their own precedence, ahead of component rules.
- **CSP.** The component library adds nothing for the server. Apps pass React's `nonce: { style }` to their server render. The browser sheet keeps reading the page nonce as today.
- **Unlayered apps without JavaScript.** The interval before the move is accepted. The docs recommend layered mode for server-rendered apps.

The core of the decision, as the prototype (#177) shaped it:

```ts
// css/keyframes: remember each class's own rule text
const name = gooberCss(...args);
if (!(name in store.fragments)) store.fragments[name] = store.rules.slice(before);

// styleRules: server only
return inBrowser() ? null : [defaultsTag(), ...classes.map((name) =>
  <style key={name} href={name} precedence="openui">{wrap(store.fragments[name])}</style>)];
```

## Testing Decisions

- **What a good test does.** It checks what an app sees: the server HTML, the computed styles in a real browser, hydration errors, and the rules in the document. It doesn't check store internals or how calls are made.
- **Seam 1: the built package, server-rendered in Node.** Each component fixture goes through React's server renderer, and one contract test asserts three things:
  - every generated class in the markup has its rule in the hoisted component-rule tags;
  - no served class went unrendered, keyframes excepted;
  - no class is served twice.

  This seam carries the exact-class guarantee for every wired element. Prior art: the fork's "built package in Node" smoke test and the unit contract tests.
- **Seam 2: the compat apps.** These are real frameworks in production and dev builds, run in both modes.
  - The shared smoke check (default theme, console and hydration errors, repeated rules, equal-weight override, layer) counts the server's component-rule tags together with the browser sheet. It treats layer-order statements as holding no rules.
  - The `rendered-rules` spec runs in every server-rendered app. It checks that every rendered class was served and reports how many unused classes were sent. Where content is not streamed behind Suspense, it also checks the page is styled with scripts turned off.
  - The CSP app renders with React's style nonce.

  Prior art: the compat harness and its `client-sheet` and `rendered-rules` specs.
- **Seam 3: the browser no-repeated-rules spec.** It extends to a server-rendered fixture page and checks that server tags and the browser sheet never repeat a rule after interaction and lazy parts. Prior art: the existing no-repeated-rules spec and the skipped SSR, document and streaming specs.
- **Existing unit tests** that server-render components are updated for the hoisted tags now leading their markup. The snapshot aliaser learns that class names also appear in `data-href`.

## Out of Scope

- **Upstream.** Nothing goes to thesysdev/openui, and nothing is pushed to the branch behind #1523. This is fork-only work stacked on #159.
- **React Server Components** rendering component library components directly. The components are client components; their server rules come from the SSR pass.
- **Changing the browser sheet's eager writes** of every imported rule.
- **Removing the stable classes**, or changing generated names.
- **Making unlayered apps correct without JavaScript in Next**, beyond documenting it.
- **The webpack-dev race on its own.** It's covered by adopting the layer from the server tags.

## Further Notes

- **Follows:** #127 (hook-free css and an app-wide cascade layer, ADR 0002, #126) and the shared-store fix in #1523.
- **Replaces:** the whole-sheet approach of #1526, now closed.
- **Prototype:** fork draft PR #177. With Button, Card, Input, Select, Tabs and MiniLineChart wired, all 15 compat apps pass in both modes, 30 of 30.
- **Measured on the compat page:**

  | What the server sends | Classes | Size |
  |---|---|---|
  | Full sheet | 713 | 211 KB |
  | Whole modules | 63 | 22.9 KB |
  | Exact classes | 24 | 10.4 KB |

- **ADR.** The decisions here also warrant a package ADR (0003, "Server-rendered component rules").
