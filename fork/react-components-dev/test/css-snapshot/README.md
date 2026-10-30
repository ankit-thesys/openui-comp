# Hook-free CSS consistency (#129)

`server.json` and `order-server.md` were recorded on 2026-10-30 from the pre-migration
build on top of #128. They are fork-only artifacts. The unit suite compares every server
contract entry, including the focused chart contracts, with the recorded markup and rules.
SharedBase and SkeletonPulse are included through their public consumers. Each failure names
the component and shows the changed declarations/markup in Vitest's expected/received diff.

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

## Browser capture required before the migration

Chromium cannot launch in the implementation sandbox. Consequently the committed capture here
is the server portion only. **The client baseline and client order reports are still missing.**
The orchestrator must run this on the same pre-migration build before committing #129:

```sh
pnpm --dir fork/react-components-dev css:record
pnpm --dir fork/react-components-dev css:check
```

Commit the generated `browser-*.json` and `order-browser-*.md` alongside the server artifacts.
The browser spec uses its own existing collection: real portals, popovers, editors and measured
controls, reopened for mutually exclusive states, with every declared client-only class required.
It records only unlayered samples because layer placement is deliberately excluded from this
consistency check; the original contract assertions still run both modes. A missing browser
baseline fails comparison; there is no automatic update or fallback to server-only coverage.
Do not record again to accept a migration regression. `css:record --server-only` is available for
recording the initial server portion in this sandbox; it cannot substitute for the browser run.

## Representation and limits

Markup retains the generated class slots, replacing each hash by a stable-class anchor and a
slot number in first-markup-occurrence order. Distinct classes and shared class relationships
remain distinct. Rules are indexed by those stable anchors and keep selectors, condition wrappers,
declaration order, duplicates, values, importance and referenced keyframes. Only `@layer` wrappers
are ignored. Generated animation names use linked aliases. Opaque React instance IDs and their
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
Neither the scan nor its imports enters shipped code.

The report groups identical elements with every occurrence index, lists applicable modules,
and lists literal property names shared by each pair. It conservatively includes possible states,
pseudo-elements, media and container branches. Common physical shorthands are expanded to catch overlaps such as `padding`/`padding-left` and
`border`/`border-color`. The report does not decide whether conditions can overlap, resolve logical
versus physical properties, or compute the winning value. Identical declarations shared
by modules are included too. Review the report together with browser parity for cascade risks.

## Sensitivity proof

Changed just Button's `transition: all 0.12s ease` to `transition: all 0.13s ease`, rebuilt,
and ran `pnpm --dir fork/react-components-dev test test/unit/css-snapshot.test.tsx`.
It failed on Button and its seven public compositions (8 failed, 72 passed). The per-component
diff showed exactly `transition:all 0.12s ease` → `transition:all 0.13s ease`, despite the changed
Goober hash. The deliberate source edit was then reverted and the library rebuilt.
