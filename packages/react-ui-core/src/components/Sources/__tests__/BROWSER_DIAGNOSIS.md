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
