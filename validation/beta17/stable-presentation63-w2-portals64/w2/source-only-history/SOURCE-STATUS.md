# Worker2 #63/#64 source handoff status

Base accepted61: 1c3833a045c4c66de92b69413a3824eca1798fcd.
Worktree /private/tmp/openui-selectors-w2; branch codex/stable-selectors-63-64.
Current source candidates cover40/41presentation/layoutfamilies plusW2's3portal
families. EditableTable is explicitly deferred, not counted converted. Vendor
inline themes, floating coordinates, keyframe IDs and loader inline opacity are
specific limits; simpleownedstyles are not skipped. Exactsharedcardlayout file
only is included, centralregistration/sharedbase/README/controls/charts are untouched.

52files,178ownedclassrules,594existingfallbackexpressions preserved. Original
body texts are bound to61; source checks compare bodies after formatter whitespace
normalization, class-map wiring, uniqueness, parse diagnostics and fallback spans.
These are static checks, not proof of emitted CSS or tree shaking. Existingaliases,
TextContent text-content* names andfavicon image/fallback behavior are preserved.
No production helper/parser/registry/newtooling added: one-time/tmp ASTsourceedit
scripts are evidence only. Source editing initially caught a duplicate canonical
image-part name before acceptance; the owned partial scratch change was restored
and corrected; no runtime result was claimed for that edit attempt.

Reviewed/committed A-D batches:
cc42ed753 smallpresentation roots
 a15adf384 variants/parts
 e5b3babc1 ownedrichtext
 1d1718f45 image/text/lists
E-H+portal+sharedlayout source reviews complete with no actionable findings.
All source batches committed; branch clean. Final source c427df6c4d84d8ff48005aed2b3d02667498e1cb; package tree 9411b6d9ed92f79de292e43da53eac8d7bb086db.
Runtime/build/type/packed checks NOT RUN: W1 owns first exclusive window. Worker2
is ready for the next assigned window once source reviews/commits finish. Do not
integrate as accepted or updatecoverage to runtimePASS before that verification.

Coverage ledger: coverage-ledger.json; proposed hooks: HOOKS-DRAFT.md.
Static bindings+exactbody ledger: static-bindings.json andconversion-ledger.json.
Docs/coverage entries remain outsideproduction forW1singlewriter integration.

Full source commit sequence:

```text
cc42ed7538209bb9933e1bb62387a303c2b4aab7 Use stable styling targets for small presentation roots (#63)
a15adf38478b51c64f5226ce1bdbad6db1cdd760 Use stable selectors for presentation variants and parts (#63)
e5b3babc1516824ef810e4240359ee160307358f Expose stable targets for owned rich-text styles (#63)
1d1718f454e9215e58a4c41444997cb8a864b7f0 Use stable selectors for image text and list layouts (#63)
77caf9325a7749f0bd6cf529adca7ad00be4ee7e Use stable selectors for containers and shared-base roots (#63)
760f51ed2b42dd8035a4f816ba6e187490d40a71 Expose stable owned loader and skeleton styling targets (#63)
d16f326179b7c46156b588ffce25705e1c5b5929 Use stable selectors for composed cards and sources (#63)
68026947919e4c2c4c554a0020416806fbd59313 Use stable selectors for interactive layouts and tables (#63)
c427df6c4d84d8ff48005aed2b3d02667498e1cb Use stable owned tooltip citation and gallery selectors (#64)
```

## Verifier correction after c427df6

Concrete finding: Carousel buttonClass reused legacy openui-carousel-button hidden
in a combined JSX class string, risking style on alias-only host markup. Previous
source reviews missed this issue; their no-findings result is not acceptance proof.
Corrected canonical target/export to openui-carousel-button-styled; owned controls
still receive buttonClass plus unchanged legacy aliases. 178canonical targets were
compared to the baseline observed-hook inventory; only this collision was found,
and the corrected audit has zero. Body/fallback checks remain178rules/594fallbacks.
Runtime hostnegative checks and emitted CSS remain pending. Two-line fix review
requested; no browser/build whileW1windowactive.

Corrected clean source commit72699259c54c13ff806739f13c3d7bfa5f95e95f; package tree2338dd52875137fc237a065e13c4e0bb4f930bde. Both fixreviews clear. c427df6 history retained, not reset. Runtime pending W1 release.
