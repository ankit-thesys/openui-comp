# Runtime component-ownership investigation — decision open

This round responds to the user's requirement to reduce unused CSS, SSR cost and memory using established practices. It does not accept runtime Goober, a maintained fork, a static alternative or a migration. The previous candidate at c2ba24f3 remains unchanged evidence.

## Candid audit of the previous experiment

| Mechanism | Classification | Action in this round |
| --- | --- | --- |
| React19 `<style href precedence>` resources | Documented framework API | Keep native delivery/deduplication; no new style registry |
| CSS custom properties with scoped inline theme values | Standard browser/React mechanism | Keep theme/request values out of compiled style identity |
| Per-component immutable style definitions | Ordinary component ownership | Attach to actual copied component render paths; no aggregate kit boundary |
| Lazy module-local compiled value | Ordinary memoization of immutable input | One record per fixed style definition; no theme/request-keyed cache, DOM nodes or React elements retained |
| Private Goober selector-parser patch | Custom fork of the engine | Inherited limitation of the comparison candidate; no additional parser changes or acceptance |
| Generated per-property `revert-layer` guards | Standard CSS primitive used by a custom compatibility system | Inherited limitation; no additional guard technology or claim it is standard Goober |
| Fake browser DOM target used to capture Goober CSS | Undocumented Goober implementation dependency | Evaluate a real detached DOM target and public extraction; do not add a new capture hack |
| Request-private server `{data: ''}` target | Relies on Goober implementation shape rather than its public Element type | Explicitly retain as an unresolved integration dependency if no supported replacement is demonstrated |
| Regex scanning OpenUI response text for needed styles | Prototype heuristic, not component execution | Remove; normal component rendering determines style use |
| All47-family chat boundary | Prototype shortcut, eager style delivery | Remove; source-owned components and conditional portal rendering determine use |
| Compiling shell aggregate plus imported shell styles separately | Duplicate source ownership | Split direct root styles from separately owned imported families |
| Automatic React19/Goober streaming bridge | Custom library integration built on public React resources | Do not describe the overall system as turnkey/stock Goober |

The previous passing compatibility checks established bounded behavior of that custom candidate. They did not establish that its architecture was standard or low-maintenance. That distinction should have been made more prominent.

## Primary-source support

Goober documents target binding and CSS extraction, including extraction after SSR. Its browser target is an actual DOM container; extraction clears the sheet rather than establishing a cache-eviction contract. [Goober documentation](https://github.com/cristianbote/goober#targets), [Goober extraction](https://goober.js.org/api/extractCss/).

React documents stylesheet resource identity, deduplication and precedence. It also notes that resource props do not update and style resources may remain after component unmount; this is why this prototype does not invent an unmount-based style reclamation manager. [React style reference](https://react.dev/reference/react-dom/components/style).

Next documents runtime CSS-in-JS collection/insertion for server rendering. Goober is not a documented turnkey integration in that guide. Meeting install-and-import streaming SSR with no app setup remains a library-integration responsibility, not a feature established by choosing Goober. [Next CSS-in-JS guide](https://nextjs.org/docs/app/guides/css-in-js).

## Reproduced symptoms and ranked predictions

`node repro.mjs` goes red with the actual existing RuntimeChatBoundary and one actual Button: 47 style families, roughly1.50MB HTML, unwanted charts and chat shell resources. The repeated run preserves this failure in `repro-original.json`.

1. If eager family ownership causes unnecessary styles, actual component-level ownership will remove chart/shell resources from a Button-only render and prevent closed-only components from causing their style definitions to compile.
2. If repeated immutable serialization causes CPU overhead, one lazy compiled record will reduce work while preserving exact HTML/style output. `node cache-control.mjs` already confirms identical HTML and47compile events total rather than per render; this is a microdiagnostic, not a capacity benchmark.
3. If broad/duplicated stylesheet payload contributes to native memory, reducing emitted rules/bytes should reduce footprint in fresh-process paired observations. It may not account for all RSS behavior.
4. If process/allocator behavior dominates the earlier RSS difference, repeated fresh-process pairs with reversed order may vary substantially even with fixed content and CSS. Report those repetitions rather than labeling a single RSS difference a leak.

## Scope guardrails

No new CSS parser, global stylesheet manager, request emission registry, runtime response scanner, framework detector, host stylesheet mutation, blanket !important or dynamic cache keys. No production source edits. Source copies and ordinary polymorphic component composition may attach resources to existing actual DOM/portal roots without extra DOM nodes; these changes must preserve ref/props/children behavior and be reviewed/tested.

Do not hide missing styles with a workload-specific allowlist. Record a static ownership inventory for all selected sources. Closed portal branches must be tested directly. The existing engine fork and guard system remain visible unresolved costs; optimizing them is not acceptance or proof that all requested constraints can be met by stock Goober.

Baseline must remain actual original components/styles, not silently run through the new no-op ownership wrappers. Preserve identical input programs and schedules between measured arms. New standalone fixture uses UTF-8 explicitly; the prior fixture encoding diagnostic and original measurements stay preserved.

## Parent review notes before measurement

The first source-ownership mapping used class-name prefixes for chart roots. A new actual non-condensed Bar fixture revealed that `container-inner` was mistakenly treated as a root variant; explicit exact chart roots preserve its genuine descendant layout. The failed fixture and corrected regression remain evidence. This is an author-time ownership error, not a newly demonstrated Goober engine bug.

A separate DOM inspection found resource elements inside SVG (RadioItem paths and chart nodes). React HTML stylesheet hoisting cannot be assumed for SVG-namespace style nodes. The candidate must place resources at an HTML/component boundary, preserving SVG classes without emitting a resource for each path. A custom runtime deduplication manager is explicitly ruled out. The corrected bounded source composition passes the same twelve catalog configurations and a zero-in-app-resource gate; no custom runtime deduplication manager was added. The code generator records explicit class-only SVG attachments, including AnimatedPath. This is not a general arbitrary-component ownership solver. No final performance run had started at this checkpoint.
