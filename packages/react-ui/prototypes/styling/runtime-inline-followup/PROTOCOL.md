# Inline themes and automatic CSS compatibility — follow-up

Styling execution model remains REOPENED. The user authorized further prototype tests, not migration or architecture acceptance. Prior static and runtime candidates remain unchanged.

## Questions

1. Does keeping changing theme values out of Goober preserve actual SSR, hydration and streamed rendering?
2. Does that isolate themes from unrelated host content, including nested/dark themes and repeated updates?
3. Can a library-owned CSS delivery policy handle standard Tailwind v3 and v4 without a consumer styling import, configuration flag, setup command or build plugin?

## Separate candidates

- First inline candidate: exact earlier inline theme control with original ThemeProvider. Preserve any body-token side effects rather than counting inner-boundary isolation alone.
- Scoped theme control: keep component Goober unchanged; add an internal stable scope identifier and pass it to the original ThemeProvider. Theme values remain inline on that boundary. Consumers do not provide selectors.
- Cascade research: compare unlayered, layered, and property-specific rollback candidates using actual Button descriptors and real framework Preflight. Test effective CSS order, rather than infer order from JSX.
- Combined control: scoped themes plus a Button-only Goober layer/rollback adapter. Other component units remain unchanged; do not extrapolate Button interoperability to the whole library.

## Gates and observations

- Production Next.js, React19, Chrome; no-JavaScript initial shell plus actual streamed reveal with JavaScript.
- Exact full resolved token values in SSR and after hydration; nested light/dark themes, sibling independence and unrelated host sentinel preservation.
- Repeated unique accent updates, stable component resource counts, no Goober Theme resources. This is bounded correctness/resource-count evidence, not a new long memory soak.
- Concurrent red/blue and distinct numeric accent requests with exact response-bound scope/value checks.
- No-JavaScript late markup is reported separately from visible content: React's streamed Suspense reveal may need its normal client script.
- Delayed first-visible Button and Table styling, hydration console errors, actual client navigation, forms and all sampled Button states.
- Plain CSS, full Tailwind3/4 Preflight; intended normal/hover class overrides; explicit button/submit/reset types inside forms; disabled behavior.
- Guard metadata must contain only properties owned by the Button root. Unrelated host width/height must survive; descendant SVG properties cannot be included by a naive descriptor walk.
- Preserve differing cursor precedence and arbitrary layer/reset limitations. A scoped pass is not a universal host-CSS guarantee.

## Interpretation

The library can own scoped theme identifiers, stylesheet resource delivery and CSS compatibility code; these are integration responsibilities beyond selecting Goober. Any new wrapper or layering policy stays experimental until jointly reviewed. No component/package ownership decision changes and no migration implementation tickets are created.
