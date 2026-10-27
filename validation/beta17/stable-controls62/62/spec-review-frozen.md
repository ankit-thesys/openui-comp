### Verdict
Approve controls-only source scope; independent runtime acceptance remains pending.

### Issues
No confirmed source defect or missing control-hook documentation found in clean frozen commit `659b495700998b5170e0eca4413a6cdae5a2d966` against accepted #61 `1c3833a045c4c66de92b69413a3824eca1798fcd`.

### Scope and contract
The exact diff contains README plus 17 registration files across the 15 assigned control families, including Hint and SliderBlock. Select, Calendar, DatePicker and Modal are absent from this frozen change; their previously reviewed WIP must not be attributed to the #62 archive or acceptance.

The registrations use the accepted nested stock-Goober mechanism: private zero-specificity html guard, stable component targets, existing component placement and public APIs. Existing styles, fallback values, state/part hierarchy and OptionCards container queries remain conserved. FormControl retains the accepted explicit shared border-box helper. These changes satisfy #56’s source requirement that stable selectors actually carry owned declarations rather than merely existing in the DOM.

README now documents each control styling root, intentional parts/states, wrapper-versus-control placement and className forwarding. Its examples match source ownership: Input’s focus box-shadow is owned by `:focus`; Checkbox checked background by its control descendant plus data-state; Toggle selected background by data-state. It accurately limits ordinary CSS overrides to owned stylesheet declarations while disclosing preserved vendor inline outline styling. No new promise to defeat inline styles is implied by #56’s later-CSS contract.

The conversion ledger moves all 15 controls, including FormControl’s remaining rules, into the pending-acceptance converted row; Buttons/TagBlock remain shared-base-only. Portal families remain deferred to #64. This resolves the previous documentation/ledger gap for the controls without claiming runtime acceptance or portal conversion.

### Runtime classification boundary
The reported initial failures concern preserved Radix inline outline and an assertion misreading comma-separated guarded selector branches. Source review finds no basis to demand a product change for those descriptions. Keep the original records and corrected classification; the reported 576 control, 66 state/part and 16 optimized passes are worker evidence, not independent verification by this reviewer.

Complete independent acceptance with exact archive/provenance binding, supported plain/Tailwind orders, themes, semantics, host negatives and production retention. No build, browser or production edits were performed for this review.
