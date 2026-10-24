# Confirmed inherited source/citation limitations

Frozen artifact680118396504e39cff1534c9de191aac38832f02, Chrome156, all six host/order
cases and five theme states. Actual baseline/runtime observations are preserved in
results/text12-browser-sources-first.json, separate from extraction mismatches.

- A clicked citation remains pinned when the pointer leaves, as expected. Pressing
  Escape afterwards leaves one tooltip mounted in both arms. The legacy controlled
  Tooltip root supplies open without an onOpenChange handler. This is not a claim
  of successful Escape dismissal; outside click and source selection do dismiss it.
- Citation's trigger does not call its public onClick prop: the callback event list
  remains empty in both arms. CitationItem/ListedSourceItem selection callbacks do
  work, as do pointer/Enter/Space source navigation and blocked unsafe navigation.

No legacy source or new-package behavior was changed to repair either limitation.
Other GalleryModal focus/body-overflow and image-source observations are preserved
in the initial failed media report; final media validation awaits the fixed artifact.

## Fixed-media artifact observations

Production96221894aa2273dc85059fe94efa155ef1f1210a, Chrome156.0.8078.47,
six media framework/order cases and five themes:

- Gallery opening leaves focus on BODY in both arms. This comparison does not
  certify focus placement, trapping or return.
- GalleryModal cleanup restores body overflow to auto in both arms. It does not
  restore a previously customized value; no scroll-lock redesign was introduced.
- After failed image loads, changing to a successful local source recovers both
  Image and ImageBlock error states in both arms. This observed path passes;
  the earlier source-inspection risk must not be presented as a confirmed bug.

Strict media interactions, images/loading/errors, responsive layouts, theme/portal
styles, explicit overrides and cleanup all pass. These results do not approve the
inherited focus/body behavior or establish SSR, accessibility or performance parity.
