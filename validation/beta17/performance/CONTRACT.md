# Performance fixture handoff proposal (#17)

Worker1 owns fixtures, payloads, transport and functional checks. Worker2 owns
only this performance directory. No measurement starts before Worker1 freezes
the fixture, supplies normal installed artifacts and releases the quiet browser
window. This file proposes the handoff contract; coordinate any differences
before implementation/measurement rather than adding alternate adapters.

The manifest is a JSON file supplied by Worker1:

```json
{
  "schemaVersion": 1,
  "productCommit": "frozen source revision",
  "origin": "http://127.0.0.1:PORT",
  "consumer": "/absolute/normal-installed-consumer",
  "inputs": { "/absolute/frozen/file": "sha256" },
  "runtimeModules": ["/absolute/compiled/input/module.mjs"],
  "streamPath": "/stream",
  "statsPath": "/stats",
  "selectors": {
    "ready": "#ready",
    "mounted": "#mounted",
    "mount": "#mount",
    "unmount": "#unmount",
    "start": "#start-stream",
    "cancel": "#cancel-stream",
    "status": "#status",
    "message": "#message-source",
    "input": "#prompt",
    "theme": "#theme-hue"
  },
  "cells": {
    "chat/paced": {
      "urls": {
        "baseline": "/baseline/?workload=chat&load=paced",
        "runtime": "/runtime/?workload=chat&load=paced"
      },
      "expectedText": "complete last assistant message from public application state",
      "expectedDom": { "tables": { "selector": "main table", "count": 1 } },
      "requiredText": ["independently expected rendered text"],
      "renderedRoot": "main",
      "payloadSha256": "sha256",
      "scheduleSha256": "sha256"
    }
  }
}
```

Provide all four cells: chat/dashboard × paced/stress. Expected payloads/counts,
response cardinalities and replay schedules live only in Worker1's fixtures.
Each arm receives the same cell data, dependencies and animations. Runtime is
actual installed core/kits plus the real parser/transport, not source aliases.
The baseline is isolated legacy implementation with its own CSS. Both routes
must be ordinary standalone fixture applications, preventing package self-resolution.

The runner adds a `session` query parameter to the page URL. HTTP stream requests
carry that session ID; `GET /stats?session=ID` returns that session's cumulative
`started`, `completed`, `cancelled`, current `active` and `activeTimers` counts.
Responses must not mix baseline/runtime or concurrent session statistics.
After a terminal stream/unmount, active streams/timers must reach zero before
the acceptance checkpoint; tab closure or memory pressure is not cleanup proof.

Public fixture controls/outputs: ready/mounted use `true`/`false`, status uses
`idle`/`streaming`, and message is exactly the last assistant's source content
from the public runtime API. Input/theme are ordinary fillable inputs; changing
theme hue exercises the existing ThemeProvider API. Mount/unmount controls stay
available outside the rendered subtree. The renderer's required DOM/text is
checked separately from final source/idle state. No production test-only API,
private parser/store access, Goober hooks or stylesheet patch is requested.

Worker1 starts/stops the owned fixture server. Worker2 does not spawn builds,
install dependencies, change fixture files or copy payload definitions. The
manifest hashes the replay/server/client/build inputs, installed artifact/lock
provenance and baseline revision. Worker2 additionally inventories installed
core/kits dist/manifests and archives its own runner sources. Reusing an existing
server is allowed only after session isolation and frozen inputs are verified.

Historical protocol is a67bd0695: ten alternating matched pairs per cell after
one excluded first-stream observation per arm; both ten-minute workloads retain
the original warmup, natural samples and phase-matched endpoints. Headline
timing runs alone. Soak arms use separate owned Chrome processes with matched
cycles. Diagnostics/profilers and other heavy/browser work stay outside them.
