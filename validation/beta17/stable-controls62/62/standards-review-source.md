# #62 + W1 #64 source standards review

Verdict: approve with documentation nit for current source scope; no runtime acceptance implied.

Reviewed uncommitted `git diff 1c3833a045c4c66de92b69413a3824eca1798fcd`, including whitespace-insensitive inspection of the three expanded style modules, existing Select consumers in Calendar, repository contribution/package authoring standards and the code-review skill's complete smell baseline.

## Documented requirements

- **Minor documentation gap:** `packages/react-components/README.md:97–98` says families outside the pilot/control batch still use generated selectors, while this diff also converts Calendar, DatePicker's floating renderer, Modal and Select. Line 188 lists all seven portal families uniformly as deferred, without recording the four in-progress conversions. CONTRIBUTING.md requires documentation updates for changed public behavior. Before accepting the combined batch, distinguish W1's converted-but-unaccepted source from the three untouched portal families and enumerate W1's stable targets. This is documentation reconciliation, not a runtime failure.

No other documented source violations found. Registrations retain stock module-scope Goober tagged templates and the accepted private zero-specificity document guard. The whitespace-insensitive style diff preserves declarations, ordering, fallback values, keyframes and nested states/parts. Component changes replace registration targets without editing props, refs, children, native attributes or existing aliases. Select continues exporting the class-string symbols imported by Calendar; those imports remain valid. No dependency, tooling, library, chart or legacy edits appear.

## Heuristic smells

No actionable findings. Repeated small registration/guard blocks follow the accepted module-local stock-Goober contract; extracting a custom registration framework would add an unneeded styling API. Expanded Modal/Select modules still change for the single reason of selector ownership. Stable strings are appropriate CSS identifiers, not evidence of primitive obsession. Existing declaration fragments and token sources remain reused.

Runtime control/portal validation belongs to the root-owned reruns. No build/browser checks were run here; source review alone cannot establish acceptance. User-deferred release/CI work is not flagged.
