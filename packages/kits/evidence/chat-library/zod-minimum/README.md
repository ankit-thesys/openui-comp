# Zod minimum correction

Verifier independently demonstrated that published Zod 3.25.0 lacks zod/v4
files. Root authorized narrowing only the new kit's Zod 3 minimum to 3.25.76,
retaining ^4.0.0 and leaving old packages unchanged. Production metadata commit:
`d9cc96898`. Both reviews found no actionable correction findings.

The npm regression first failed on the original frozen tar: npm accepted exact
3.25.0 under the old public peer range. On the corrected tar, a separate strict
peer consumer rejects it with ERESOLVE naming ^3.25.76. Full package CI passes
7/7 tests plus format/lint/types/build/Publint/ATTW. Six inherited hook warnings,
zero errors. The original native failure and verifier report are retained.

The new archive changes only package.json and README among 566 files. Every
runtime/declaration/map byte remains identical to source8405. Both new consumers'
installed core and kit files match their respective archives; manifests/locks
and hashes are retained. New minimum Zod3.25.76 passes native ESM/CJS, strict
Bundler/NodeNext ESM/NodeNext CJS declarations and the two public parser/Renderer
form/action/history checks. Zod4.4.3 is used by the full package consumer gate.

No browser matrix was repeated solely for metadata. Earlier source8405 browser
evidence remains attached to its old archive. The stricter W1 hover/order/live
cancellation runner, W2 component diagnostics and independent verifier browser
acceptance remain pending in the documented browser sequence.
