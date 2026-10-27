# Chart extension source standards review

Verdict: approve within interim source scope; documentation and runtime acceptance remain pending.

Reviewed chart worktree against `75f690418`, including committed AreaChart/shared work and remaining uncommitted family styles: 19 style files, 25 original CSS registration sites. Applied existing contribution/package authoring standards and the code-review smell baseline. Inspected family/shared diffs and supplied inventories; compared declaration multisets across every changed file and exact pre-existing keyframe template bodies. No browser/build operations or production edits performed.

## Hard documented violations

No implementation violations found. Every conversion retains stock module-scope Goober tagged templates and the accepted private zero-specificity document guard. Canonical root/part strings replace generated class attachments while preserving exported symbol names and existing call sites. Shared chart declarations, typography and animations remain reused.

The declaration comparison produced no discrepancies; existing keyframe bodies in changed files were unchanged. Scope is confined to style registrations. Chart scales, simulation/physics, geometry, event handling, per-instance inline values, public props, data types, dependencies and tooling are untouched. This source comparison does not prove CSSOM equivalence or animation behavior in the browser.

CONTRIBUTING.md requires documentation for public behavior changes. README intentionally remains for later integration; complete the chart target inventory, override context and existing inline-style/portal limits before final acceptance. This is outstanding planned documentation, not an unexplained source violation. User-deferred release/CI work is not flagged.

## Heuristic smells

No actionable findings. Family-specific target names and shared-chart prefixes identify ownership and avoid ambiguous global utility names. The registration guards repeat a deliberate stock-Goober call-site contract; extracting a custom framework would introduce an unnecessary styling API. Multi-part registrations retain their existing module responsibilities and exported interfaces. The many files reflect the explicit chart-extension scope, without unrelated changes or speculative options.

Runtime validation must cover actual generated selectors, compound/commaseparated states, optimized retention, animation/reduced-motion paths and shared tooltip/legend behavior. This review provides neither independent runtime acceptance nor performance certification.
