# Versioned post-measurement accounting correction

The first full-chat inventory used the obsolete call
`ownedStyle(unit, descriptor, true)`. The frozen adapter accepts an options object;
actual RuntimeBoundary correctly passes `{boundary:true, rows:metadata[unit]}`.
The inventory helper therefore omitted ownership guards. **The candidate and all
measured runs used the correct boundary call.** No measured candidate source, bundle,
Next build or frozen source manifest was modified for this correction; all 235
previously recorded hashes still match.

| Accounting | Preserved version1 | Corrected version2 |
| --- | ---: | ---: |
| Runtime style families | 47 | 47 |
| Families matching observed completed DOM | 28 | 28 |
| Families without observed DOM matches | 19 | 19 |
| Total generated CSS, UTF-8 bytes | 880,729 (undercount) | **1,500,896** |
| CSS for 19 unmatched families, UTF-8 bytes | 123,069 (undercount) | **207,056** |

Omitted guard text accounts for 620,167 bytes. Version2 compiles only a separately
named accounting helper with the exact frozen boundary options. It reuses the
preserved DOM-selector match observations by unit against unchanged metadata; no
new browser usage sampling or benchmark was performed. Even a matched family can
contain many unused variants/states. These figures do not establish on-demand delivery.

## Browser counter reconciliation and encoding limitation

The frozen soak's fields named `bytes` measure JavaScript `textContent.length`,
which counts UTF-16 code units. They are not byte or network-transfer counters.
Runtime snapshots show one merged 47-resource style node with counter 1,500,896,
plus the 54-character host layout style (total 1,500,950). All 47 resource keys agree
with the corrected helper at every recorded runtime checkpoint.

A tiny, separately versioned diagnostic made exactly two navigations using the
unchanged frozen server/bundle and a transient proxy that changes only HTML's
Content-Type header to `text/html; charset=utf-8`:

| Diagnostic | Frozen original | Header-only UTF-8 control |
| --- | --- | --- |
| `document.characterSet` | `windows-1252` | `UTF-8` |
| Resource text UTF-16 code units | 1,500,896 | 1,500,864 |
| Resource text re-encoded as UTF-8 bytes | 1,500,964 | 1,500,896 |
| Hydration errors | 0 | 0 |
| Styles present after unmount/remount | Yes | Yes |

The original standalone server omitted a charset header/meta, so Unicode quotation
characters in TextContent CSS became mojibake (for example `“` became `â€œ`). This
explains the otherwise surprising agreement between its DOM-character counter and
the generated source's UTF-8 byte count. Proper UTF-8 decoding exactly matches both
corrected source code-unit and byte totals. Raw excerpts are preserved in encoding-v1.
This is a real limitation of the measured standalone fixture; zero hydration warnings
did not prove correct Unicode CSS decoding. No timing/soak was rerun or silently
substituted with the UTF-8 control, and the frozen fixture remains unchanged.

## Preserved and new evidence

- `style-inventory.json`, `style-inventory.ts`, `style-inventory.cjs`: original
  undercounted inventory/helper, preserved as executed.
- `style-inventory-v2.ts`, `inventory-v2-check.mjs`, `style-inventory-v2.cjs`: versioned
  accounting helper/checker; `results/style-inventory-v2.json` records corrected totals,
  hashes, unchanged measured files, reused observations and browser reconciliation.
- `results/style-inventory-v2-initial-character-check.json`: preserved initial attempt
  which correctly computed UTF-8 bytes but incorrectly expected those source code units
  to equal the original decoded browser text, exposing the encoding issue.
- `encoding-check-v1.mjs`, `results/encoding-v1.json`: the two-navigation charset,
  Unicode excerpt, exact resource-key and hydration/remount diagnostic.
- `results/FINAL-SOURCE-BUILD-SHA256.json`: original measured freeze, unchanged.

This correction improves accounting and records a bounded encoding fix control. It
is not a migration decision, a new performance result, or a claim that the measured
candidate was fixed after the fact.
