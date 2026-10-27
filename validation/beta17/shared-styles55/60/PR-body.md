## Summary

Automatically register canonical light-theme tokens on the document root and share border-box only across Buttons, FormControl and TagBlock roots. Public imports still need no CSS import, provider or setup command.

```text
src/styles/
├── defaults.ts  canonical light tokens in the lowest-priority layer
└── base.ts      border-box class for the three existing roots
```

Component fallbacks are intentionally retained: clearing a token with `initial` must preserve the component's existing default. Broad deletion in #58 is deferred by user decision.

Stacked on unchanged #42 (`d12927150`). Related: #55, #57, #58, #59, #60.

## Evidence

- **Before:** three repeated root declarations; provider-free token literals lived in local fallbacks.
  **After:** automatic canonical root defaults plus one shared root rule, with all 1,444 fallback expressions preserved.
- **453/453** fresh combined browser checks pass against #42: plain CSS/Tailwind v3/v4, stylesheet orders, root/container overrides, cleared tokens, host negatives/globals, themes, four portal types, and affected interaction states.
- **39/39** optimized build-origin checks pass; package build/typecheck, strict consumer types and native ESM/CJS 166 exports pass.
- [Frozen combined report and exact provenance](https://github.com/ankit-thesys/openui-comp/blob/4f24c2938dcdb1f3dbddf0cc669277cec21e4e6e/validation/beta17/shared-styles55/60/REPORT.md) · [Durable raw evidence and archives in lab PR #41](https://github.com/ankit-thesys/openui-comp/tree/4f24c2938dcdb1f3dbddf0cc669277cec21e4e6e/validation/beta17/shared-styles55).

Source: `c1aaf994d`. This remains a draft pending independent #60 acceptance. No stable-selector migration is included.

## Merge Danger

**Door:** two-way

Small additive-package change; reverting restores the prior styling implementation.

**Blast Radius:** Components

Root custom-property inheritance and three component roots are affected. Legacy packages, kits and release/CI tooling are unchanged. SSR, performance and historical full-matrix readiness are outside this gate.
