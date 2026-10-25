# Observed baseline — behavior that is not a defect (#31)

Revision `433a0e31d7c54d1181a5bbf899faaa5be883077b`.

Things worth recording for the #12 migration that are **working as designed** or
are properties of the surrounding libraries rather than of openui. Defects live
in [`defects.md`](./defects.md).

---

## OBS-1 — markdown link safety does not come from openui's own gate

`packages/react-ui` exports a URL gate (`safeUrl` / `safeOpenUrl`,
`src/index.ts:139`) and routes `Sources`' `openSourceInNewTab` through it. **That
gate is not in the markdown link path at all.** `MarkDownRenderer`'s `a` override
passes `href` straight through.

Markdown links are protected by two *library* layers instead:

1. **react-markdown 10.1.0's `defaultUrlTransform`** strips dangerous
   destinations before they reach React. A `[x](javascript:alert(1))` renders with
   an empty `href`.
2. **React 19 itself** refuses to render a `javascript:` href, substituting
   `javascript:throw new Error('React has blocked a javascript: URL as a security
   precaution.')`. Verified directly in Chrome.

**Why this matters for #12** both protections are inherited, not owned. A
migration that changes markdown library, pins an older react-markdown, or renders
links outside React's attribute handling loses them silently, because openui has
no equivalent check of its own on that path. Worth an explicit decision.

What openui *does* own on that path: `target="_blank"` plus
`rel="noopener noreferrer"` on every rendered link (reverse-tabnabbing
protection), verified in Chrome.

---

## OBS-2 — `Separator` is semantic by default

`Separator` forwards to Radix without setting `decorative`, so the default role
is `separator` (announced by assistive technology), not `none`. Passing
`decorative` yields `role="none"`.

Recorded because a migration could reasonably assume a visual rule is
presentational. This ticket makes **no accessibility certification claim**; this
is one observed attribute, not an audit.

---

## OBS-3 — `TableHead` and `TableCell` apply alignment to different elements

For the same `align` value:

- `TableHead` puts `openui-table-align-*` on an **inner** `div.openui-table-head-content`
- `TableCell` puts it on the **`<td>` itself**

Both produce the intended visual result, but a migration that reimplements one
primitive by analogy with the other will move the class, and any consumer CSS
targeting these selectors will break. (Independently of this, MD-4 means the
markdown path never applies either class.)

---

## OBS-4 — the `dependencies.ts` convention is applied inconsistently

Several in-scope families declare a dependency list; most do not:

| Declares `dependencies.ts` | Does not |
|---|---|
| MarkDownRenderer, Table, CodeBlock, Image, ImageBlock, ListBlock, ListItem, Separator, Steps, Carousel | InlineMarkdownRenderer, ImageGallery, ImageText, ImageTextLarge, Citation, Sources, SourceFaviconImage, IconText, IconTag, InlineHeader, EditableTable |

So `dependencies.ts` **cannot** be used alone to build a migration dependency
map — it would miss `InlineMarkdownRenderer → MarkDownRenderer → Table`, one of
the couplings #31 explicitly asks about. The map in
[`inventory.md`](./inventory.md) is derived from actual imports and verified by
rendering, not from these files.

---

## OBS-5 — `InlineMarkdownRenderer` flattening concatenates text without separators

Block flattening replaces `p`/`h1`–`h6`/`ul`/`ol`/`li` with a Fragment, so
structural boundaries disappear from the output. List items run together with
only the source newlines between them. This is the documented intent, recorded so
that a migration preserving "inline" semantics knows the current output shape.

---

# Harness capabilities and limits

Stated so that nothing here is read as stronger evidence than it is.

## What the jsdom suite genuinely exercises

Real React rendering of the unchanged legacy components with a single React
instance, real DOM queries, real prop plumbing, and real pure-function behavior
(`safeUrl`, `getFaviconUrl`).

## What it simulates, and is re-verified in Chrome

| Simulated under jsdom | Why | Re-verified in Chrome by |
|---|---|---|
| Image `load` / `error` | jsdom never loads subresources, so neither event fires on its own; tests dispatch them | `img-error` (a real 404 on a local asset) |
| `naturalWidth` / `naturalHeight` | always 0 under jsdom; tests define them per case | `favicon-threshold` (real 16×16 and 64×64 decodes) |
| Raw-HTML inertness | jsdom's parser, not Chrome's | `raw-html-inert` |
| URL scheme resolution | jsdom's URL handling, not Chrome's | `su-2-nbsp`, `link-attributes` |

## Harness shims, and what they touch

`setup/vitest.setup.ts` stubs `scrollIntoView`, `scrollTo` and `ResizeObserver`,
which `ScrollableTable` uses for its overflow affordances. Any ScrollableTable
behavior that depends on real measurement is therefore **not** evidence under
jsdom — it is covered in Chrome instead (`table-scroll`, which asserts a real
overflow and a real click that moved `scrollLeft` 0 → 84).

Image loading is deliberately **not** shimmed, so that the simulation is visible
in each test rather than hidden in setup.

## The no-external-fetch guarantee

#31 forbids fetching external content. Two in-scope behaviors would otherwise do
it (SRC-1's favicon endpoint; any markdown image). This is enforced, not
asserted:

1. Non-local requests are blocked via `Network.setBlockedURLs`.
2. **Every attempted request is recorded**, and the run distinguishes
   *blocked* attempts (evidence about a component) from *escaped* ones (a real
   fetch), failing only on the latter.

Latest run: 2 blocked attempts, both the SRC-1 favicon requests; **0 escaped**.

## Reference images are reference evidence only

12 captures (6 scenarios × light/dark) at 1280×900 with
`prefers-color-scheme` emulated and animation frozen. They are byte-identical
across consecutive runs, and light/dark differ for all six scenarios.

**Nothing diffs them.** They are for a human to compare against a future
implementation. This ticket does **not** implement asserted visual parity, which
would require an agreed baseline to diff against.
