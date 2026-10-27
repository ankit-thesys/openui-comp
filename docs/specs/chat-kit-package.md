## Problem Statement

Chat consumers currently install a single `@openuidev/kits` package with chat-specific import subpaths. That structure does not give each kit its own package identity, dependency contract, version, and release cycle. The project needs a clear home for independently publishable kits while shipping only the existing chat kit today. A dashboard kit is a future concern, not an implemented feature.

## Solution

Make the existing chat kit an independently publishable `@openuidev/chat-kit` package within the monorepo's kits grouping. Expose existing chat components at the package root and the existing AI library at `/libs`. Applications explicitly install the shared `@openuidev/react-components` peer. Preserve current component behavior, supported building blocks, library schemas, types, and theme integration. Migrate maintained consumers cleanly, without an old-package forwarding wrapper.

## User Stories

1. As an application developer, I want to install the chat kit by its own npm name, so that its purpose and dependency boundary are clear.
2. As an application developer, I want chat components available from the package root, so that I can use them without importing AI library assembly.
3. As an AI application developer, I want the existing library APIs available from `/libs`, so that I can keep using the established renderer and prompt flow.
4. As an existing consumer, I want the same component props, refs, callbacks, and types after updating imports, so that packaging migration does not require behavioral rewrites.
5. As an existing consumer, I want library registry entries and schema contracts preserved, so that saved responses continue to render.
6. As an application developer, I want to explicitly install a compatible React components package, so that the application controls its shared component version.
7. As a theme author, I want the chat kit and directly used React components to share provider context, so that themes apply consistently.
8. As an application developer, I want clear peer dependency requirements, so that unsupported combinations are visible during setup.
9. As a TypeScript consumer, I want root and library imports to resolve with strict typing, so that the public API remains usable without private imports.
10. As an ESM consumer, I want normal package imports to work from a packed installation, so that workspace aliases are unnecessary.
11. As a CommonJS consumer, I want the existing supported module contract preserved, so that the packaging move does not silently drop compatibility.
12. As a maintainer, I want chat to have its own version, so that a chat-only release does not require a React components release.
13. As a maintainer, I want changesets and release checks to discover nested kit packages, so that release tooling does not silently omit chat.
14. As a maintainer, I want native packing to produce valid publication metadata, so that consumers never receive unresolved workspace-only dependency references.
15. As a maintainer, I want existing examples and the comparison lab to use the new package, so that maintained consumers demonstrate the current installation path.
16. As a migrating developer, I want concise old-to-new import and installation guidance, so that the clean package switch is straightforward.
17. As a reviewer, I want historical validation artifacts to retain their original package identities and hashes, so that earlier results remain reproducible.
18. As a reviewer, I want packaging changes isolated from CSS and behavior changes, so that any regression has an identifiable cause.
19. As a maintainer, I want implementation internals to stay inaccessible, so that the packaging move does not expand the supported API accidentally.
20. As a future dashboard-kit maintainer, I want the kits grouping to support another independent package later, so that dashboard can follow the same structure without existing today.
21. As a consumer, I want chat installation to avoid requiring a dashboard package, so that future kit growth does not increase today's dependency scope.
22. As a reviewer, I want known old bugs and incomplete coverage disclosed separately, so that successful packaging checks are not presented as blanket component parity.
23. As a release owner, I want a reviewed draft PR without an actual publication, so that I retain control of merging and releasing.

## Implementation Decisions

- The kits grouping becomes an organizational parent for independent packages. The chat child is the only package created now; no empty dashboard package or publishable umbrella package remains.
- The chat package identity is `@openuidev/chat-kit`. Its public entrypoints are the package root and `@openuidev/chat-kit/libs`.
- Preserve the existing chat root values `FollowUpBlock`, `FollowUpItem`, and `ModelSwitcher`, their five public types, and the existing five library-entrypoint exports. Freeze the actual pre-migration export inventory and compare it after migration rather than adding newly public schemas or helpers.
- Preserve the current AI library registry, schema behavior, prompt assembly, actions, callbacks, and streaming behavior. This is a package-layout and identity change only.
- Use `@openuidev/react-components` as a required peer dependency and a development dependency for local build/test use. Do not bundle or copy its implementation into the chat kit. Validate one shared module/context instance in the supported consumer setup.
- Declare a peer range supported by tested versions. Do not claim compatibility with untested future beta versions. Follow the project's existing peer-window policy and record the selected range and tested artifact versions in validation evidence.
- Keep other dependency and peer contracts unchanged unless a change is mechanically required by the package move and documented.
- Give chat its own package version and Changesets release lifecycle, with no new fixed or linked version group coupling it to React components or a future dashboard kit.
- Register nested kit packages with workspace discovery. Update the peer-window/release package discovery that currently scans only immediate package children; prefer the existing workspace/package discovery mechanism over a separate hard-coded chat-only exception.
- Adapt the chat package's build, TypeScript, publication-file, module, and declaration configuration for its new package root. Preserve ESM/CJS support and existing build conventions.
- Migrate maintained source consumers, examples, lab setup, dependency manifests, lockfile, build filters where needed, and current documentation to the new package and entrypoints.
- Remove the old `@openuidev/kits` package registration and active import usage. Do not retain an alias, forwarding package, or transitional wrapper.
- Retain historical reports, immutable manifests, artifact hashes, and recorded old imports as historical evidence; distinguish these from active maintained consumer references.
- Update the project glossary so Chat kit identifies the new package, while React components remains the shared reusable foundation.
- Preserve existing export restrictions. Do not introduce an internal subpath or new deep-import contract.
- Begin integration after the current frozen rename/template validation is preserved. Use a separately reviewable draft PR based on the validated production stack; keep validation/lab evidence in the lab PR rather than production package contents.

## Testing Decisions

- Primary seam: an ordinary clean application consuming natively packed chat and React components archives through their public entrypoints. This reuses the existing packed-consumer validation used for the React components rename; no new production testing API is needed.
- Good tests assert externally observable contracts: successful public imports, strict usable types, unchanged rendering/actions, shared theme behavior, correct installation metadata, and rejected unsupported imports. Avoid assertions tied solely to source spelling or folder layout.
- Verify native ESM and CommonJS root and library imports, strict declaration consumption, and equality with the frozen public value/type inventory. Exercise the existing chat registry inventory and saved real renderer inputs.
- Exercise chat components and the actual AI library through the existing isolated consumer/browser fixtures, including streaming, an action callback, and a shared custom ThemeProvider with direct React components and kit-rendered content. Assert shared context behavior, not merely matching default colors.
- Verify the packed manifest has the intended required React components peer, usable version range, and no unresolved workspace-only publication references. Check the dependency graph and bundle provenance for unintended bundled or duplicate core implementations.
- Verify unsupported private/deep paths and the removed old package identity do not resolve in a clean new consumer.
- Reuse existing component-only versus library bundle probes to ensure the package move does not introduce new eager library/runtime imports. Retain the accepted KaTeX emitted-asset caveat; distinguish emitted assets from browser downloads.
- Exercise workspace/release discovery and peer-window validation in a nonpublishing mode. Prove the nested chat package is discovered, its independent version is honored, and a chat-only release plan does not force an unrelated core release when the peer contract is unchanged.
- Run package checks and affected maintained-consumer builds after migration. Validate the lab against the new packed artifacts without rewriting prior run records.
- Preserve source correspondence as supporting evidence; it does not replace normal packed-consumer tests. Rerun only checks affected by this packaging change; do not repeat an unchanged exhaustive visual matrix merely because paths moved.
- Capture exact source commits, archive identities, versions, commands, and pass/fail/not-covered results. Known inherited bugs, existing Input/Label findings, and theme/palette gaps remain separate from packaging acceptance.
- Verify CI on the exact PR head. No npm publication, release trigger, merge, or issue closure is part of test execution.

## Out of Scope

- Implementing or publishing a dashboard kit, dashboard schema, or dashboard application shell.
- A complete chat shell, AgentInterface, deferred standalone helpers, or new public APIs.
- Changing component styles, selector specificity, behavior, performance criteria, or fixing inherited defects as part of the package move.
- Removing supported public exports, renaming the repository, adding a compatibility wrapper, or introducing an internal import escape hatch.
- Rewriting historical validation evidence, repeating unaffected full matrices, or claiming SSR/general accessibility certification.
- Actual publishing, merging, upstream/main writes, npm deprecation, or release automation execution.

## Further Notes

- This spec records the completed user design interview: separate packages; chat now/dashboard later; shared React components; selected chat package name; root plus `/libs`; clean migration; independent versions; explicit core peer; unchanged public API.
- Existing prior art: chat-kit delivery issue #16 and the validated production rename/template stack. This is a new packaging follow-up, not a replacement for the earlier component migration evidence.
- The user confirmed the packed-import/type/shared-theme/release-configuration validation boundary with the final design confirmation.
- Future dashboard work can adopt the independent-package pattern in a separate spec; this issue does not reserve or publish an npm name for it.
