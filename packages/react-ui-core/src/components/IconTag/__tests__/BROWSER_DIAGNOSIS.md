# Composer first browser failure — window released

Frozen normal npm consumer /private/tmp/core-combined12-consumer.
Productione4e245bcb32781f757f367711f25107261e72d63.
Exact401147-byte tarball SHA256:
f0fe45fde1e9eb22a674558fafddfe9a0269ff7a6f29e2bbe6214648eb6ad43e.
Worker1's committed handoff explicitly released the browser window. Hash matched,
prepare-only bundled both arms successfully, then composer-only Chrome ran.

## Observed extraction mismatch

The first plain/before/composers case fails at none/composer-defaults, before any
variant/override mutation. Legacy IconText height is48px; candidate is50px. The
nested TextBlockView gap is0 versus2px. Its primary typography is14px/21px versus
16px/24px. ImageText and ImageTextLarge also differ through that shared dependency.
The raw first expected/actual report and full installed manifest are preserved in
results/browser-first. No assertions were removed, relaxed or rewritten.

Inspection of the stock public Goober extractCss output confirms serialization of
TextBlockView's authored selector keys changes matching and specificity. Examples:

```css
/* Existing object key intended to match two classes on the root: */
&:where(.openui-text-block--size-xs).openui-text-block--text-subtext
/* Emitted rule instead requires a descendant variant element: */
.go4100837354:where(.openui-text-block--size-xs).go4100837354 .openui-text-block--text-subtext
```

Other generic variant/primary rules repeat the generated root class after :where,
raising specificity beyond legacy. The original key has no descendant between
size and variant. This explains the missing size gap/typography behavior and the
composer cascade differences; it is not evidence of a desired new appearance.
The full extractCss diagnostic is saved, using only Goober's public API against
the unchanged installed package. It is a serialization diagnostic, not SSR support
or a private-cache probe.

## Ownership and next gate

TextBlockView styles belong to Worker1. Worker2 made no changes to that source,
its tests, the frozen artifact, package metadata or legacy. Worker1 should correct
its authored selector representation using conventional supported Goober/CSS,
verify matching and specificity, then provide a normally installed fixed artifact.
Do not add a parser patch, runtime guard or generic selector rewriting layer.
The existing exact composer comparison is the red regression test; fixed browser
green remains pending. No other composer/framework pass is inferred from this stop.

**Browser window released to Worker1.** The failing runner completed its finally
cleanup, closed contexts/browser/server and saved the report. No active measurement
remains. Old source/presentation/media evidence retains its original artifact scope.
Whole-slice acceptance, math delivery, SSR/hydration and performance are not implied.

## Corrected composer retest — passed, browser released

Normal npm consumer: /private/tmp/core-selectors12-consumer.
Corrected production88fdccf94e39a5c58e5a2a80cdf7f755eb5f7326.
Exact401238-byte tarball SHA256:
bee4bc79ccac342cbdc433d16538b86be213aedd4da79a1ea325f6ea22002b6f.
Worker1 supplied its reviewed selector correction and explicitly released Chrome
through the committed orchestration handoff. Preparation passed; no artifact was
repacked, overwritten or modified by Worker2.

The unchanged composer-only matrix passes all six cases /30012 paired computed,
visible-geometry and SVG snapshots (5002 per case), plain CSS/Tailwind3/Tailwind4,
component styles before/after host, five themes. Sizes/variants/layouts/bold text,
public refs, existing overrides/hover, image sizing/load/error/recovery, real icon
updates/fallback/omission, source-resolved updated markdown citations/navigation,
responsive layout, independent/nested themes and cleanup pass. No assertions were
weakened or adjusted between the first failure and corrected run.

The original e4e245bcb failure remains untouched under results/browser-first; it
must not be relabeled as testing88fdccf94. Corrected preparation/output, complete
installed implementation manifest, npm lock and exact artifact are archived under
results/browser-corrected. Each report retains exact fixture/runner/bundle/host hashes
and Chrome version156.0.8078.47. The successful report requested only composers; no
foundation/media scenarios were repeated.

**Browser window released to Worker1.** The corrected runner exited successfully,
closed all contexts/browser/server and left no active measurement. Worker2 made no
production or test assertion changes for this corrected-artifact retest. Final
whole-package/slice acceptance belongs to integration. KaTeX/math delivery is still
a user decision; SSR/hydration/streaming, accessibility and performance/memory are
not certified by this composer compatibility matrix.
