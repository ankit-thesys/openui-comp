# #17 lifecycle diagnosis — environment blocker, no acceptance

## Finding

Installed Chrome156.0.8078.47 launches GoogleUpdater157.0.8089.0 background
processes during the replay. Its updater crash handlers outlive the Chrome main
processes and retain stderr connections to the Node22.22.2 / Playwright1.59.1
runner. This was confirmed with read-only PID and file-descriptor inspection,
not inferred only from a slow close. `context-close-open-handles.txt` preserves
the observations; the full browser log is inside `lifecycle-context-close.tgz`.

At the observed stall, Chrome main PIDs73502/73517 were absent while updater
crash handlers73558/73568 remained parented to1. Their stderr socket endpoints
were0x1344a6b45ed2d897 and0xbad3e15392fa08f. The waiting Node73473 had matching
peer endpoints0x58d1f1314da28a06 and0xe111116e186a37ff. Playwright's installed
process launcher resolves shutdown after the child `close` event, which also
requires stdio closure. Temporary-directory cleanup had not started at this wait.
This distinguishes the blocker from SCSS/Goober, parser completion, DOM readiness
and slow directory deletion. It does not establish an upstream Playwright bug.

[Node documents that `close` follows process termination and stdio closure](https://nodejs.org/api/child_process.html#event-close).
[Playwright recommends explicitly closing owned contexts before the browser](https://playwright.dev/docs/api/class-browser#browser-close).

## Preserved attempts

- V4 formal attempt:2 excluded streams +20/80 measured streams; stopped143.
  All frozen input and independent installed-file hashes matched after stop.
  Archived in `lifecycle-v4-interrupted.tgz`. Never reuse its partial samples.
- Full traced BrowserServer diagnostic:20 observations, waiting in server.close;
  stopped143. An earlier repeated-stream diagnostic eventually closed after
  about24s. Sources/logs are in `lifecycle-v4-server.tgz`.
- Direct stock chromium.launch diagnostic: first cell transition passed, then
  browser.close waited after the stress cell;40 observations, stopped143.
  Archived in `lifecycle-direct-launch.tgz`.
- Direct launch plus documented context-before-browser cleanup: contexts closed
  in~16ms, but browser.close still waited;20 observations in each of two full
  attempts, stopped143. The separate one-cell process-log reproducer exited0:
  browser closes took18–28s and directory cleanup onlymilliseconds.
  All exact source variants, derived manifests, reports and process/API logs are
  in `lifecycle-context-close.tgz`.

Every derived manifest is explicitly diagnostic-only and changes only the owned
browser.mjs hash against V4. W1's original manifests, product/replay/served files,
lock and installed artifacts were not edited. `lifecycle-attempts.json` inventories
partial counts. Current source is the conventional direct-launch/context-close
candidate, **not a demonstrated complete long-run fix**. Updated ownership tests
first failed, then passed; both independent source review axes found no actionable
issue. No new timeout, acceptance threshold, force-kill hook or runtime patch was
added. Operator TERM actions targeted only the listed owned Node processes.

## Next supported path

Do not refreeze for another formal run yet: the required full repeated-workload
four-cell transition has not passed. The environment must first avoid this
updater inheritance or otherwise demonstrate reliable stock lifecycle completion.

A conventional option is an isolated, pinned **Chrome for Testing** binary,
preferably matching the tested Chrome version, with its version/hash frozen and
the same workload/viewport/protocol. This is a proposal requiring coordination,
not an implemented or accepted browser substitution. Google supplies this Chrome
flavor for reproducible automation without auto-update:
[Chrome for Testing](https://developer.chrome.com/docs/automation-and-testing/chrome-for-testing).
An alternative is an independently prepared clean Chrome environment. Do not
kill updater services, change user-global settings, detach private streams,
patch Playwright or Goober, add guessed browser flags, or waive inventory gates.

## Ownership and release

All owned benchmark/diagnostic Node processes were stopped or exited; Chrome
main processes were observed absent. User-global updater processes/settings were
left untouched and may still exist. The exclusive browser/quiet timing window
and fixture server are **released back to root/W1**. W1 owns server stop.

**No80-sample formal matrix, ten-minute soak, or performance verdict exists.**
Nothing here authorizes product migration, publication, or issue closure.
Archives preserve the original raw bytes; unpack to a scratch directory for
independent review. Checksums are recorded in `LIFECYCLE-ARCHIVES.sha256`.
