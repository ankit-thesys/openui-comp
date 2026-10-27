### Verdict
Approve revised source scope; #61 acceptance remains pending completed validation and coverage inventory.

### Issues
No confirmed implementation defect or scope creep found in the final source `1c3833a045c4c66de92b69413a3824eca1798fcd` against accepted #60 `c1aaf994d5c0fbfb56b83685221eeea9b409e57c`.

### Contract assessment
- `Button.tsx:6–18` and `IconButton.tsx:7–19` use nested stock `css`: a zero-specificity generated html guard contains the stable component target. The corresponding generated class is removed from each component root. Under root’s explicitly accepted interpretation, this fulfills #56’s “replace Goober-generated styling selectors with stable openui-* selectors,” rather than merely adding unused hooks. Emitted specificity and consumer overrides remain runtime gates.
- Existing style strings remain unchanged, including token fallbacks and root/variant/size/state/part declarations. Existing aliases are preserved; new dedicated root hooks own styling and avoid making old-hook-only host elements acquire library styles. No component semantics or chart selector files change. This matches “preserve supported component props, exports and behavior” and scoped global targets.
- `styles/base.ts:3–16` replaces the private generated shared-rule class with a stable explicit opt-in helper on the same three existing consumers. It retains root-only border-box applicability, rather than resetting all legacy hooks. This resolves shared owned-rule targeting without claiming Buttons/FormControl/TagBlock fully migrated.
- README accurately discloses the private guard and stable targets, variant/state specificity, later unlayered CSS boundary, retained aliases and partial shared-base status. Matching override examples correspond to actual style ownership. It does not claim generation-free CSS or that a base selector defeats every variant/state/order.

### Final documentation and remaining acceptance
README now supplies the 65-family inventory: two converted pilot families, three shared-box-sizing-only families, and 60 pending families assigned to #62/#63/#64. It documents narrowed complex/vendor/inline exceptions without declaring whole eligible areas exempt. The separate conversion-ledger.json contains the same 65 statuses and observed baseline hooks, bound to accepted #60; its historical observed locations are inventory evidence, not final-source line references. This resolves the earlier missing-inventory concern under ticket05 and #56’s “converted-versus-deferred inventory” requirement.

README correctly permits bundlers to register retained components together from a shared lazy chunk; #56 does not guarantee separate network/style chunks per component. The two strict lazy-first failures nevertheless need the pending matched-baseline characterization and explicit classification; documentation alone cannot establish harmlessness.

Reported 480 main, 36 CSSOM and 180 dependency passes remain worker evidence. Production-import results are currently 70/72, with no independent acceptance yet. Complete provenance, failure classification and the independent gate before accepting #61. No build/browser commands or production edits were performed for this review.
