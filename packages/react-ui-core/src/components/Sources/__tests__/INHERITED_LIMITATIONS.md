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
