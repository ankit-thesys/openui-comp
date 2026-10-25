# Owned installed chart comparison

Corrected source a5cdaa0fa8d9e6b7be34c759be7b0f8e2719eb4b, normal npm consumer
/private/tmp/core-chart-owned2-consumer, tar SHA256
`d4a1f19e944ebeb5339fb5cb970e07187d655fc44497e8538ea206faa45593db`.
Every installed implementation file matches the archive; package and lock hashes
stay unchanged. Native public root ESM/CJS imports pass. Matched Chrome matrix:
6 cases (plain CSS/Tailwind3/Tailwind4 × both initial stylesheet orders), 40,242
paired DOM/style/geometry observations pass across the seven owned families.
Default/variant, five theme states, responsive widths320/399/400/650, nested
and independent scope, explicit root/descendant overrides, empty recovery,
print provider/export JSON, print media and remount are covered.

The prior raw-attribute comparison rejected equivalent fallback spelling after
computed fill matched. Original failure remains; final semantic comparison
keeps computed fill/stroke and all other style/geometry assertions. No production
source changed for that harness correction. Exact executed runner/fixture and
consumer lock are archived. Calendar's earlier missing default is separate
source-failure evidence under charts-owned-source/.

This matrix runs reduced motion and settled states. It does not establish
animation-frame, hover/tooltip, streaming-parser, SSR, performance or memory
parity. Those must not be inferred. Artifact precedes the remaining Worker2
families; it is owned-batch evidence only. Final integrated artifact follows.
