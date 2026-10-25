# Accepted KaTeX production integration checkpoint

User explicitly accepted the stable vendor-CSS exception, Vite6.4.2 zero-additional-styling-setup contract, about1.07MB unused emitted fonts with no unused network downloads and bare-esbuild setup boundary. Normative decision: docs/specs/react-ui-extraction-styling.md. Experimental plugin/CDN/custom runtime approaches remain unadopted.

TDD: old frozen production88fdccf94 fails the actual normal-installed Vite/Chrome test on computed math typography. Minimal wrapper lazy-import/private module/direct dependency change passes the same test, preserving all former JSDOM behavior assertions plus actual CSS/font checks. First new-test attempt hit a macOS temporary-directory symlink/root mismatch in Vite; standard fs.realpath fixture normalization fixed test routing only, raw failure retained. Build/types and26 affected JS/Goober pruning checks pass. The latter deliberately externalize vendor CSS and do not claim its delivery; executable Vite/Chrome tests own that boundary.

Independent Spec and Standards source/test reviews report zero actionable findings. Full package CI, exact frozen production artifact and independent Worker2 delivery validation are next; do not infer them from focused results. Worker1 retains Chrome until explicit release. Legacy/previews unchanged; no merge/release/ticket closure.
