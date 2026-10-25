# Dependency map for migration #12 (#31 item 2)

Revision `433a0e31d7c54d1181a5bbf899faaa5be883077b`.

Derived from **actual imports** in `packages/react-ui/src/components/*`, then
confirmed by rendering (each edge marked ✓ is asserted by a test that observes
the dependency's own markers in the output).

> `dependencies.ts` was **not** used as the source. Only 10 of the 20 in-scope
> families declare one, and the declarations miss the single most important edge
> for this ticket — `InlineMarkdownRenderer → MarkDownRenderer → Table`. See
> OBS-4 in [`observed-baseline.md`](./observed-baseline.md).

## The Table coupling #31 asks about

`Table` is not an optional peer of the markdown renderers. It is wired into them:

```
InlineMarkdownRenderer                      (supplies remarkGfm)
  └── MarkDownRenderer
        ├── CodeBlock ── IconButton
        └── Table  ◄── mapped onto markdown table/thead/th/tbody/tr/td
              └── IconButton                (ScrollableTable scroll controls)
```

Consequences, each with its finding:

- `MarkDownRenderer` declares the mapping but ships no GFM plugin, so the edge is
  **unreachable by default** — **MD-1**.
- `InlineMarkdownRenderer` *does* supply `remarkGfm`, so the edge is live there
  and produces a block-level `<table>` inside a `<span>` — **MD-2**.
- Everything crossing that edge carries a stray `node` attribute — **MD-3**.
- Alignment crosses it as an inline style instead of the openui classes — **MD-4**.

**Migrating Table and the markdown renderers independently is not possible
without deciding MD-1 and MD-2 first.**

## Full in-scope edges

| Family | Depends on (in-package) | Verified |
|---|---|---|
| `InlineMarkdownRenderer` | `MarkDownRenderer`, `Citation` (TextContentCitation), `ThemeProvider`, `_shared/remark` | ✓ |
| `MarkDownRenderer` | `CodeBlock`, `Table` (+6 primitives), `ThemeProvider` | ✓ |
| `TextBlock` | `InlineMarkdownRenderer` | ✓ |
| `InlineHeader` | `InlineMarkdownRenderer` | ✓ |
| `IconText` | `IconTag`, `TextBlock`, `_shared/icons` | ✓ |
| `ImageText` | `TextBlock` | — |
| `ImageTextLarge` | `TextBlock` | — |
| `CodeBlock` | **`IconButton`** | ✓ (copy button) |
| `Table` / `ScrollableTable` | **`IconButton`** | ✓ (scroll controls) |
| `Sources` → `ListedSources` | **`Carousel`**, **`IconButton`**, `SourceFaviconImage`, `_shared/utils` (safeOpenUrl) | ✓ |
| `Citation` | `SourceFaviconImage`, `Sources` (SourceContext), `ThemeProvider`, `_shared/hooks`, `_shared/icons` | ✓ |
| `SourceFaviconImage` | `_shared/icons` | ✓ |
| `ImageGallery` | **`Button`**, `IconButton`, `ThemeProvider` | — |
| `ListBlock` | `ListItem` | ✓ |
| `IconTag`, `Image`, `ImageBlock`, `ListItem`, `Steps`, `Separator` | none in-package | ✓ |

## Edges that cross into other people's slices

These are the ones most likely to cause scheduling conflicts:

| Edge | Owner of the dependency | Note |
|---|---|---|
| `ImageGallery → Button` | **Worker 2**, slice #9 | `Button` is already migrated in `packages/react-ui-core`. `ImageGallery` cannot migrate before its Button contract is settled. |
| `CodeBlock → IconButton` | migrated in `react-ui-core` | `IconButton` is present in `react-ui-core`; CB-1 is a `CodeBlock` fault, not an `IconButton` one. |
| `Table → IconButton` | migrated in `react-ui-core` | Scroll controls only; the Table primitives themselves have no dependency. |
| `Sources → Carousel` | **unmigrated** | `Carousel` is not in `react-ui-core` on this revision, so `Sources` has an unmigrated blocker. |

## Transitive reach, stated plainly

Because `TextBlock` and `InlineHeader` both render through
`InlineMarkdownRenderer`, **every** consumer of those two inherits the full
markdown stack, Table included:

```
IconText ─┐
ImageText ─┼─► TextBlock ─► InlineMarkdownRenderer ─► MarkDownRenderer ─► Table
ImageTextLarge ─┘                                                     └─► CodeBlock ─► IconButton
InlineHeader ───────────────► InlineMarkdownRenderer ─► …
```

So MD-2 (a `<table>` inside a `<span>`) is reachable from any `IconText`,
`ImageText`, `ImageTextLarge` or `InlineHeader` whose text happens to contain
pipe characters in a GFM table shape. That is the widest blast radius of any
finding in this ticket, and it is why `TextBlock` was added to the in-scope
inventory once the dependency map revealed it.
