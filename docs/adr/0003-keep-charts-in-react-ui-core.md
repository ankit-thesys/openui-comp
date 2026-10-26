---
status: accepted
---

# Keep charts in react-ui-core

The user revised the extraction boundary: the complete existing chart set and supporting chart code belong in react-ui-core alongside the 65 approved reusable UI families. Do not create a separate react-visualization package for this milestone. Kits consume both reusable UI and charts from core.

This supersedes the earlier separate-visualization-package plan. It puts chart and shared UI maintenance in one package and gives core a broader public surface; chart styling, dependencies, and package exports must be verified accordingly. The existing react-ui remains available as the comparison baseline.
