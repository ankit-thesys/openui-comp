# Integrated template candidate

Candidate `cf1a8a88123b9a577c9cb43ae69d857ea6242f11`, draft [PR44](https://github.com/ankit-thesys/openui-comp/pull/44), is stacked on rename [PR43](https://github.com/ankit-thesys/openui-comp/pull/43). The six approved removals remain; the other ten important declarations remain. All 105 conversion files match the reviewed worker conversion after package-path mapping except those six approved literal removals.

Local build, formatting, lint, typecheck, publint and attw pass for both packages. A fresh native-pnpm packed consumer passes strict NodeNext ESM/CJS checking of all 194 public types, native loading of 166 component values, 3 chat exports and 5 library exports, and eight package-boundary rejection checks. These checks do not certify SSR or hydration.

The maintained lab passes all 34 tests, schema equivalence, build, and six theme browser checks, including theme switching during a stream. The final 12,450-cell matrix is pending; no aggregate parity pass is claimed. Existing Input/Label customization findings, Select paint difference, and inherited HorizontalBar instability remain separate findings.

The esbuild bundle probe uses standard file asset emission with React external. Button retains 9,002 JavaScript bytes (2,489 gzip), while an unused root import leaves 23 JavaScript bytes. Unrelated component JavaScript and Goober are pruned from the unused bundle. However both outputs retain the official KaTeX vendor stylesheet: 24,235 CSS bytes (4,106 gzip), plus 60 emitted font files. Asset emission does not establish browser download cost. The initial stricter no-KaTeX assertion failed; this is recorded as a vendor-CSS pruning limitation, not fixed with a custom adapter.

Independent source review found no blocking integration findings. The lab migration review found no blocking findings; versioned archive directories remain conventional, not immutable: setup overwrites the active manifest destinations, so use a new directory for every candidate. Historical archives and runs were preserved.

GitHub checks were not scheduled for PR43/44 because the existing workflows target PR base main. Local checks above are passing; no remote-green claim is made.

Matched pre-template archive comparison: Button 8,402 → 9,002 JavaScript bytes, or 2,461 → 2,489 gzip bytes (+28 bytes, about 1.1%). Full public exports 826,094 → 825,964 gzip bytes. CSS remains 24,235 bytes in both. This is a bundle-size observation, not a runtime-performance result. An initial baseline unused-import assertion falsely matched the consumer directory name; the corrected check matches exact node_modules package paths and passes for both archives. The original failure log is preserved.
