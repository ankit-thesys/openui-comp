# Slice #12 media checkpoint

Owns Image, ImageBlock, ImageGallery/GalleryModal and the existing useResponsiveContainer
support hook. Preserve all family exports and types at the root, including GalleryModal,
GalleryModalProps, ImageItem and OpenUIGalleryProps. Worker 1 owns these exports and adds
legacy `@radix-ui/react-aspect-ratio: ^1.1.1`; shared metadata is untouched here.

Each family's missing-export public-root test failed before its extraction; raw red/green
logs are retained. Three new tests and all 68 component consumer tests pass. Configured
strict source types, declaration build, formatting and semantic lint pass. Dependencies
and scratch-producer limitations are the same as Sources/**tests**/README.md; AspectRatio
is linked to the existing stock installation for this checkpoint. Normal installed-package
and browser acceptance remain pending. Image's initial test used JSDOM's unimplemented
`image.loading` reflection property; it now checks the actual native `loading` attribute.
No product change was needed for that test harness correction.

Image tests exercise actual React load/error handlers. ImageBlock's test checks initial
public markup through renderToStaticMarkup, avoiding fake ResizeObserver/geometry. That
markup check does not certify SSR styling, hydration or responsive client behavior.
ImageGallery's test checks preview order, limit, labels and update behavior while closed;
its interactive modal must be tested in Chrome with real observers and geometry.

Styles are ordinary stock Goober CSS/keyframes, ported by rendered part/layout/variant.
Unrendered legacy modal-details hover selectors are omitted. No old SCSS dependency,
style scanner, runtime patch or new styling API is introduced.

Inherited behavior to review: consumer Image onLoad/onError handlers replace its internal
state handlers; Image/ImageBlock errors do not explicitly reset on a changed source;
ImageBlock writes its existing unsanitized background URL string; GalleryModal sets body
overflow to hidden and restores auto rather than the previous value, has a fixed heading
ID and lacks explicit focus placement/trapping/return. Preview image wrappers have click
handlers without keyboard button semantics. These are retained, not redesigned here.

Pending Chrome: image dimensions/fit/error/retry, real ImageBlock resize/loading/error and
spinner phases, gallery layouts at all image counts and responsive breakpoints, preview
opening, thumbnail keyboard/selection, modal Escape/outside/close/scroll/cleanup, nested
portal themes, baseline comparisons and explicit overrides across plain CSS/Tailwind3/4
both orders, pruning/unused styles. SSR and performance/memory remain out of this batch.
