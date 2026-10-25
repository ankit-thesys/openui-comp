# Pinned browser handoff for Worker1 (#17)

The system Chrome156 updater holds inherited stderr endpoints after Chrome exits;
56f233772 preserves the diagnosis. The authorized environment correction uses
Google's isolated **Chrome for Testing156.0.8078.47, mac-arm64**, the exact same
version as the installed Chrome used previously. No installed app, updater,
settings, dependency or product file is modified.

Official selected distribution:
https://storage.googleapis.com/chrome-for-testing-public/156.0.8078.47/mac-arm64/chrome-mac-arm64.zip

Official version metadata:
https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json

Exact paths, version output and measured archive/executable/metadata hashes are
in `evidence/cft-browser.json`. These hashes are computed from downloaded bytes;
they are not represented as a vendor-published checksum. The distribution is
held only under `/private/tmp/beta17-cft/`. Both arms use this one executable
through stock Playwright `chromium.launch({executablePath,headless:true})`, with
explicit context close followed by browser close. No custom flags, updater
controls, detached streams, process-kill hooks or library patches are added.

## Immutable manifest additions

Add a `browser` object matching the pinned identity. Copy this object from the
provenance file; additional provenance properties are retained in the report:

```json
{
  "browser": {
    "name": "chrome-for-testing",
    "version": "156.0.8078.47",
    "platform": "mac-arm64",
    "bundlePath": "/private/tmp/beta17-cft/156.0.8078.47/chrome-mac-arm64/Google Chrome for Testing.app",
    "bundleSymlinks": {
      "Contents/Frameworks/Google Chrome for Testing Framework.framework/Google Chrome for Testing Framework": "Versions/Current/Google Chrome for Testing Framework",
      "Contents/Frameworks/Google Chrome for Testing Framework.framework/Helpers": "Versions/Current/Helpers",
      "Contents/Frameworks/Google Chrome for Testing Framework.framework/Libraries": "Versions/Current/Libraries",
      "Contents/Frameworks/Google Chrome for Testing Framework.framework/Resources": "Versions/Current/Resources",
      "Contents/Frameworks/Google Chrome for Testing Framework.framework/Versions/Current": "156.0.8078.47"
    },
    "source": "https://storage.googleapis.com/chrome-for-testing-public/156.0.8078.47/mac-arm64/chrome-mac-arm64.zip",
    "executablePath": "/private/tmp/beta17-cft/156.0.8078.47/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
    "executableSha256": "34fbfdb52aacee492bbada9972bf323eba663f8d8a069f86e2652e5158d6c580"
  }
}
```

The executable path must be an exact absolute key in `inputs`, with that same
SHA256. Copy the exact `bundleSymlinks` map from the provenance JSON. Merge **all340 regular-file hashes** from
`evidence/cft-bundle-inventory.json.files` into `inputs`, not only the launcher.
The5 symlink targets live in `browser.bundleSymlinks` rather than file hashes.
Freeze `cft-bundle-inventory.json` and `cft-archive-proof.json` too. The extracted
340 files and5 links were independently compared with the pinned ZIP contents.
Freeze the archive, official metadata snapshot and `cft-browser.json`
provenance as part of the input chain too. Their exact paths/hashes are in that
JSON file. Include the new `performance/browser-config.mjs` in the harness input
inventory and refresh the owned `browser.mjs`/`run.mjs` hashes. All prior fixture,
transport, payload, package, module, stylesheet and installed-origin guards stay
in force. Do not mutate V1–V4 or recast partial attempts as accepted.

`browser-config.mjs` checks pinned metadata, official download URL, the exact
frozen inventory entry and actual executable hash before any launch. It also enumerates and hashes the
complete extracted bundle, rejects missing/extra/changed files, checks every
symlink target and rejects links outside the bundle. `run.mjs`
applies that guard before creating a result directory, and `openArm()` applies
it for each arm and verifies `browser.version()` equals the pinned version.
The full runner revalidates bundle contents and symlinks after execution, before
recording terminal integrity. No environment variable silently switches browsers. Both arms therefore use
the same frozen binary. Timing, correctness and memory criteria are unchanged.

Earlier48-case functional evidence used regular Chrome156 and remains labeled
that way. A functional launcher claiming new Chrome for Testing coverage must
also select the pinned executable; do not silently retain `channel: "chrome"`
or relabel the earlier result as this environment's matrix. Worker1 owns any
affected functional rerun and immutable evidence update.

Worker1 must use the same pinned metadata when invoking the actual Worker2
preflight or transition helpers. An old handoff without `browser` now fails
closed. The full prerequisites in `HANDOFF-REQUIREMENTS.md` otherwise apply;
the previous installed-Chrome channel prerequisite is superseded here.

## Readiness versus formal measurement

Any Worker2 derived manifest is explicitly diagnostic-only: unchanged frozen
W1/product inputs plus declared owned harness/browser identity additions. It
cannot serve as the official immutable release. A complete repeated-workload
run must demonstrate all four cell transitions and clean shutdown, with raw
logs preserved. Independent scoped review is required before W1 refreezes.

Only after that diagnostic passes, W1 issues a new immutable handoff, validates
all gates and explicitly releases the browser window through root may Worker2
run a **fresh**80-sample formal matrix and both ten-minute soaks. Diagnostic
observations and all prior partial samples stay separate from acceptance.
