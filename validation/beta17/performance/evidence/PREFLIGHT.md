# Frozen handoff preflight — blocked, no formal performance result

Frozen manifest SHA256: `ebb0bb3090b1ca475920c6a172789e307f1d12fb2b6721b021800bd0574d97e7`.
All 6,686 supplied frozen input hashes matched before and after preflight;
independent public-entry inventory found 2,765 installed package files. Consumer
was `/private/tmp/beta17-consumer`; server was `http://127.0.0.1:4197`.

`preflight-1.json` preserves the failed launch: Playwright-managed Chromium was
not installed. The conventional `channel: "chrome"` launch then used the same
installed Chrome channel as Worker1. No dependencies were installed.

`preflight-2.json` preserves the first baseline chat/paced rendered-output timeout.
Exact final source and idle state were reached. A separate diagnostic replay,
`preflight-dom-diagnosis.json`, confirms two tables and required rendered text,
but zero native `main form` elements. The frozen handoff expects one. Visible
Name/Send details controls exist; a schema component named Form does not prove
that it renders a native `<form>`. Session counters: started 1, completed 1,
cancelled 0, active 0, activeTimers 0; no page errors.

This is a fixture expectation mismatch, not a measured product regression.
Worker2 did not alter Worker1's manifest, selectors, client, server, payload,
installed files or served output. Do not change the manifest underneath an
active run. Worker1 must choose the correct public DOM probe, validate it across
both arms and all cells, then provide a newly frozen manifest and release.

**Zero formal timing streams and zero formal soaks ran.** All Worker2 browser
processes were closed with owned cleanup. The exclusive measurement window and
server are released back to Worker1; Worker1 owns stopping the server. Neither
preflight replay is an acceptance timing sample. No performance verdict or
publication is authorized by this evidence.
