### Verdict
Conditionally consistent with #56’s public customization contract; root should explicitly accept the scope-guard interpretation before the pilot is called accepted.

### Scope guard versus styling target
MECHANISM.md’s `:where(&:root) .openui-button-base` keeps a generated class solely on html. That class gates registration and contributes zero specificity. The actual component target and its owned root/variant/state hierarchy are stable `openui-*` selectors; the component no longer carries the generated styling class. Consumers can address the target using ordinary stable selectors without knowing the guard. This is materially different from retaining generated component ownership and merely adding unused hooks, which #56 explicitly prohibits.

On that interpretation, the proposal meets #56’s functional intent: “library rules to use the public stable selectors” and later consumer base overrides without important, while preserving stock Goober and automatic setup. The accepted #57 mechanism is relevant precedent for automatic root setup, but #60’s PASS explicitly does not pre-accept the #61 mechanism.

### Material ambiguity for root review
#56 also literally says “replace Goober-generated styling selectors with stable openui-* selectors.” The emitted selector still contains a generated html guard, so claiming literally generation-free or unconditional global CSS would be inaccurate. Root should record that generated zero-specificity document scope is permitted while all converted owned component targets must be stable. This clarifies an implementation boundary; it must not permit generated component/part classes to retain owned declarations unnoticed.

The proposed `openui-border-box` helper converts #59’s private generated opt-in class into an explicit stable opt-in class. Its intended targets remain the same three roots. This is a necessary shared-rule ownership decision before those families count as converted, as corrected preparation requires. Preserve the declaration, specificity and order behavior; do not broaden it into rules on every pre-existing stable root hook. No need to convert those entire families in #61.

### Required gate evidence
Ticket05 still requires observable root/variant/state customization, default appearance, interaction/accessibility, production retention and converted/deferred inventory. Verify actual emitted matching/selectivity, same-instance host globals, both component import orders, normal later base overrides, matching variant/state overrides and all applicable themes. Preserve all fallbacks and chart files; check indirect chart controls. Document IconButton’s existing icon span and Button’s direct children without invented part hooks.

No source, build or browser acceptance is asserted. Proposal review only; source may be changing concurrently. Accepted baseline is #60 `c1aaf994d5c0fbfb56b83685221eeea9b409e57c`, not PR42 or #59.
