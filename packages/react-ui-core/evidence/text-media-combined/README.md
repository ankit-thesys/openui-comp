# Combined text/media installed artifact checkpoint

Production revision e4e245bcb32781f757f367711f25107261e72d63. Exact normal npm tarball, install lock and per-file manifest are archived here. Worker2 owns the released browser window for new composer validation on this artifact; the owned Table/Markdown fixture is prepared only, with no Chrome run yet.

Installed consumer component/native/pruning tests:86/86 passed. Strict TS5.9.3 with skipLibCheck:false passed Bundler, NodeNext ESM and NodeNext CJS, including Table, composers and wrapper API fixtures. Publint passed. ATTW initially failed sandboxed npm pack, then passed with allowed npm access.

Full package format/lint/types/build and96 tests passed; its single separate install test stalled under restricted networking and was cancelled. The affected test then passed alone with allowed network access. Preserve this distinction: the original CI log is not an all-green uninterrupted run. No source assertion was weakened and no unaffected suite was rerun. Initial CI command used pnpm ci rather than run ci and failed command parsing; original log retained.

Source/standards reviews found zero actionable implementation findings. Browser coverage is pending for these combined inputs. Math markup renders, but third-party CSS/font automatic delivery remains unresolved and not accepted. SSR/hydration, migration performance and memory are not certified by these package checks. Neither legacy nor preview checkout was changed.
