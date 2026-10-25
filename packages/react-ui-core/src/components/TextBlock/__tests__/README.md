# TextBlockView vertical — slice #12

The existing public name TextBlockView is retained, with its props and variant/type/size/alignment/tone unions. Public-root TDD failed on the missing export, then passed forwarded ref, defaults, rich primary/secondary/tertiary content, native inline line clamp, optional content and prop updates. Producer build and configured strict types pass. Source component logic is copied without redesign.

The style map manually preserves all original variant/size/type rules and token families. Small concrete typography objects replace SCSS mixin repetition; stock Goober css is the only style engine. :where keeps legacy selector specificity when scoping existing class hooks. There is no new typography resolver, parser, runtime cache, styling API or consumer plugin.

All typography combinations, tones, clamping, alignments and theme/host/override interactions still require actual baseline/browser comparison. This intermediate behavior test is not visual parity or whole-slice acceptance. Tertiary content remains rendered but hidden by the existing styling rule. SSR/performance are not certified.
