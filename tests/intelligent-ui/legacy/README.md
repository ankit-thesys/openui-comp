# #160's suites, kept for the tickets that port them

These are ankit-thesys/openui-comp#160's tests as they were at 22e7e0b1, copied unchanged from
`packages/kits/Intelligent-ui/src/__tests__` and the package's vitest configs. **Nothing here runs.**
They target PR 70's old folder, package name and internal paths (`../../lib`, `../../components/...`),
and most of them reach inside the package, which #199 rules out: the new tests go through the root
exports, the rendered page and the CLI's prompt only.

Each suite is ported to the harness one level up (`../harness`, `../host`, `../specs`) by the ticket
in this table, and deleted from here when it is.

| Suite | What it checks | Ported by |
|---|---|---|
| `browser/render.test.tsx` | every gallery program renders without errors | #200 (one program), #201 (all of them) |
| `browser/layout.test.tsx` | grids, cards and widths at desktop and 390px | #201 |
| `browser/styles.test.tsx` | computed colours, spacing and type for each component | #201 |
| `browser/theme-provider.test.tsx` | ThemeProvider's palette, and roots other than `Col` | #201 |
| `browser/app-css.test.tsx`, `browser/app-css-layer.test.tsx`, `browser/style-sheet.test.tsx`, `helpers/style-layer.ts` | a host's own CSS, layered or not, can restyle the output | #201 |
| `browser/icons.test.tsx` | icon stroke and size inside react-components' parts | #201 |
| `browser/schema-fixes.test.tsx` | schema fixes from the review rounds render | #201 |
| `browser/interactions.test.tsx` | forms, controls, Popover, Timer, Flashcard, clipboard | #203 |
| `browser/review-fixes.test.tsx` | Map, Popover, RadioGroup, Code and HtmlView fixes | #203 |
| `functions/*.test.ts` | the 59 `@functions` against the source app's answers | #203 |
| `library.test.ts`, `__snapshots__/prompt.txt` | component and function counts, the prompt snapshot, every program names real components | #202 |
| `parity/` (driver, harness, gallery, fixtures, known differences) | the library against the source app | #204 |
| `packaging.test.ts` | loads in plain Node, the street route's documented format | #199 stories 6–9; no ticket yet |
| `styles.contract.test.ts` | the package's source files: style-file names, class prefixes, folders | not ported: it reads the package's source, which #199's testing decisions rule out |

`parity/fixtures/programs.json` keeps PR 70's Chart signature, with the `currency` argument: it is
what the source app renders. The library's copy, migrated to the current signature, is
`../fixtures/gallery.json`.
