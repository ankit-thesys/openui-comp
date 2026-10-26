# Production package TL review — design interview

Status: user-confirmed implementation plan, gated on completion and preservation
of the current bench/verifier baseline. Audit and implementation are not yet complete.

## Confirmed decisions

- Rename `packages/react-ui-core` to `packages/react-components` and the npm/import
  name to `@openuidev/react-components`. Keep the GitHub monorepo name unchanged.
- Standardize authored component styles in both react-components and kits on stock
  Goober template strings. Allow small, documented exceptions justified by actual
  dynamic requirements and parity evidence.
- Keep supported consumer building blocks and their required public types. Audit
  implementation helpers, style definitions and internal hooks for removal using
  consumer evidence, not names alone. Existing composition components remain
  candidates for public support, not automatic removal targets.
- Clean beta rename with a migration note; no old-name compatibility alias. Update
  kits and maintained consumers, while retaining historical artifact identities.
- For implementation helpers used by kits, prefer supported public component APIs.
  Do not introduce an `/internal` escape hatch by default. Bring unavoidable
  cross-package cases back for a specific decision before changing that boundary.
- Finish and preserve the current bench/verifier baseline before production
  refactoring. Make rename, style standardization and export cleanup separately
  reviewable, with relevant validation after each stage.
- User confirmed execution of this staged plan after the baseline. The concrete
  evidence-backed export disposition inventory remains implementation work.
  Baseline preservation does not turn known or unresolved failures into passes.

## Proposed execution and gates

1. Preserve baseline commits, package artifacts, case definitions and classified
   bench/verifier results. Resolve harness defects; keep inherited bugs and any
   unresolved production differences explicit. Do not erase old names from evidence.
2. Rename folder/npm identity and update current maintained consumers, workspace
   dependencies, exports metadata, build configuration and documentation. Verify
   packed native ESM/CJS imports, strict consumer types and kits integration. No
   repository rename, alias package, merge or publishing.
3. Audit all authored styles, map legacy declarations and convert objects to stock
   Goober template strings. Preserve selectors/specificity, token fallbacks,
   registration timing/order, keyframes, responsive rules and public props. Record
   justified dynamic exceptions. Keep any verifier-approved important cleanup
   separately identifiable rather than mixing behavioral changes into conversion.
4. Create an export disposition inventory covering root barrels, subpaths and
   declarations: symbol, intended consumer role, actual consumers, keep/remove
   rationale, replacement and verification. Protect documented composition APIs,
   associated types and context APIs unless explicitly reconsidered. Do not hide
   an export at the root while leaving it reachable through an unintended subpath.
   Ensure public declarations do not strand required types. Consult the user on
   unavoidable boundary exceptions or ambiguous supported API removals.
5. Validate changed artifacts through affected parity checks, custom-theme wiring,
   host CSS/injection-order cases and supported consumer overrides. Test that kept
   imports compile/run and removed public imports/subpaths are unavailable. Re-run
   the integrated approved matrix for the final candidate; report coverage and
   known issues precisely. Keep production PRs clean and validation evidence in
   the lab/validation PR, attach each PR and check CI. No automatic merges.

## Requested outcomes

- Rename the migrated core folder to `react-components`; clarify whether the npm
  package and GitHub repository names also change before executing a rename.
- Thoroughly audit style definitions and establish a readable common pattern,
  preferably Goober template strings if behavior and supported APIs permit it.
- Audit the public export surface with particular attention to implementation
  internals. Assess consumer dependencies and public composition contracts before
  removing exports.

## Decision tree

1. Naming scope: package folder, npm/import name, GitHub repository.
   - After scope: consumer migration, compatibility policy, PR placement.
2. Style convention: scope across core and kits, template strings and justified
   dynamic exceptions.
   - After scope: mixins/interpolation, typing, registration timing, representative
     pilot and full parity gates. Syntax conversion must not silently change
     fallbacks, selectors, specificity, keyframes or injection behavior.
3. Public API policy: supported building blocks versus implementation internals.
   - After policy: export inventory, consumer graph, proposed keep/remove table,
     subpath/type accessibility, compatibility and packed-consumer checks.

## Existing work boundaries

Bench and verifier work continue on their frozen inputs. Do not rename packages,
convert production styles or remove exports during this interview. Keep current
artifacts and evidence reproducible. No repository rename, publication, merge or
upstream write is implied by a package-folder rename. Record decisions as the
interview resolves them; create an ADR only for settled substantive tradeoffs.
