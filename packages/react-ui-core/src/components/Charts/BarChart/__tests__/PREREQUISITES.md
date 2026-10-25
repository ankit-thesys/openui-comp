# Committed chart foundation prerequisites

Base reviewed PR36d9d6c78f085bfb92d475d76bead2c73dbb428131. Worker1 shared Chartstypes ad6f92672 integrated as0655e3e47; additive orchestration-log-only conflict resolved retaining both histories. No source conflict.

Worker2 copies three files byte-identically from read-only legacy: BarChart/types.ts, BarChart/parts/horizontalBarGeometry.ts, ScatterChart/types.ts. No runtime imports, props/math changes, new APIs or dependencies. The geometry stays private; do not export it from the public root. This committed batch unblocks Worker1 shared hooks. Remaining families/styles wait for committed foundation; no legacy imports, duplicate helpers or resolver patches.

cmp checks confirm all three exact copies. Strict source TypeScript over staged core source passes using existing scratch tooling, and focused Prettier passes. Source-only scratch evidence, not a normally installed/runtime/browser claim. Public-root TDD test preparation for Scatter helpers is separate and intentionally still red on the prior installed package; do not integrate it as a passing family yet. Worker1 owns package/foundation/root/metadata; Worker2 owns these family paths. No Chrome launched; Worker1 FIRST chart window remains reserved.
