# Initial frozen-artifact browser run

Artifact: production680118396504e39cff1534c9de191aac38832f02, normal npm consumer
`/private/tmp/core-source-media-npm-consumer`, tarball SHA256
eefb647a4128f0b8754cb906fbccd6d0aecb41ab526d61494d32929412d95f3f (353244 bytes).
The committed Worker1 handoff explicitly released the browser window.

## Harness preparation

First preparation failed because Radix does not export its package.json subpath.
Test-only baseline aliases now resolve Radix's public entry; packages with subpath imports
(React/DOM/lucide/Zod) retain their package-directory aliases. Preparation passed after
that correction. No public package code or assertions were changed for this failure.

The first execution was stopped by the sandbox's local listen EPERM, before Chrome.
The authorized escalated execution ran Chrome. Both preparation failures and the actual
first browser failure are preserved in results/browser-initial.

## Confirmed extraction defect

The first matrix passed plain/before/presentation (1620 paired snapshots), then failed
plain/before/media at responsive-mobile. Baseline grid-template-areas has six columns;
the runtime string contained merged names `img1img2` and `img4img4`, producing eight
implicit columns and different image dimensions. The source's doubled whitespace inside
quoted grid-area rows was merged by stock Goober's template parser.

The conventional source fix normalizes those area rows to single spaces (and removes an
irrelevant trailing space). These strings describe exactly the same CSS grid areas as
legacy. No parser patch, framework detector, new styling API or runtime workaround is
introduced. The harness additionally compares every gallery image count at mobile width;
the existing strict expected/actual assertion is unchanged.

**The frozen installed artifact is untouched.** Worker1 must integrate this source fix,
build/repack/install normally, and supply the new immutable artifact before the fixed
media browser result can be green. No fixed-artifact pass is claimed here. Independent
sources and presentation checks can continue against the old frozen artifact, with their
revision clearly recorded. No old production file or preview checkout is changed.

## Bounded completed results and handoff

Chrome156.0.8078.47, frozen production680118396504e39cff1534c9de191aac38832f02:

- Sources/citations: six cases,12336 paired computed/visible/SVG snapshots passed.
- Presentation: six cases,9720 paired snapshots passed.
- Total unaffected passing coverage:12 cases /22056 paired snapshots across plain CSS,
  Tailwind3/4, both style orders, five themes, overrides, interactions and cleanup.
- Media: first plain/before case failed on the mobile gallery grid. Earlier media
  checkpoints are diagnostic partial coverage; no complete media pass is claimed.

Raw successful family reports/logs and the normal npm lock are retained in results/.
They use identical runner SHA256546802dddc33ee6da7f2033d41c5dc5313c98e75abc3f6ca98cd3f3f755e9480.
The first failed full run records its own exact runner hash. The original353244-byte
frozen tarball is archived under browser-initial/source-media.tgz with the supplied
SHA256; all results retain the full installed dist manifest and artifact revision.

Required integration commits:9bb31d238 then9214cc528. The first normalizes the grid
strings, adds all mobile-count regression comparisons and fixes test-only Radix alias
resolution. Independent review caught a typo in that normalization before repacking;
9214cc528 restores the exact six-token row. Both reviewers then confirmed no remaining
scoped findings. Do not repack from9bb31d238 alone. Frozen installed files were untouched.

**Browser window released to Worker1.** Both completed runners exited successfully and
closed all their contexts/browser/server. Worker1 can integrate the two correction
commits and repack/install a new fixed artifact. The fixed media matrix remains pending;
no final slice acceptance, SSR, performance or memory certification is implied. Existing
Escape/onClick limitations are recorded separately in INHERITED_LIMITATIONS.md.

## Fixed media result — browser window released

New normal npm consumer: /private/tmp/core-source-media-fixed-consumer.
Production revision:96221894aa2273dc85059fe94efa155ef1f1210a.
Exact375293-byte tarball SHA256:
cb6306b9646be0dad2654542156e5e11623600bfe321abe2a9d5496cf21f8b45.

All six affected media cases pass:8292 paired snapshots, plain CSS/Tailwind3/4,
both component/host orders, five themes and all added mobile gallery counts.
The unchanged strict comparison now matches legacy grid geometry and styles.
No additional source or test correction was needed in this retest. Images, actual
network loading/error/recovery, spinner phase, GalleryModal/thumbnail selection,
portals, overrides, independent/nested themes and cleanup pass. Raw report, log,
normal consumer lock and exact tarball live under results/browser-media-fixed.
The report includes its exact runner/fixture hashes and full installed dist manifest.

Earlier source/presentation12-case22056-snapshot evidence remains attached to original
production680118396 and was not relabeled as this fixed artifact. Together the scoped
runs cover18 cases /30348 snapshots across two explicitly identified artifacts; this
is not a claim that all18 were rerun on one final combined package.

**Browser window released to Worker1 after the successful media run.** All contexts,
browser and local server are closed. No active measurement remains. Independent review
confirmed the canonical whitespace source fix after9214cc528. Remaining final installed,
combined-package, whole-slice and composer acceptance belongs to integration. Inherited
Gallery focus/body and citation Escape/onClick limitations remain explicit. SSR and
performance/memory are not certified by these style/behavior matrices.
