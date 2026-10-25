# Coverage matrix (#31)

Revision `433a0e31d7c54d1181a5bbf899faaa5be883077b`.

Every in-scope family appears, including the ones where coverage is thin. A blank
cell is never used to imply coverage: each is either **✓** (asserted), **ref**
(reference image only, not asserted), **n/a** (does not apply to this family), or
**gap-N** (explicitly untested, listed at the bottom).

Legend for *Security / boundary*: raw-HTML inertness, unsafe-URL handling, or
untrusted-input tolerance, whichever applies to that family.

## text / presentation

| Family | Default render | Public props | Security / boundary | Real browser | Reference image | Findings |
|---|---|---|---|---|---|---|
| `MarkDownRenderer` | ✓ | ✓ options, variant | ✓ raw HTML, js:/vbscript: links + images, control-char obfuscation | ✓ | ✓ light+dark | MD-1, MD-3, MD-4 |
| `InlineMarkdownRenderer` | ✓ | ✓ content | ✓ raw HTML inert | ✓ | ✓ light+dark | MD-2 |
| `CodeBlock` | ✓ | ✓ language, codeString | ✓ code content not executed | ✓ copy click | ✓ light+dark | CB-1 |
| `IconText` | ✓ | ✓ layout, subtitle, bad icon name | n/a | ref | ✓ light+dark | MD-2 blast radius |
| `IconTag` | ✓ | ✓ 6 variants, 5 sizes | n/a | ref | ✓ light+dark | — |
| `TextBlock` (`TextBlockView`) | ✓ | ✓ secondary/tertiary, tone, 4 sizes, ref | ✓ raw HTML inert via its markdown path | ref | ✓ light+dark (within ref-text) | MD-2 blast radius |
| `InlineHeader` | ✓ | ✓ incl. both props absent | n/a | ref | ✓ light+dark | MD-2 blast radius |
| `ListBlock` | ✓ | ✓ variant, size pass-down | n/a | ref | ✓ light+dark | — |
| `ListItem` | ✓ | ✓ onClick, image variant | n/a | ref | ✓ light+dark | gap-3 |
| `Separator` | ✓ | ✓ orientation, decorative | n/a | ref | ✓ light+dark | OBS-2 |
| `Steps` / `StepsItem` | ✓ | ✓ title, details, number | n/a | ref | ✓ light+dark | — |

## images

| Family | Default render | Public props | Security / boundary | Real browser | Reference image | Findings |
|---|---|---|---|---|---|---|
| `Image` | ✓ | ✓ scale, aspectRatio, styles, ref | n/a | ✓ real 404 → error class | ✓ light+dark | IMG-1 |
| `ImageBlock` | ✓ | ✓ src, alt | n/a | ref | ✓ light+dark | gap-4 |
| `ImageGallery` / `GalleryModal` | ✓ | ✓ images, empty list | n/a | ref | gap-5 | gap-5 |
| `ImageText` | ✓ | ✓ layout, subtitle | n/a | ref | ✓ light+dark | — |
| `ImageTextLarge` | ✓ | ✓ title, subtitle | n/a | ref | ✓ light+dark | — |
| `SourceFaviconImage` | ✓ | ✓ url, size, alt | ✓ empty url | ✓ real 16×16 vs 64×64 decode | ✓ light+dark | — |

## citations / sources

| Family | Default render | Public props | Security / boundary | Real browser | Reference image | Findings |
|---|---|---|---|---|---|---|
| `Sources` + `CardSourceProvider` | ✓ | ✓ empty, absent provider, url-less source | ✓ outbound request recorded | ✓ blocked-request evidence | ✓ light+dark | SRC-1, SRC-2 |
| `Citation` | ✓ trigger | ✓ sources, empty sources | n/a | ref | ✓ light+dark | gap-1 |
| `getFaviconUrl` | n/a | ✓ pure function | ✓ credentials/path/query dropped; injection characterised | ✓ via Sources | n/a | SRC-2 |
| `openSourceInNewTab` | n/a | ✓ target/features defaults | ✓ all four executable schemes refused | n/a | n/a | — |
| `safeUrl` / `safeOpenUrl` | n/a | ✓ full contract | ✓ 4 schemes × case × whitespace × control chars | ✓ `su-2-nbsp` | n/a | SU-1, SU-2 |

## table

| Family | Default render | Public props | Security / boundary | Real browser | Reference image | Findings |
|---|---|---|---|---|---|---|
| `Table` + 6 primitives | ✓ | ✓ align on head/cell, composition | n/a | ✓ | ✓ light+dark | OBS-3 |
| `ScrollableTable` | ✓ | ✓ overflow detection | n/a | ✓ real click scrolled 0 → 84 | ✓ light+dark | gap-2 |
| Table **via markdown** | ✓ | ✓ alignment, node leak | n/a | ✓ | ✓ light+dark | MD-1, MD-3, MD-4 |

## dependency-only and adjacent

| Family | Status |
|---|---|
| `Carousel` (7 exports) | **Dependency only.** Recorded in the dependency map; rendered transitively via `Sources`. Not independently tested — owned by whoever migrates it. |
| `IconButton` (2 exports) | **Dependency only.** Exercised transitively through `CodeBlock`'s copy button and `ScrollableTable`'s controls. |
| `EditableTable` (7 exports) | **Deliberately unclaimed.** Table-shaped, but #31 assigns data/card baselines to another contributor and says not to duplicate Table into that task. Recorded in the inventory so ownership is explicit; **no evidence produced here**. |

---

# Explicit gaps

These are untested, and are listed rather than papered over.

| ID | Gap | Why |
|---|---|---|
| gap-1 | `Citation` tooltip open/pin/dismiss interaction | Radix tooltip with a portal and a pinnable-hover hook. The trigger and its ARIA label are asserted; the open/pinned states are not. Needs the same popup-geometry treatment #23 gave Select/DatePicker. |
| gap-2 | `ScrollableTable` left-affordance and boundary states | The forward click is verified in Chrome. The disabled-at-start / disabled-at-end transitions and the left control are not asserted. |
| gap-3 | `ListItem` action affordances (`actionLabel`, `actionIcon`) | Rendered but not asserted; `onClick` on the item itself is covered. |
| gap-4 | `ImageBlock` beyond default render | Its remaining props are not exercised. |
| gap-5 | `ImageGallery` modal (`GalleryModal`) | Opening the gallery modal and its keyboard/focus behavior are untested, and it has no dedicated reference image. |
| gap-6 | Asserted visual parity | 12 reference images exist, but nothing diffs them. Deliberate: parity needs an agreed baseline to diff against, which this ticket does not establish. |
| gap-7 | SSR / hydration | Explicitly out of scope per #31. `packages/react-ui`'s own tests are SSR; none of this evidence covers that path. |
| gap-8 | Accessibility certification | Not claimed. OBS-2 records one role attribute; that is an observation, not an audit. |
| gap-9 | Performance | Not measured and not claimed. No timed runs were performed, so nothing here contends with the workers' benchmark windows. |
| gap-10 | Markdown plugin matrix | Only the default options and `remarkGfm` are covered. `rehypeKatex`, `remarkMath` and `remarkEmoji` appear in the component's own stories but are not exercised here. |
| gap-11 | `MarkDownRenderer` `variant` styling | The `card` / `sunk` variants are not captured as reference images. |
