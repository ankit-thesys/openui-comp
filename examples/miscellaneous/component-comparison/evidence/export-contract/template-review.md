# Template conversion: independent public API / registration review

## Consumer usage

```tsx
// Happy path: unchanged by this syntax-only stage
import { Button } from '@openuidev/react-ui-core';
const primary = <Button type="submit">Send</Button>;

// Common customization remains public
const custom = <Button className="brand-button" style={{ minWidth: 120 }}>Send</Button>;

// Composition and types remain unchanged
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent,
  type AccordionProps } from '@openuidev/react-ui-core';
```

Package rename is a separate stage; this reviewed commit still uses the old package name.

## Bounded verdict

**PASS for static public-contract preservation and registration topology; no actionable finding in this review scope.** Reviewed exact commit `75e95dc664bc4ddfa58112a07e58ac7c850d2bee` against `57ea72e2892df7fdd551c668d4480a0267f90a09`, read-only checkout `/private/tmp/openui-template-standardization`.

- All **105 changed source files** inspected by a TypeScript AST comparison. The 33 changed TSX files become byte-for-byte baseline-identical when the sole change `css(fragment)` → tagged `css` interpolating the same fragment is normalized. Their public props/types, refs, render bodies, defaults and error behavior are unchanged.
- TypeScript symbol checks independently confirm exact baseline names/kinds: core **166 values +194 types**, kits chat **3 values +5 types**, kits libraries **5 values**. Public barrels, package export maps, dependencies, peer dependencies, package sideEffects flags, tsdown configuration and tsconfigs have no diff.
- **180 css/keyframes registration sites** across changed files before and after. Per-file ordered registration-name sequence and function/module scope are identical. No registration moves into rendering or new global registration aggregator. Runtime import-specifier sequences are identical in every changed source file; removed CSSAttribute imports are type-only.
- Shared declarations become private plain string fragments; class registration remains in the same importing module. These private inferred style-object→string types are not root exports. No public styling API has been introduced.
- Both READMEs describe stock tagged-template authoring and the existing exceptions. They do not require new consumer setup or claim SSR support.

## Issues (ranked by severity)

- **Critical:** None found within this static scope.
- **Warning:** No measured bundle-size or final tree-shaking verdict is provided. Same module/import graph, sideEffects flags and unbundled build topology preserve the existing structural opportunity to remove unused components; they do not prove emitted bytes or retained module sets identical. Template strings may change parsed representation, hashes and byte size. Do not market this conversion as a bundle optimization without measurements.
- **Nit:** None requiring a patch.

## Recommendation

Proceed with integration after the separate CSS-equivalence reviewer clears semantic findings. Keep registration sites and public exports unchanged. Preserve the six approved important removals when resolving the two overlapping style files; this commit was prepared against the earlier baseline and does not itself include that separate cleanup.

The final changed-artifact checks should compare ESM/CJS public declarations and exports, then reuse the existing Button-only and chart/kit consumer bundle probes to confirm unused modules/vendor assets remain excluded. Do not add an exhaustive new benchmark for this static review. Generated class/keyframe hashes may legitimately change; never normalize actual computed-style or interaction differences merely because syntax changed.

Evidence: `template-static.cjs`, `template-static.json`, `template-api.cjs`, `template-api.json` in this directory. No browser, build, heavy tests or production edits were performed. CSS declaration equivalence, specificity/cascade results and runtime rendered parity are intentionally outside this second review and remain the other verifier's responsibility.
