# Combined #65 standards review

Verdict: approve within source/documentation scope. Combined browser acceptance remains separate.

Scope: HEAD `75f690418` against accepted #61 `1c3833a045c4c66de92b69413a3824eca1798fcd`, 74 files. Applied CONTRIBUTING.md, package authoring guidance and the full code-review smell baseline. Reviewed integration inventory, changed registration patterns, expanded README, representative complex/multi-part source diffs and a cross-file declaration comparison. Prior frozen W1/control source reviews apply to their unchanged integrated files. No browser/build operations or production edits performed.

## Hard documented violations

None found. Changes retain stock Goober module-scope tagged templates, accepted private zero-specificity guards and stable target strings. Existing class-map keys and exported strings remain usable by their consumers. Source declaration comparison found only expected relocation from individual class-map registrations into scoped target blocks; no unexplained declaration-value discrepancy surfaced. This is a source check, not a CSS parser or runtime proof.

README's canonical-target inventory covers the integrated controls, presentation/layout/help and portal batches. It updates authoring examples to the actual mechanism, keeps EditableTable and chart-owned selectors outside conversion, and expressly leaves new batches pending combined/independent acceptance. It records specificity/context requirements, Radix/vendor inline precedence, Calendar's Select dependency, successful-image-only SourceFaviconImage scope, and retained Sources important declarations. These limits avoid promising ordinary overrides where existing priority prevents them.

No dependency, tooling, runtime-library, legacy or chart-owned source edits appear. Public component props/rendering contracts remain outside the registration changes. Release/CI work remains user-deferred.

## Heuristic smells

No actionable findings. Canonical names remain deterministic and family-specific; redundant-looking words in some names are awkward but unambiguous and do not justify public selector churn. Repeated short registration guards follow the accepted stock-template contract. The wide edit surface reflects the explicit selector migration rather than unrelated shotgun surgery. Shared declaration fragments and existing map interfaces remain reused, without a new registration framework or speculative options.

No performance certification or independent runtime acceptance is claimed. Complex selector expansion, portal interactions and optimized-bundle retention remain the runtime reviewers' responsibility.
