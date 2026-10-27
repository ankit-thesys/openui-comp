# Rename execution checklist

Planning only. Baseline gate must complete before production changes. Source snapshot
`ed4ada6cb56e6c25a37a15c576200e87c6fd09a7`; clean production reference
`57ea72e2892df7fdd551c668d4480a0267f90a09`. No files below have been renamed.

## Scope and evidence

The tracked-text inventory finds **185 reference-bearing files**, after
excluding frozen validation, results and evidence directories. This includes active
tests and documents needing manual historical review; it is not a claim that every
matching line should be replaced. The machine inventory records exact lines.

| Group | Files | Treatment |
| --- | ---: | --- |
| production-import | 61 | Update package import identity; preserve imported symbols and behavior. |
| package-metadata-or-current-doc | 7 | Move core folder; update npm name, repository.directory, current usage docs and kits dependency. |
| workspace-lock | 1 | Rename importer, kits dependency key and link target only; no unrelated dependency refresh. |
| ci | 1 | Update the core Playwright package selector in the maintained workflow. |
| active-test-review | 87 | Update current harness/consumer imports and paths; preserve embedded old-run provenance. |
| maintained-lab-consumer-preserve-frozen-inputs | 10 | Prepare a new candidate artifact configuration; never rewrite prior archives/runtime/evidence. |
| documentation-manual-history-review | 18 | Update unreleased changeset frontmatter/current guidance; retain old identities in historical narratives. |

## Concrete edit order

1. Create an isolated production branch from the approved post-verifier candidate,
   not the lab history. Record its commit and packed-artifact identities.
2. Move `packages/react-ui-core` to `packages/react-components`. Rename npm to
   `@openuidev/react-components`; preserve version, root-only exports, ESM/CJS and
   declaration layout. Update `repository.directory`. No alias package/export.
3. Update kits' workspace dependency and its61 production import-bearing source
   files. This includes ModelSwitcher and library adapters, including helpers and
   public types; no `/internal` path or copied implementation.
4. Update pnpm importer key, kits dependency key and relative link target using
   workspace tooling. Confirm dependency versions/integrities do not change.
   `pnpm-workspace.yaml` already covers packages through globs; do not rewrite it
   merely to manufacture a rename diff.
5. Update the7 unreleased core changeset package keys. Preserve previously recorded
   source/artifact identities in history, diagnostics, baseline exports and specs
   that describe the previous package. Update current docs with a migration note.
6. Update active package tests and the maintained workflow package selector. Any
   test fixture that quotes an old artifact/commit keeps that provenance and gets
   a separate new candidate fixture rather than a search/replace.
7. In the lab, update current candidate imports, setup-artifact package list,
   package manifest/lock and preview labels intentionally. Preserve original
   `.artifacts/`, frozen `.bench-runs/*/runtime`, run JSON and hashes. Build fresh
   candidate artifacts alongside the baseline using existing tooling.

## Stage-specific checks (run only after runtime release)

- Packed native ESM and CJS root imports for core and both kits entries; strict
  TypeScript consumers in both module modes. Required public types still resolve.
- Old npm identity absent from new metadata/dependencies; importing the old name
  fails in a clean consumer that installs only the candidate. No accidental alias.
- Root-only resolution retained: unsupported component/internal subpaths fail.
- Kits retains101 distinct core-symbol imports (98 runtime,3 explicit public
  types in this source snapshot). Library assembly remains separate from components.
- New core/kits package builds, public package checks, relevant import/bundle
  pruning and representative actual component/form/chart/theme checks pass.
- Review diff against baseline for identity-only changes. Rename is not permission
  to change styles, exports, peer versions, old react-ui or runtime behavior.

## Maintained metadata / consumer files

- [.github/workflows/build-js.yml](../../../.github/workflows/build-js.yml) — ci.
- [examples/miscellaneous/component-comparison/README.md](../../../examples/miscellaneous/component-comparison/README.md) — maintained-lab-consumer-preserve-frozen-inputs.
- [examples/miscellaneous/component-comparison/package-lock.json](../../../examples/miscellaneous/component-comparison/package-lock.json) — maintained-lab-consumer-preserve-frozen-inputs.
- [examples/miscellaneous/component-comparison/package.json](../../../examples/miscellaneous/component-comparison/package.json) — maintained-lab-consumer-preserve-frozen-inputs.
- [examples/miscellaneous/component-comparison/scripts/setup-artifacts.mjs](../../../examples/miscellaneous/component-comparison/scripts/setup-artifacts.mjs) — maintained-lab-consumer-preserve-frozen-inputs.
- [examples/miscellaneous/component-comparison/src/frame.tsx](../../../examples/miscellaneous/component-comparison/src/frame.tsx) — maintained-lab-consumer-preserve-frozen-inputs.
- [examples/miscellaneous/component-comparison/src/main.tsx](../../../examples/miscellaneous/component-comparison/src/main.tsx) — maintained-lab-consumer-preserve-frozen-inputs.
- [examples/miscellaneous/component-comparison/src/migrated.tsx](../../../examples/miscellaneous/component-comparison/src/migrated.tsx) — maintained-lab-consumer-preserve-frozen-inputs.
- [examples/miscellaneous/component-comparison/tests/bench-contract.test.mjs](../../../examples/miscellaneous/component-comparison/tests/bench-contract.test.mjs) — maintained-lab-consumer-preserve-frozen-inputs.
- [examples/miscellaneous/component-comparison/tests/bench-themes.browser.mjs](../../../examples/miscellaneous/component-comparison/tests/bench-themes.browser.mjs) — maintained-lab-consumer-preserve-frozen-inputs.
- [examples/miscellaneous/component-comparison/tests/setup.test.mjs](../../../examples/miscellaneous/component-comparison/tests/setup.test.mjs) — maintained-lab-consumer-preserve-frozen-inputs.
- [packages/kits/README.md](../../../packages/kits/README.md) — package-metadata-or-current-doc.
- [packages/kits/package.json](../../../packages/kits/package.json) — package-metadata-or-current-doc.
- [packages/react-ui-core/FORM_CONTROLS.md](../../../packages/react-ui-core/FORM_CONTROLS.md) — package-metadata-or-current-doc.
- [packages/react-ui-core/IMPLEMENTATION.md](../../../packages/react-ui-core/IMPLEMENTATION.md) — package-metadata-or-current-doc.
- [packages/react-ui-core/LAYOUT.md](../../../packages/react-ui-core/LAYOUT.md) — package-metadata-or-current-doc.
- [packages/react-ui-core/README.md](../../../packages/react-ui-core/README.md) — package-metadata-or-current-doc.
- [packages/react-ui-core/package.json](../../../packages/react-ui-core/package.json) — package-metadata-or-current-doc.
- [pnpm-lock.yaml](../../../pnpm-lock.yaml) — workspace-lock.

The exhaustive line inventory is [rename-inventory.json](rename-inventory.json).
