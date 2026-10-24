# Retained comparison failure

The first integrated Chrome run and a diagnostic rerun stopped on plain/before/modal/tooltip-inside-modal: 13 candidate nodes versus 16 legacy nodes. The exact final tarball was unchanged. A full workspace install populated legacy node_modules: legacy resolved Radix Tooltip 1.2.7, while the normally installed consumer resolved 1.4.1. Their accessibility subtrees differ: 1.2.7 duplicates the body and two text spans inside a hidden role=tooltip subtree; 1.4.1 assigns the role/id directly to content. Recorded visible geometry, focus/hover and open state match. This was not a Goober style or product extraction fix.

The test-only correction at `135da0d8f` explicitly aliases legacy Tooltip to the candidate package's resolved public entry, fulfilling the intended shared-dependency comparison. Node-count and every geometry/style assertion remain unchanged; failure diagnostics retain complete public DOM snapshots. No nodes are filtered to obtain parity. Both independent reviewers approved this correction. Results apply to the recorded shared version, not equivalence across all permitted Radix versions.

The final full matrix is archived separately as browser-final.json/log. Original failed logs/JSON and diagnostic logs/JSON are retained without rewriting them. SSR and accessibility redesign remain outside this extraction.
