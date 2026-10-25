# Baseline findings — text / media / Table (#31)

Revision: `433a0e31d7c54d1181a5bbf899faaa5be883077b`
Package under observation: `packages/react-ui` (**read-only** — nothing here was repaired)

These are **observations of existing behavior**, not a list of things this ticket
changed or a specification for the migration. Several are deliberate design
decisions with consequences worth deciding on explicitly rather than inheriting
silently; those say so. None of them were "fixed" to make a test pass, and no
assertion was weakened to obtain a green run.

Every finding is reproduced by a named check, so the claim and its evidence stay
attached:

| ID | Severity | Family | One line | Reproduced by |
|----|----------|--------|----------|---------------|
| [MD-1](#md-1) | medium | MarkDownRenderer × Table | Table overrides are unreachable by default — no GFM plugin ships | `tests/markdown-table.test.tsx` |
| [MD-2](#md-2) | **high** | InlineMarkdownRenderer × Table | Emits `<table>` inside `<span>`; reachable from ordinary text props on 4 more families | `tests/markdown-table.test.tsx`, browser `md-2-inline-table` |
| [MD-3](#md-3) | low | MarkDownRenderer × Table | `node="[object Object]"` leaks onto every markdown table element, silently | `tests/markdown-table.test.tsx`, browser `md-3-node-leak` |
| [MD-4](#md-4) | medium | MarkDownRenderer × Table | The markdown alignment adapter never fires; openui alignment classes are bypassed | `tests/markdown-table.test.tsx`, browser `md-4-alignment` |
| [IMG-1](#img-1) | medium | Image | A consumer `onError` silently disables the component's error styling | `tests/images.test.tsx` |
| [CB-1](#cb-1) | medium | CodeBlock | Reports "Copied to clipboard" even when the copy rejected | browser `code-copy` |
| [SRC-1](#src-1) | decision | Sources | Every source hostname is sent to a third-party endpoint on render | `tests/citations-sources.test.tsx`, browser blocked-request log |
| [SRC-2](#src-2) | low | Sources | Unencoded hostname interpolation injects query parameters into that request | `tests/citations-sources.test.tsx` |
| [SU-1](#su-1) | low | safeUrl | `blob:` is not in the rejected-scheme list | `tests/safe-url.test.ts` |
| [SU-2](#su-2) | **theoretical** | safeUrl | NBSP inside a scheme is not normalised — **proven NOT exploitable in Chrome** | `tests/safe-url.test.ts`, browser `su-2-nbsp` |

Observations that are **not** defects are in [`observed-baseline.md`](./observed-baseline.md).

---

<a id="md-1"></a>
## MD-1 — the Table overrides are unreachable through the default public API

**Severity** medium · **Where** `packages/react-ui/src/components/MarkDownRenderer/MarkDownRenderer.tsx:76-82`

`MarkDownRenderer` maps six markdown elements onto the Table primitives
(`table`, `thead`, `th`, `tbody`, `tr`, `td`), and
`MarkDownRenderer/dependencies.ts` declares `[...TableDeps]` accordingly. But the
component ships **no GFM remark plugin**, and GitHub-flavoured tables are a GFM
extension. With default options a markdown table is parsed as an ordinary
paragraph.

**Minimal reproduction**

```tsx
<MarkDownRenderer textMarkdown={"| a | b |\n| --- | --- |\n| 1 | 2 |"} />
// -> <p>| a | b | | --- | --- | | 1 | 2 |</p>, zero <table> elements
```

Supplying the plugin reaches the mapping, which is how we know the mapping
itself is fine:

```tsx
<MarkDownRenderer textMarkdown={table} options={{ remarkPlugins: [remarkGfm] }} />
// -> one <table class="openui-table">
```

**Why it matters for #12** A consumer rendering LLM markdown with default options
gets raw pipe characters, not a table. `InlineMarkdownRenderer` does supply
`remarkGfm`, so the two renderers disagree about whether tables exist — see MD-2.

---

<a id="md-2"></a>
## MD-2 — the inline renderer emits block content inside a `<span>`

**Severity** high · **Where** `InlineMarkdownRenderer.tsx:22-63`

Its own doc comment states: *"Block-level elements (paragraphs, headings, lists)
are flattened so the output stays inline."* It overrides `p`, `h1`–`h6`, `ul`,
`ol` and `li` with a Fragment, but **not** `table` — and unlike `MarkDownRenderer`
it **does** enable `remarkGfm`, so tables genuinely occur.

The result nests `<div>` and `<table>` inside a `<span>`:

```
TABLE < DIV.openui-table-container < DIV.openui-markdown-renderer < SPAN.openui-inline-markdown-renderer
```

`<span>` is phrasing content; `<div>` and `<table>` are flow content, so this
violates the HTML content model and breaks the component's stated contract.
Browsers render it, which is why it goes unnoticed. Confirmed in Chrome
(`md-2-inline-table`), not just jsdom.

### Blast radius — why this is high and not medium

`TextBlock` and `InlineHeader` both render their text *through*
`InlineMarkdownRenderer` (see [`dependency-map.md`](./dependency-map.md)), and
`IconText` / `ImageText` / `ImageTextLarge` render through `TextBlock`. So MD-2 is
not confined to consumers who deliberately chose a markdown component: it fires
from an ordinary-looking text prop.

**Verified, not inferred** — each of these produces a real `<table>` from
table-shaped text:

| Component | Prop | `<table>` produced |
|---|---|---|
| `TextBlockView` | `primary` | 1, nested inside the `<span>` |
| `InlineHeader` | `heading` | 1 |
| `IconText` | `title` | 1 |

**CONTROL** the same components with ordinary text produce none, so the trigger
is the content shape rather than the components themselves.

Since this text is typically LLM-authored, table-shaped content arriving in a
`title` is a realistic input, not a contrived one.

---

<a id="md-3"></a>
## MD-3 — `node="[object Object]"` leaks onto every markdown table element

**Severity** low · **Where** the component mapping in `MarkDownRenderer.tsx:76-82`

react-markdown 10 passes the mdast `node` to custom components. The Table
primitives spread their remaining props onto the DOM element, so `node` is
rendered as an attribute and stringified.

```
<table class="openui-table" node="[object Object]">
<thead class="openui-table-header" node="[object Object]"> ... and so on
```

11 elements on a 3-column, 1-row fixture. **Attribution is demonstrated, not
assumed**: a hand-composed Table renders **0** such attributes, so the cause is
the markdown mapping rather than the Table primitives, which both paths share.

React 19 logs **no warning**, which is how this survives: nothing surfaces it at
runtime, so only DOM inspection reveals it. `th`/`td` go through adapters that
destructure only `align`, leaving `node` in the spread.

---

<a id="md-4"></a>
## MD-4 — the markdown alignment adapter never fires

**Severity** medium · **Where** `MarkDownRenderer.tsx:19-31`

`MarkdownTableHead` / `MarkdownTableCell` exist solely to translate a markdown
`align` prop into openui's alignment classes via `toTableAlignment`.
react-markdown **10.1.0 does not pass `align`** — it emits the alignment as an
inline `style="text-align: …"`. So the adapter always receives `align ===
undefined`, `toTableAlignment` returns `undefined`, and no openui class is ever
applied.

| | markdown path | hand-composed path |
|---|---|---|
| `openui-table-align-*` class | **never applied** | applied correctly |
| alignment mechanism | inline `style="text-align"` | openui class |

The alignment still *looks* right, which is why this went unnoticed — but it
bypasses openui's class-based styling entirely, and the adapter plus
`toTableAlignment` are dead code. This has the shape of a silent casualty of a
react-markdown major upgrade: `align` is how older versions passed it.

**CONTROL** Passing `align` directly to `TableHead`/`TableCell` *does* produce
the classes, so the adapter is not broken — it is simply never fed.

---

<a id="img-1"></a>
## IMG-1 — a consumer `onError` silently disables Image's error styling

**Severity** medium · **Where** `packages/react-ui/src/components/Image/Image.tsx:44-52`

`Image` installs its own `onLoad`/`onError` and **then** spreads `{...rest}`.
Neither handler is destructured out of props, so a consumer-supplied handler
replaces the internal one. The internal handler is the only thing that sets the
state driving `openui-image--error`, so the error class stops appearing.

```tsx
<Image src={broken} onError={logIt} />   // logIt runs; openui-image--error never applied
<Image src={broken} />                   // openui-image--error applied
```

Supplying `onError` for logging or telemetry is an ordinary thing to do, and the
prop is part of the component's declared `ImgHTMLAttributes` surface, so nothing
signals the conflict.

---

<a id="cb-1"></a>
## CB-1 — CodeBlock reports copy success unconditionally

**Severity** medium · **Where** `packages/react-ui/src/components/CodeBlock/CodeBlock.tsx:19-23`

```ts
const handleCopy = () => {
  navigator.clipboard.writeText(codeString);  // not awaited, not caught
  setCopied(true);                            // runs regardless
  setTimeout(() => setCopied(false), 1000);
};
```

The promise is neither awaited nor caught, and `setCopied(true)` runs
unconditionally. When the write rejects — an insecure context, denied
permission, an unsupported browser — the button still switches to
`aria-label="Copied to clipboard"` and the `-copied` class, while the clipboard
is unchanged. The rejection also surfaces as an unhandled promise rejection.

**Reproduced in Chrome by fault injection, stated plainly:** `navigator.clipboard.writeText`
is replaced with a rejecting stub (what a denied permission does), then the button
is clicked with real trusted input. Observed: 1 clipboard call, 1 unhandled
rejection, `aria-label="Copied to clipboard"`, `-copied` class present.

---

<a id="src-1"></a>
## SRC-1 — every source hostname is disclosed to a third party on render

**Severity** decision, not a bug · **Where** `Sources/SourceContext.tsx:35-45`

`getFaviconUrl` builds `https://www.google.com/s2/favicons?sz=128&domain=<host>`
and `CardSourceProvider` calls it for every source; `SourceFaviconImage` then
loads it. Rendering a sources strip therefore tells Google the hostname of every
source shown to the reader, once per source.

This is deliberate and documented in the source. It is listed here because it is
a **privacy characteristic the migration should adopt knowingly** rather than
inherit silently, not because it is a defect.

**Evidence that it really reaches the network:** the Chrome runner blocks
non-local requests *and records every attempt*. A single `ref-citations` render
with two sources attempted:

```
https://www.google.com/s2/favicons?sz=128&domain=example.com        [blocked: inspector]
https://www.google.com/s2/favicons?sz=128&domain=docs.example.org   [blocked: inspector]
```

**Positive property worth preserving:** only the hostname is forwarded.
Credentials, path, query and fragment are dropped by construction, verified
against `https://user:s3cret@example.com/private/doc?token=abc#x`.

---

<a id="src-2"></a>
## SRC-2 — unencoded hostname interpolation injects query parameters

**Severity** low · **Where** `Sources/SourceContext.tsx:41-43`

```ts
return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
```

`domain` is interpolated **without encoding**. `&`, `=`, `~` and `'` are all legal
WHATWG hostname characters, so a crafted source url appends arbitrary parameters
to the outbound third-party request:

```
getFaviconUrl("https://example.com&evil=1/x")
// -> https://www.google.com/s2/favicons?sz=128&domain=example.com&evil=1
```

Percent-encoding in the input does not help — `%26` is decoded into the hostname.

**Bounded, and the bound is verified:** the scheme, host and path are fixed
before the interpolation point, and `#`/`?` are consumed as URL delimiters so
they never reach the hostname. The reachable impact is adding or overriding query
parameters on the Google request, **not** redirecting it.

Source urls are document- or LLM-supplied, which makes this reachable from
untrusted data. The fix is `encodeURIComponent`, a one-liner — deliberately not
applied here, since `packages/react-ui` is read-only for this ticket.

---

<a id="su-1"></a>
## SU-1 — `blob:` is not in the rejected-scheme list

**Severity** low · **Where** `_shared/utils/safeUrl.ts:9`

The denylist covers `javascript:`, `data:`, `vbscript:` and `file:`. `blob:` is
not included, so `safeUrl` returns it as safe and `safeOpenUrl` will open it. A
`blob:` URL can carry an HTML document, and one created by the page's own origin
executes in that origin.

Recorded rather than endorsed: whether `blob:` belongs on the list is a policy
decision for whoever owns the migration, and creating a hostile `blob:` requires
same-origin script execution already.

---

<a id="su-2"></a>
## SU-2 — NBSP inside a scheme is not normalised (**theoretical**)

**Severity** theoretical — **proven not exploitable in Chrome** · **Where** `safeUrl.ts:11-14`

The implementation comment claims NBSP is handled "via `String.trim`".
`String.prototype.trim` does remove U+00A0, but **only at the ends** of the
string; the control-character strip covers U+0000–U+001F and U+007F, which
excludes U+00A0. An NBSP placed *inside* a scheme therefore survives, and
`safeUrl` returns the URL as safe:

```ts
safeUrl("java script:alert(1)")  // -> returned unchanged, treated as safe
```

**Settled empirically rather than left as speculation.** The Chrome scenario
`su-2-nbsp` installs that href through the DOM and clicks it with real trusted
input:

- Chrome resolves the href to **`http:`** — it treats the string as a relative
  URL, because NBSP is not ASCII whitespace and so does not form a valid scheme.
- The payload **did not execute**.
- **The control did execute.** A genuine `javascript:` href, installed the same
  way, ran its payload — so "nothing happened" is a real negative result, not a
  broken detector.

The control matters: without it this finding would have been reported on the
strength of an assertion that could not have failed. That is precisely how the
sibling #23 work produced a defect that later had to be withdrawn.

**Note for the migration** React is a second line of defence here and is doing
real work: it refuses to render a `javascript:` href at all, substituting
`javascript:throw new Error('React has blocked a javascript: URL as a security
precaution.')`. The DOM bypass above was required to test the browser's own
parsing. See `observed-baseline.md` OBS-1 — openui's `safeUrl` is **not** in the
markdown link path.
