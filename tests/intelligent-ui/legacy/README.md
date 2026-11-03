# #160's suites, kept for the tickets that port them

These are ankit-thesys/openui-comp#160's tests as they were at 22e7e0b1, copied unchanged from
`packages/kits/Intelligent-ui/src/__tests__` and the package's vitest configs. **Nothing here runs.**
They target PR 70's old folder, package name and internal paths (`../../lib`, `../../components/...`),
and most of them reach inside the package, which #199 rules out: the new tests go through the root
exports, the rendered page and the CLI's prompt only.

Each suite is ported to the harness one level up (`../harness`, `../host`, `../specs`) by the ticket
in this table, and deleted from here when it is. #201 ported `browser/render.test.tsx` to the sweep
(`../specs/sweep.spec.ts`) and `browser/layout.test.tsx` to `../specs/layout.spec.ts`.

| Suite | What it checks | Ported by |
|---|---|---|
| `browser/styles.test.tsx` | computed colours, spacing and type for each component | not ported by #201: it reads the library's class names and needs host options (an app's tokens and themes) the host doesn't have |
| `browser/theme-provider.test.tsx` | ThemeProvider's palette, and roots other than `Col` | the palette for every root: `../specs/sweep.spec.ts` (#201). The rest tests the ThemeProvider f5fb4923 replaced |
| `browser/app-css.test.tsx`, `browser/app-css-layer.test.tsx`, `browser/style-sheet.test.tsx`, `helpers/style-layer.ts` | a host's own CSS, layered or not, can restyle the output | not ported by #201: needs a host with an app stylesheet and a style layer |
| `browser/icons.test.tsx` | icon stroke and size inside react-components' parts | not ported by #201: it mounts components directly, not a program |
| `browser/schema-fixes.test.tsx` | schema fixes from the review rounds render | the rendering cases: `../specs/layout.spec.ts` (#201). The Svg signature case reads the prompt spec: #202 |
| `browser/interactions.test.tsx` | forms, controls, Popover, Timer, Flashcard, clipboard | #203 |
| `browser/review-fixes.test.tsx` | Map, Popover, RadioGroup, Code and HtmlView fixes | #203 |
| `functions/*.test.ts` | the 59 `@functions` against the source app's answers | #203 |
| `parity/` (driver, harness, gallery, fixtures, known differences) | the library against the source app | #204: ported to `../parity`; the live gallery is dropped, as the host serves each program |
| `styles.contract.test.ts` | the package's source files: style-file names, class prefixes, folders | not ported: it reads the package's source, which #199's testing decisions rule out |

`../parity/fixtures/programs.json` keeps PR 70's Chart signature, with the `currency` argument: it is
what the source app renders. The library's copy, migrated to the current signature, is
`../fixtures/gallery.json`.

## Ported

- `library.test.ts` and `__snapshots__/prompt.txt` → `../prompt/library.spec.ts` and `../prompt/prompt.spec.ts` (#202). The counts, the groups and the gallery checks read the root exports; the prompt snapshot is the CLI's output, in `../prompt/__snapshots__/prompt.txt`.
- `packaging.test.ts` → `../prompt/packaging.spec.ts` (#199 stories 6–9). Plain Node loads the root entry instead of `dist/lib`, and the street route's format is checked in the README, which ships. The static stylesheet scan and the check that the Map sends longitude first read the package's source, so they're dropped: the plain-Node import covers the first, and the second is behaviour for #203's network checks.
