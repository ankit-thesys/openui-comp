// Self-contained for page.evaluate: sample every declared property on every stable-class
// element, including portals. Index flat rules once; the Charts fixture has thousands of marks.
export function snapshotDeclaredStyles(classes: string[]) {
  type Rule = { selector: string; declarations: [string, string][]; order: number };
  const byClass = new Map<string, Rule[]>();
  const fallback: Rule[] = [];
  let order = 0;
  const visit = (rules: CSSRuleList) => {
    for (const rule of rules) {
      if (rule instanceof CSSStyleRule) {
        const entry: Rule = {
          selector: rule.selectorText,
          declarations: [...rule.style].map((property) => [
            property,
            rule.style.getPropertyValue(property),
          ]),
          order: order++,
        };
        // Only index selectors whose class must be on the sampled element. Complex/legacy
        // selectors still take the full matches() path, so ancestry and prose stay covered.
        const ownClass = rule.selectorText.match(
          /^\.([\w-]+)(?:(?::[\w-]+)|(?:\[[^\]]+\]))*$/,
        )?.[1];
        if (ownClass) {
          const entries = byClass.get(ownClass) ?? [];
          entries.push(entry);
          byClass.set(ownClass, entries);
        } else fallback.push(entry);
      } else if (rule instanceof CSSMediaRule) {
        if (matchMedia(rule.conditionText).matches) visit(rule.cssRules);
      } else if (rule instanceof CSSGroupingRule) visit(rule.cssRules);
    }
  };
  visit((document.getElementById("openui-styles") as HTMLStyleElement).sheet!.cssRules);
  // Batch writes before reading styles. getAnimations()/finish() per mark repeatedly forces
  // animation/style updates across the entire large chart page.
  document.getAnimations().forEach((animation) => {
    if (animation.effect?.getTiming().iterations === Infinity) {
      animation.pause();
      animation.currentTime = 0;
    } else animation.finish();
  });
  return Object.fromEntries(
    classes.flatMap((className) =>
      [...document.querySelectorAll(`.${className}`)].map((el, i) => {
        const candidates = [
          ...fallback,
          ...[...el.classList].flatMap((name) => byClass.get(name) ?? []),
        ].sort((a, b) => a.order - b.order);
        const declared = new Map<string, string>();
        for (const rule of candidates) {
          let matches = false;
          try {
            matches = el.matches(rule.selector);
          } catch {
            // Pseudo-elements cannot be sampled through Element.matches().
          }
          if (matches)
            for (const [property, value] of rule.declarations) declared.set(property, value);
        }
        const style = getComputedStyle(el);
        return [
          `${className} #${i}`,
          Object.fromEntries(
            [...declared].sort().map(([property, value]) => {
              // Inline markdown inherits caller typography, including Tailwind's page font.
              if (
                className === "openui-inline-markdown-renderer-content" &&
                value.trim() === "inherit"
              ) {
                const parent = getComputedStyle(el.parentElement!);
                if (style.getPropertyValue(property) !== parent.getPropertyValue(property))
                  throw new Error(`Inline markdown no longer inherits ${property}`);
                return [property, "inherits from parent"];
              }
              return [
                property,
                // Percentage sizes resolve against layout the page owns (e.g. table resets).
                value.includes("%") && /(^|-)(width|height)$/.test(property)
                  ? `declared ${value}`
                  : style.getPropertyValue(property),
              ];
            }),
          ),
        ];
      }),
    ),
  );
}
