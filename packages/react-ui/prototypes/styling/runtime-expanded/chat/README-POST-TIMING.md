# Post-timing corrections — versioned supplement

The original README.md, candidate sources, server/client bundles, Next build and
FINAL-SOURCE-BUILD-SHA256.json are preserved as measured. Read this supplement and
results/FULLCHAT-COVERAGE.md before interpreting the original inventory.

The corrected full-chat emission is **1,500,896 UTF-8 CSS bytes**, not 880,729.
The original inventory helper used an obsolete adapter signature and omitted
620,167 bytes of ownership guards. The real candidate always used those guards.
There are still 47 emitted families, 28 with observed DOM matches and 19 without;
the latter account for **207,056 bytes**, not 123,069. Usage observations are reused
by unchanged unit/metadata, not resampled. This remains aggregate delivery, not
minimal/on-demand styling.

A post-run two-navigation diagnostic also confirmed that the frozen standalone
fixture defaulted to Windows-1252. A proxy adding only an HTML UTF-8 charset header
restored Unicode CSS quotations and exact generated character/byte totals, with
successful hydration/remount. This control is separately versioned; measured sources
were not changed and benchmarks/soaks were not rerun. The original browser fields
named bytes are textContent UTF-16 code-unit counters, not network-byte measurements.

Evidence and reproduction:

- `results/INVENTORY-CORRECTION.md` — exact accounting and encoding explanation
- `node inventory-v2-check.mjs` — versioned accounting helper, raw browser-counter
  reconciliation and verification that all measured files remain unchanged
- `node encoding-check-v1.mjs` — bounded original versus header-only UTF-8 diagnostic,
  using owned localhost ports4247/4248 and Chrome; no performance measurement
- `results/style-inventory-v2.json` and `results/encoding-v1.json` — raw corrected evidence
- `results/POST-TIMING-ACCOUNTING-SHA256.json` — hashes for these post-timing additions

Earlier inventory output and the initial version2 character-check failure are
preserved. Fragment-SSR remount support, server-populated chat initial state, the
private Goober patch and aggregate emission remain open decisions. No migration or
acceptance is implied.
