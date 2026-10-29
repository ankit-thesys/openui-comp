// Guards the contract checker itself: it must accept the selector and class shapes the spec allows
// and reject deliberately broken ones, so a passing contract test means something.
import { describe, expect, it } from "vitest";
import { classViolation, ruleViolation, rulesOf, selectorViolation, selectorsOf } from "./checks";

describe("selectorsOf", () => {
  it("reads selectors from Goober's minified output, inside @media and @container", () => {
    const css =
      ".go1{color:red;}.go1:hover{color:blue;}" +
      "@media (max-width: 600px){.go1{padding:0;}.go2,.go3::before{margin:0;}}" +
      "@container (min-width: 10px){.go4{gap:0;}}" +
      "@keyframes go5{from{opacity:0;}to{opacity:1;}}";
    expect(selectorsOf(css)).toEqual([
      ".go1",
      ".go1:hover",
      ".go1",
      ".go2",
      ".go3::before",
      ".go4",
    ]);
  });

  it("ignores braces and semicolons inside quoted strings", () => {
    expect(selectorsOf('.go1::before{content:"{;}";}.go2{color:red;}')).toEqual([
      ".go1::before",
      ".go2",
    ]);
  });

  it("splits selector lists only at top-level commas", () => {
    expect(selectorsOf(":where(.go1) h1:is(.a,.b),.go2{x:y;}")).toEqual([
      ":where(.go1) h1:is(.a,.b)",
      ".go2",
    ]);
  });
});

describe("rulesOf", () => {
  it("records the cascade layer of every rule, as a dotted path for nested layers", () => {
    const css =
      ".go1{color:red;}" +
      "@layer openui{.go2{color:red;}.go2:hover{color:blue;}}" +
      "@layer a{@media (min-width: 1px){@layer b{.go3{x:y;}}}}" +
      "@layer{.go4{x:y;}}";
    expect(rulesOf(css)).toEqual([
      { selector: ".go1", layer: "" },
      { selector: ".go2", layer: "openui" },
      { selector: ".go2:hover", layer: "openui" },
      { selector: ".go3", layer: "a.b" },
      { selector: ".go4", layer: "<anonymous>" },
    ]);
  });

  it("reads layer names across line breaks and skips other at-rules starting with @layer", () => {
    expect(rulesOf("@layer\n  openui {.go1{x:y;}}@layer-x{.go2{x:y;}}")).toEqual([
      { selector: ".go1", layer: "openui" },
    ]);
  });
});

describe("ruleViolation", () => {
  it.each([
    [".go1{x:y;}", ""],
    ["@media (max-width: 1px){.go1:hover{x:y;}}", ""],
    ["@layer openui{.go1{x:y;}}", "openui"],
    ["@layer openui{.go1:hover{x:y;}.go1+.go1{x:y;}:where(.go1) svg{x:y;}}", "openui"],
    ["@layer openui{@media (max-width: 1px){.go1{x:y;}}}", "openui"],
  ])("accepts %s in layer %j", (css, layer) => {
    for (const rule of rulesOf(css)) expect(ruleViolation(rule, layer)).toBeNull();
  });

  it.each([
    ["@layer openui{.go1.go2{x:y;}}", "openui", "compound selector inside the layer"],
    ["@layer openui{.go1:hover:not(:disabled){x:y;}}", "openui", "state chain inside the layer"],
    [".go1{x:y;}", "openui", "unlayered rule in layer mode"],
    ["@layer other{.go1{x:y;}}", "openui", "another layer"],
    ["@layer openui{@layer inner{.go1{x:y;}}}", "openui", "a nested layer"],
    ["@layer openui{.go1{x:y;}}", "", "layered rule in default mode"],
  ])("rejects %s in layer %j (%s)", (css, layer) => {
    const [rule] = rulesOf(css);
    expect(ruleViolation(rule!, layer)).toEqual(expect.any(String));
  });
});

describe("selectorViolation", () => {
  it.each([
    ".go123",
    ".go1:focus",
    ".go1:nth-child(even)",
    ".go1::-webkit-inner-spin-button",
    ".go1::-webkit-outer-spin-button",

    ".go1:hover",
    ".go1:disabled",
    ".go1:focus-visible",
    '.go1[data-state="active"]',
    ".go1[data-state='active']",
    ".go1[data-highlighted]",
    ".go1[aria-selected=true]",
    ".go1::before",
    ".go1::-webkit-scrollbar",
    ".go1::-webkit-scrollbar-track",
    ".go1::-webkit-scrollbar-thumb",
    ".go1+.go1",
    ".go1 + .go1",
    ":where(.go1) svg",
    ":where(.go1) p:has(+ p)",
    ":where(.go1) blockquote > :first-child::before",
  ])("accepts %s", (selector) => {
    expect(selectorViolation(selector)).toBeNull();
  });

  it.each([
    [".go1.go2", "two classes on one element"],
    [".go1 .go2", "descendant class"],
    [".go1:hover:not(:disabled)", "state chain"],
    [".go1:hover::before", "state plus pseudo-element"],
    [".go1::-webkit-scrollbar-thumb:hover", "scrollbar pseudo-element plus state"],
    [".go1:visited", "state outside the list"],
    [".go1:nth-child(even of .extra)", "class inside a structural state"],
    [".go1:nth-child(even):hover", "two states"],
    [".go1::-webkit-inner-spin-button:hover", "pseudo-element plus state"],
    ["[data-x] .go1", "attribute ancestor"],
    [".openui-button", "stable class in library CSS"],
    ["button", "bare type selector"],
    [":where(.go1) .openui-x", "class inside a zero-weight rule"],
    [":where(.go1) a:hover", "state inside a zero-weight rule"],
    [":where(.go1:root) .openui-x", "the old guard"],
  ])("rejects %s (%s)", (selector) => {
    expect(selectorViolation(selector)).toEqual(expect.any(String));
  });
});

describe("selectorViolation with prose rules (MarkDownRenderer only)", () => {
  const prose = { prose: true };

  it.each([
    ".go1 p",
    ".go1 h1",
    ".go1 p:has(+ p)",
    ".go1 li::marker",
    ".go1 li :last-child",
    ".go1 li ul",
    ".go1 h1 + strong",
    ".go1 hr + *",
    ".go1 blockquote *",
    ".go1 blockquote :where(p)",
    ".go1 blockquote > *:first-child::before",
    ".go1 > *:last-child",
  ])("accepts %s when opted in", (selector) => {
    expect(selectorViolation(selector, prose)).toBeNull();
  });

  it.each([".go1 p", ".go1 li :last-child"])("rejects %s without the opt-in", (selector) => {
    expect(selectorViolation(selector)).toEqual(expect.any(String));
  });

  it.each([
    [".go1 .go2", "a class after the root"],
    [".go1 p.x", "a class on the tag"],
    [".go1 p[data-x]", "an attribute"],
    [".go1 #id", "an id"],
    [".go1 a:hover", "a state, not a structural pseudo-class"],
    [".go1 li ul li", "three compounds"],
    [".go1 p:first-child:last-child", "two pseudo-classes"],
    [".go1 p:has(.go2)", "a class inside :has()"],
    [".go1 blockquote :where(.go2)", "a class inside :where()"],
    [".go1 blockquote :where(p:hover)", "a state inside :where()"],
    [".go1 .go2 p", "a second generated class"],
    ["p", "no generated root"],
    [".go1:hover p", "a state on the root"],
  ])("rejects %s (%s)", (selector) => {
    expect(selectorViolation(selector, prose)).toEqual(expect.any(String));
  });
});

describe("selectorViolation with prose credited to MarkDownRenderer", () => {
  const composed = { proseRoots: new Set(["go1"]) };

  it.each([".go1 p", ".go1 li :last-child", ".go1 > *:last-child"])(
    "accepts %s when go1 is MarkDownRenderer's root class",
    (selector) => {
      expect(selectorViolation(selector, composed)).toBeNull();
    },
  );

  it.each([
    [".go2 p", "another module's class plus a tag"],
    [".go2 > *:last-child", "another module's class plus a structural tag"],
    [".go1 .go2", "a class after MarkDownRenderer's root"],
    [".go1 li ul li", "three compounds after MarkDownRenderer's root"],
  ])("rejects %s (%s)", (selector) => {
    expect(selectorViolation(selector, composed)).toEqual(expect.any(String));
  });
});

describe("classViolation", () => {
  const documented = new Set(["openui-button", "openui-button-icon"]);

  it.each(["openui-button", "openui-button-icon", "openui-button--variant-primary"])(
    "accepts %s",
    (name) => expect(classViolation(name, documented)).toBeNull(),
  );

  it.each([
    ["openui-Button", "uppercase"],
    ["openui-button--", "empty modifier"],
    ["openui-button---variant", "triple dash"],
    ["openui-button--variant--primary", "two modifiers"],
    ["openui-button-root--size-small", "modifier on an undocumented block"],
    ["openui-button_icon", "underscore"],
  ])("rejects %s (%s)", (name) => {
    expect(classViolation(name, documented)).toEqual(expect.any(String));
  });
});
