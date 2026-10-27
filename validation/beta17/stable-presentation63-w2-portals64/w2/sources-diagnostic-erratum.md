# Sources diagnostic correction — source/evidence only

The later paired diagnostic used `.openui-sources-container` as an ancestor. That class is not present in the component source or fixture, so its failed override does **not** prove the result of a stronger matching selector. Preserve the raw failed rows as an invalid diagnostic, not a passing correction or additional precedence measurement.

The original simple-class probes target the actual Carousel item: candidate `.openui-carousel-item-styled`, baseline generated `.go1936111126` (diagnostic only). Both record the requested background `rgb(2, 3, 4)` remaining `rgba(0, 0, 0, 0)`. The same target's recorded classes and emitted rules show the retained Sources `background-color: transparent !important` declaration. This remains the measured basis for the pre-existing limitation.

For final verification, use the actual same-element classes and assert `element.matches(selector)` and target count before measuring:

- Candidate target: `.openui-carousel-item-styled.openui-sources-listed-sources-container`.
- Baseline legacy target: `.openui-carousel-item.openui-listed-sources-item-container`.

This matching contextual probe has **not** been run. The expected ordinary-versus-important cascade outcome is an inference from the matching declaration, not a new browser result. No new result count, product change or stronger-selector test is claimed.

No browser, build, install or server was started for this correction. W1 retains the runtime window. The original `override-dispositions.json`, runner and failed result files remain unchanged. Earlier reviews preceded this verifier finding; this erratum qualifies their evidence-fairness conclusion.
