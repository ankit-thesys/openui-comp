// A server render puts React's hoisted token-defaults and component-rule tags ahead of the markup
// (#178). Markup comparisons read the components' own markup without them.
const HOISTED = /<style[^>]*\bdata-precedence="openui(?:-defaults)?"[^>]*>[\s\S]*?<\/style>/g;

export const withoutServedRules = (html: string) => html.replace(HOISTED, "");
