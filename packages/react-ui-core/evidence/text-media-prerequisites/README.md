# Normally installed markdown prerequisites

Production858c445b8. The frozen tarball predates the gallery CSS fix and is evidence only for Table, CodeBlock, MarkDownRenderer and InlineMarkdownRenderer prerequisites. Normal npm consumer:11/11 focused tests passed, including real rendering/security/citation/Table integration, native ESM/CJS root imports and five bundle-pruning checks. Strict TypeScript5.9.3 with skipLibCheck=false passed Bundler, NodeNext ESM and CJS. Empty type logs indicate success. The tarball, installed implementation hashes, consumer lock and test-file hashes are retained.

Button-only imports exclude the highlighter and theme data; primitive Table excludes scroll-control styles; each tested dependency boundary excludes unrelated text/media/citation families. No legacy source imports are retained. These are consumer bundle checks, not runtime performance/memory measurements or server-rendering support.

Final combined package CI, plain/Tailwind browser styling, real clipboard behavior, final composers and third-party math/style delivery remain pending. Do not use this intermediate archive as whole-slice acceptance. The failed source/media browser artifact is archived separately under Sources tests; the gallery correction receives a new artifact and retest rather than rewriting either previous package.
