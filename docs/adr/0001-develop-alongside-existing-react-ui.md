---
status: accepted
---

# Develop the new architecture alongside the existing React UI

Develop `react-ui-core` (including charts) and the initial chat kit alongside the existing `react-ui`, retaining the existing offering while the new architecture is tested through public betas. Deprecate the existing offering gradually after the new approach has been validated, rather than deleting it during extraction.

This supports incremental evaluation and migration, at the cost of temporarily maintaining parallel implementations. This records the user's agreed rollout direction; release channels, the comparison test setup, and deprecation criteria remain to be decided.

## Validation intent

Use the existing react-ui as the baseline for side-by-side validation of its extracted replacements. Core replaces reusable UI and charts at cutover; this is not a commitment to interchangeable old/new providers or arbitrary mixing within a component tree. Migration of the old package's chat and library capabilities must also be addressed before retiring the entire package. A cutoff date has not been set.

The earlier separate-chart-package boundary was revised by [ADR-0003](0003-keep-charts-in-react-ui-core.md); the parallel development and gradual migration decision remains unchanged.
