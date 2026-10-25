# MarkDownRenderer vertical — slice #12

Public-root test failed on the missing component, then passed rich headings/bold/inline and fenced code, legacy variants/className, updates and custom component options. Default link target/rel and executable URL stripping are checked, and raw script input does not become a script element or execute. No rehypeRaw, trust expansion or new sanitizer policy is introduced. Producer build and configured strict types pass. The original rendering and option merge logic is retained.

Styles are manually converted one-to-one from legacy SCSS to stock Goober with existing class hooks. Body/heavy/heading token declarations and selectors preserve the effective cascade. Legacy inline-code pseudo-elements include invalid display:hidden, which browsers ignore; this is retained and reported, not redesigned. Default syntax themes use the existing light/dark choice and normal producer bundling of the two typed Prism theme leaves.

This is an intermediate source check. GFM Table integration, inline citations, final installed ESM/CJS/types, browser plain/Tailwind orders, overrides and pruning remain pending. SSR, hydration and runtime performance are not certified. The frozen source/media artifact used by Worker2 excludes this component and remains unchanged while markdown work proceeds.
