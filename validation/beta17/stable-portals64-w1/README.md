# W1 portal64 frozen checkpoint

Source `1031e915c368c6f041dcded03fe5c41dd2f073c1`; package tree `45a1964a82b418749e687f873b0f1d36c26b54d0`. Native final archive SHA256 `bd2a4b402b823e776203b8aca33455247b14f386deba7e76481371143dacf83c`. Tested v1 archive `482de12b8a14ee8dfdab9bbda220f8806a4ec8afcd786edcd8ec831d4e83f86d`; final differs only in README, all runtime payload bytes identical. All 371 owned embedded sources match frozen Git.

Worker browser PASS: 991 matched framework/order/theme/interaction checks, 72 focused CSSOM/state/part checks, 49 corrected optimized checks (1112 total). Plain CSS, Tailwind v3/v4, before/after order. Select, Calendar, DatePicker, Modal only. Build/typecheck pass; preserve all 1444 fallbacks. Source/spec and standards reviews pass. Independent/combined acceptance pending.

The first two optimized runs incorrectly waited for app children for Modal, whose actual content is portaled to body. Their failed readiness runs and diagnostic HTML are retained; final run waits for the real dialog. No product patch was introduced. Inline FloatingUI geometry remains unchanged. Calendar-to-Select direct style imports remain intact.

Archive/source checks and raw tests are retained separately. Window remains owned by W1 for combined65; this is not a release or broad performance/memory certification.

See w1/REPORT.md and MANIFEST.json. Large JSON files are losslessly compressed with original/stored hashes. Raw unsuccessful readiness attempts remain retained. Native archives untouched. No SSR or broad performance certification.
