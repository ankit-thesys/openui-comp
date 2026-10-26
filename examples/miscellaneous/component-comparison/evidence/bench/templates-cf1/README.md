# Integrated template final matrix

All 12,450 current Default cells executed across four frozen runs. Strict aggregate verdict: Fail. Counts: 9,154 Pass, 86 Fail, 30 Review, 3,180 Known issue; zero missing or superseded cells. Source package candidate: cf1a8a88123b9a577c9cb43ae69d857ea6242f11, PR44.

reconciliation.json.gz contains every selected cell outcome, all layers, exact source runs and provenance. Four source-run JSON archives retain their original records. summary.json lists every nonpassing family and the representative raw evidence selection. Full local screenshots and measurements remain under the corresponding .bench-runs directories. This committed selection contains two nonpassing raw examples per case/verdict plus all 38 changed-verdict cells and the three specifically reported HorizontalBar cells; it does not claim to contain every local screenshot. Historical baseline evidence under ../final and the independent investigation under ../../horizontalbar are unchanged.

The 60 Select portal paint failures and 26 HorizontalBar failures remain nonpassing. Passing repeats do not resolve inherited instability. baseline-verdict-comparison.json records 38 changed strict verdicts across distinct frozen artifacts without automatic causal attribution. Existing Input/Label customization findings and incomplete theme/palette coverage remain separate limitations.

Reproduce reconciliation with node bench/reconcile.mjs followed by the four run IDs in matrix-plan.json. Never mix archives or relabel old runs. No SSR/hydration or new runtime-performance certification is claimed.
