# Line, Bar and Scatter source handoff

Next batch after5851f0624 (which requires prepared test12b839bad first). Worker1 already owns committed foundationcf0301e53 and prerequisiteequivalent. This batch changes only owned LineChart/, BarChart/ and ScatterChart/ family files/tests/styles. No shared/root/metadata changes.

Copied logic/props/types/parts remain unchanged. Attach stock Goober family root classes and shared emptyClass; convert owned declarations one-to-one through concrete shared declarations/keyframes, preserving selector specificity, negative bar animation origins, reduced-motion gates, SVG stroke/transition values, horizontal scrolling/category labels and all class hooks. Horizontal numeric-width box mismatch remains inherited. Scatter helper lower clamp remains inherited.

TDD red missing Line/Bar/Scatter exports retained; minimal extraction gives focused5/5 checks (Lineempty/update +condensed forwarding, Barempty/update +condensed/horizontal forwarding, Scatterinitialempty output). Build/strict source types/scoped semantic lint/format pass. Scratch built-root checks only; static markup test validates initial output, not SSR styling/hydration support. All real geometry/interaction/resizing/animation/print-export acceptance remains pending normally installed Chrome matrix. No chart geometry mocks or production patches.

Source-only public Goober emitted-CSS diagnostic confirms object serialization keeps scoped :where(... )::-webkit-scrollbar selectors intact, unlike the prior template-parser issue. Rawrules retained; actual browser pseudo behavior remains pending. No unnecessary fix/custompatch introduced.

Integration: original family barrels preserve LineChart/LineChartCondensed +types, BarChart/BarChartCondensed/HorizontalBarChart +types and ScatterChart +helpers. Original root additionally exports BarChartOrientation from BarChart/types and ScatterDataset/ScatterPoint from ScatterChart/types. Worker1 owns all exports and test discovery. Nested Charts/family/**tests** files require explicit inclusion. Preserve raw logs/JSON bytes with narrow formatter exclusions as needed.

No Chrome launched; Worker1 FIRST browser window reserved. Mini source batch follows; full normal installed checks/CI and PR management remain integration-owned. No legacy/previews/friend/crates edits or release/closure.
