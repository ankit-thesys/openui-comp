# Hook-free CSS consistency (#129)

`server.json`, `server-layer.json`, `browser-*.json` and `order-*.md` were recorded on
2026-10-30 from the pre-migration build: the hook-free integration branch at 48632080 plus this
check (#129), with no migration change in `packages/react-components`. They are fork-only
artifacts. The unit suite compares every server contract entry, including the focused chart
contracts, with the recorded markup and rules, unlayered (`css-snapshot.test.tsx`) and in the
`openui` cascade layer (`css-snapshot-layer.test.tsx`). SharedBase and SkeletonPulse are included
through their public consumers. Each failure names the component and shows the changed
declarations, rule order or markup element in Vitest's expected/received diff.

After building, the complete comparison and fresh order reports use one command:

```sh
pnpm --dir fork/react-components-dev css:check
```

This runs the server comparison, `client-only.contract.spec.ts` (including its existing
both-layer contract assertions), and the order reporter. It needs Chromium and the ordinary
browser fixture prerequisites described in the fork README. `css:check --server-only` runs the
server portion locally; the server comparison also runs in the ordinary unit suite.
Fresh reports are `order-*.current.md` (ignored); committed `order-*.md` are the starting point.
No baseline is rewritten by a comparison, including Vitest's `-u` option.

## Intentional changes

`intentional-changes.ts` is the explicit component-and-alias list of approved differences. The
comparison applies each exact change to expected data in memory; it never edits a baseline or
filters out current rules. Every unlisted declaration, markup element and order pair still fails.

Ticket #134 approves two TextBlock order reversals: `openui-text-block-secondary#0` (positive)
and `openui-text-block-secondary#1` (negative) now follow the base secondary rule
`openui-inline-markdown-renderer+openui-text-block-secondary#0`. These tone bodies were identical
to rules in Tag, IconTag, CodeBlock, TextCallout and MetricIndicator, so Goober gave them the first
registrant's position. Component-specific comments now keep the tone after the base colour,
deterministically honoring the tone prop. No declarations or markup change. Both server modes
and the browser comparison use this list; the raw order report remains unchanged.

## Recording

The browser baselines and browser order reports were captured with the server ones, on the same
pre-migration build (above). Record only on a pre-migration build, never to accept a change:

```sh
pnpm --filter @openuidev/react-components build
pnpm --dir fork/react-components-dev css:record
pnpm --dir fork/react-components-dev css:check
```

The browser spec uses its own existing collection: real portals, popovers, editors and measured
controls, reopened for mutually exclusive states, with every declared client-only class required.
A missing baseline fails comparison; there is no automatic update or fallback to server-only
coverage. `css:check --server-only` runs the server portion without Chromium.

## Representation and limits

Markup retains the generated class slots, replacing each hash by a stable-class anchor and a
slot number in first-markup-occurrence order. Distinct classes and shared class relationships
remain distinct. Markup is stored split before each tag, so a diff shows the changed element.
Rules are indexed by those stable anchors and keep selectors, condition wrappers, declaration
order, duplicates, values, importance and referenced keyframes. Named keyframes from every module
share one `@keyframes` entry and compare sorted by name (stably, so duplicates of one name keep
their order): their sheet order across modules is registration order, which becomes import order,
and keyframes with different names never compete.

`order` lists, for each element and each style module giving it more than one generated class,
those classes in sheet order. Equal-weight rules resolve by that order, and ADR 0002 keeps it
within a module (root, then variant, size, tone). Order across modules becomes import order by
design, so it is left to the order report.

Each rule records its cascade layer (`layer`), not the `@layer` blocks that express it: one block
per rule today or one around the whole sheet after #131 record the same. Layer-mode samples
(`server-layer.json`, and the `openui/…` keys in `browser-*.json`) keep rules and order but not
markup, because the API that turns the layer on changes with #131 while the declarations of each
rule and their layer must not. `css-snapshot-layer.test.tsx` also fails, naming the rule, when a
component rule sits outside the `openui` layer. It runs in its own file, so its module graph is
its own. Generated animation names use linked aliases. Opaque React instance IDs and their
references are normalized; other attributes, inline styles, content and classes remain exact.
The server and browser use a fixed October 2026 clock and UTC timezone for date-driven fixtures.
Rules are selected with the contract's `cssFor` collector, not by slicing newly registered CSS.
Client markup supplies the parts absent from server markup, including when registration moves
to import time. Browser fixture markup must settle before collection.

The order reporter consumes raw public render/sheet collections from a temporary directory.
Its separate diagnostic provenance scan imports built style modules and compiles their exports
into an isolated Goober target to identify the actual calling module, including composed helpers;
it also handles plain class-map exports. This metadata scan is not the source of snapshot CSS:
all compared CSS comes from the public `getComponentStyles()`. Stable targets disambiguate
identical rules whose Goober hash is shared across modules. Missing provenance is an error.
Goober registers a shared hash once, so the rule takes the sheet position of the first module
that registers it; later modules reuse that class and position. The provenance scan also
compiles each rule as layer mode does today, so layer-mode classes have provenance too.
Neither the scan nor its imports enters shipped code.

`css:check` compares each fresh report with the committed `order-*.md` by collision row
(component, element, module pair and shared properties; occurrence indexes are ignored because
they move with markup). A new row fails the check and is printed with `+`; a row that disappeared
is printed as fine.

The report groups identical elements with every occurrence index, lists applicable modules,
and lists literal property names shared by each pair. It conservatively includes possible states,
pseudo-elements, media and container branches. Common physical shorthands are expanded to catch overlaps such as `padding`/`padding-left` and
`border`/`border-color`. The report does not decide whether conditions can overlap, resolve logical
versus physical properties, or compute the winning value. Identical declarations shared
by modules are included too. Review the report together with browser parity for cascade risks.

## Sensitivity proof

Each change below was made alone in `packages/react-components/src`, the library rebuilt and
`pnpm css:check` run on port 5581, then the change was reverted and the library rebuilt. Every one
failed with a diff on the changed line.

| Change                                                                        | What failed                                                                                                                        |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Button root `cursor: pointer` → `default`                                     | 16 server tests (unlayered and layer), 4 browser components: `"cursor:pointer"` → `"cursor:default"`                               |
| Button's `root` css call moved after `tone` (same rules, root registers last) | 16 server tests, 4 browser components: `order` `openui-button#0 < #1 < #2 < #3` → `#1 < #2 < #3 < #0`                              |
| TooltipWrapper `z-index: 9999` → `9998` (client-only part)                    | the TooltipWrapper browser comparison: `"z-index:9999"` → `"z-index:9998"`                                                         |
| Layer mode only: Button root's `cursor` changed inside the layer block        | 50 layer-mode server tests and the browser layer samples; unlayered tests pass                                                     |
| Layer mode only: Button root's rule registered outside the layer              | 28 server tests, including "every rule sits in the openui layer" naming the rule `(layer: none)`                                   |
| StackedLegend's separator also sets `background-color`, which Separator sets  | the declaration diffs, and the order comparison printing the new collision row for `order-server.md` and `order-browser-Charts.md` |
