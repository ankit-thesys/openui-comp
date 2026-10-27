# Public contract audit — implementation disposition

## Consumer usage

```tsx
// Happy path, after the approved clean rename
import { Button } from '@openuidev/react-components';
const submit = <Button type="submit">Send</Button>;

// Common customization, already supported today under the old package name
import { createTheme, ThemeProvider } from '@openuidev/react-components';
const brand = createTheme({ interactiveAccentDefault: 'oklch(0.6 0.2 260 / 1)' });
const app = <ThemeProvider lightTheme={brand}>{submit}</ThemeProvider>;

// Power user: consumer composition retains its types and source helpers
import {
  CardSourceProvider, useCardSourceContext, safeUrl,
  type CardSource, type SourceWithFavicon,
} from '@openuidev/react-components';
import { openuiChatLibrary } from '@openuidev/kits/react/chat/libs';
```

The renamed imports above are the intended destination, not a claim that the rename has shipped.

## Pinned scope and checks

Read-only production baseline: `57ea72e2892df7fdd551c668d4480a0267f90a09` in `/Users/ankitdas/.codex/worktrees/production-core-kits/openui`. No AGENTS.md or .codegraph directory exists at that checkout root. Concurrent worker changes were limited to two approved important-removal style files when checked. No production files changed by this audit. Each inspected entry hash is saved in symbols.json.

Independently inspected Button, Accordion, Sources, theme usage, the core root, kits entrypoints and package export maps. TypeScript 5.9.3 symbol resolution verified **exactly matching 166 value and 194 type names** across source root and both emitted declaration roots. Both emitted runtime entrypoint export statement lists exactly match those 166 values. This is static export inspection, not module evaluation or runtime behavior certification.

Kits chat has 3 values/5 types; chat/libs has 5 values, matching source and emitted ESM declarations. Independently scanned 61 kits import-bearing files: 101 distinct core symbols, all imported from the supported core root. No private deep-import dependency was found. All 722 local declaration import/re-export edges in core dist resolve; no stranded local declaration reference was found. This does not replace strict packed-consumer typechecking.

Actual Node require-resolution probes confirm core root succeeds; core `/dist/index.mjs`, `/src/index.ts`, `/internal`, `/components/Button` all reject with ERR_PACKAGE_PATH_NOT_EXPORTED. Kits chat and chat/libs resolve; kits root, `/dist/react/chat/index.mjs`, `/src/react/chat/index.ts`, `/internal` reject. Relative declaration imports inside the package remain valid and are not public deep-import APIs.

## Issues (ranked by severity)

- **Warning: removing the four URL/source helpers would break an inherited public contract.** They are not newly leaked migration internals. Legacy `packages/react-ui/src/index.ts:137–139` explicitly calls IconWrapper and safeOpenUrl/safeUrl “Shared chat helpers”. Legacy `src/index.ts:117` re-exports Sources, whose explicit barrel at `components/Sources/index.ts:3–10` includes getFaviconUrl/openSourceInNewTab. Migrated core preserves those explicit exports. Keep them for this migration. Lack of in-repository consumers does not reverse positive public-export evidence.
- **Warning: no unambiguous accidental public export has been established.** Do not remove supported parts merely because their directory says `_shared` or their name says Context/Provider/Wrapper. IconWrapper has real kits consumers; source schema/provider powers library assembly. Core README explicitly commits to chart helpers and Layout/Print APIs.
- **Nit: the four helper contracts deserve concise API documentation if supported long-term.** safeUrl returns a trimmed string or undefined; it rejects selected dangerous schemes, not all URLs beyond an HTTP allowlist. safeOpenUrl defaults to `_blank` and `noopener,noreferrer`, returns Window/null and allows feature overrides; openSourceInNewTab intentionally returns void. getFaviconUrl returns an empty string for invalid input and constructs a Google favicon URL. Do not change these contracts under the export-cleanup label.

## Exact keep/remove/decision table

| Surface | Decision | Evidence / implementation |
|---|---|---|
| Current 166 core values +194 types | Keep | Exact source/runtime/declaration name parity. Explicit component composition and theme/chart/layout contracts. |
| safeUrl, safeOpenUrl | Keep | Explicit legacy root exports under “Shared chat helpers”, preserved intentionally by explicit migrated export. |
| getFaviconUrl, openSourceInNewTab | Keep | Explicit legacy Sources exports and root Sources re-export. Preserve source custom-composition capability. |
| IconWrapper, CardSourceProvider/CardSourceSchema, source/context types | Keep | Supported composition and concrete kits consumers. No `/internal` replacement needed. |
| Chart helpers, legend APIs, Layout/Print APIs | Keep | Explicit production README support; parent instructions preserve these. |
| Kits react/chat and react/chat/libs | Keep | Source/declaration match; no internal core imports. |
| Generated style classes, ThemeContext/FormControlContext, unpublished geometry helpers | Private, unchanged | No new public root export leakage found. Closed exports map blocks supported deep access. |
| Proven unambiguous accidental internals to remove | **None** | Empty removal patch is the evidence-backed outcome; audit completion does not require an arbitrary deletion. |
| Four helpers if product owner explicitly wants a narrower breaking API | Separate future decision only | Ask “Should the new package deliberately drop these four previously public helpers?” only if removal is required. The approved parity-preserving migration can proceed without this question. |

## Recommendation / concrete patch

**No runtime/type export deletion patch.** Preserve the current allowlist through the rename and style conversion. Treat this audit as completed with no safe deletion, rather than blocking those workstreams awaiting speculative removals. The provided symbols.json is the exact pre-rename allowlist for verification. No production source patch is required or supplied.

The clean rename must change package identity and maintained imports without changing the exported names. Keep export maps root-only for core, and only `/react/chat` plus `/react/chat/libs` for kits. Do not add wildcards, `/internal`, or a compatibility alias.

## Changed-artifact validation plan (worker after rename/build)

1. Pack renamed components and kits normally into isolated consumer installation; use exact package hashes in lab evidence.
2. Re-run this symbol extraction with renamed package path and compare exact names/kinds to symbols.json. Compare both runtime ESM/CJS export lists and both declaration roots. Update package string only, not baseline API names.
3. Compile strict NodeNext `.mts` and `.cts` consumers importing every kept value/type and representative composition (Button refs/native props, Accordion parts, public chart data, theme overrides, source schema/provider); instantiate required prop/data types. Then native import/require both package entrypoints and kits library assembly. Do not infer SSR certification.
4. Probe renamed deep paths and old package name in the clean installation: unsupported paths must reject, old alias must be absent. Verify declaration references use only installed dependencies, package-relative private declarations, or supported public entries.
5. Re-run kits typecheck and affected behavior tests; retain existing known issues. Export audit itself needs no browser matrix because it proposes no runtime mutation; final integrated matrix still belongs to the combined migration.

Evidence: audit.cjs, boundaries.cjs, symbols.json, boundaries.json in this directory. All checks were static/lightweight with no build, browser or module style registration.
