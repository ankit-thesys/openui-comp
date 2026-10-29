/**
 * The icon renderer comes from `@openuidev/react-components`, which carries the
 * same lazy lucide loader (icons load on demand through
 * `lucide-react/dynamicIconImports.mjs` — do NOT stub or alias that subpath in
 * a consumer bundler config) with category-based fallbacks on a miss.
 *
 * The kit previously vendored its own copy of that machinery; this re-export
 * keeps the import sites unchanged while the implementation stays in one place.
 */
export { IconWrapper } from "@openuidev/react-components";
