# Independent contributions alongside core slice 1

Work only on the fork `ankit-thesys/openui-comp`, in your own worktree/branch. Existing `packages/react-ui` is read-only. Coordinate before changing dependencies or shared configuration. No Goober patches, migration implementations, npm releases or upstream writes. Workers own the new core package and its tests; the tasks below own separate validation directories. Either task can start now without waiting for new packages.

## Task A — chart baseline and interaction fixtures (recommended)

Ownership: `validation/friend-chart-baseline/` only.

Build a reproducible reference catalog for the existing chart families using the unchanged legacy package. First inventory its actual exported chart families and supporting public parts/types; do not guess from old docs. Record source revision and existing build/setup commands. Use deterministic small datasets and stable viewports. Capture default, empty, representative interaction (tooltip/legend where applicable), light/dark theme and responsive behavior. Include screenshots and observable assertions for representative cases; document chart-specific behavior and genuine baseline failures rather than repairing old code. Reuse existing repo tooling; do not add global dependencies or change package manifests without coordination.

Deliver: runnable fixture/check commands, source revision, chart coverage matrix, expected outputs/screenshots, failures and coverage gaps. Store large generated outputs outside git or follow repository artifact conventions. This provides independent reference evidence for future chart migration; it does not certify the new core implementation.

## Task B — remaining form-controls behavior contract

Ownership: `validation/friend-controls-baseline/` only.

Audit and exercise the existing controls scheduled after slice 1: Buttons, Calendar, CheckBoxGroup/Item, Chips, DatePicker, FormControl, IconButton, Label, OptionCards, RadioGroup/Item, Select, Slider, SwitchGroup/Item and ToggleGroup/Item. Exclude Button, Input and TextArea because the workers own their migration and validation.

Inventory actual public props/types, controlled/uncontrolled behavior, change callbacks, keyboard/focus behavior, disabled states and portal behavior where relevant. Create a small runnable consumer with representative public-API interaction tests using existing tooling. Record expectations from unchanged source and observed behavior, not invented desired behavior. Report legacy defects separately; do not fix or redesign them. Prioritize realistic interactions over snapshots of implementation details.

Deliver: public behavior matrix with source references, reproducible consumer checks, baseline revision, observed failures and explicit untested areas. These will guide subsequent control migration without overlapping current workers.

## Handoff

Submit a draft PR only to the fork, or provide a branch/commit and report for integration. Keep each task separate. No changes to core, theme APIs, shared build configuration, or the other task's directory. Acceptance means reproducible baseline evidence, not all future migration work completed.
