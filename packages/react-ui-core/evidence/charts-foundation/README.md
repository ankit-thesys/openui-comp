# Shared chart foundation checkpoint

This is a prerequisite source batch, not acceptance of the complete chart slice.
The missing-public-export red test and passing 3/3 focused public support/type
checks are preserved verbatim. Producer build, strict typecheck, scoped semantic
lint, and producer-native ESM/CJS public support imports pass. The earlier
missing Calendar/Funnel prerequisites were resolved by copying the owned pure
support modules unchanged. Offline install failed; ordinary online pnpm install
succeeded. The lock change adds only 21 core importer lines, without snapshot
changes. D3 ranges and Zustand peer classification follow existing react-ui.

Shared hooks, utilities, spring/measurement logic and the React PrintContext are
copied without behavior redesign. Public React PrintContext remains distinct
from the private print-media hook. Existing dependency manifests are not ported.
Shared SCSS is converted into explicit stock-Goober css/keyframes modules;
there is no runtime converter, injector, resolver, cache or dependency patch.

The two independent Spec/Standards reviewers reported no actionable foundation
findings. Family rendering, normal-installed D3 imports, final bundle pruning,
Chrome matrices, animation and print/export checks remain pending. No SSR or
performance certification is inferred from these results.
