// Guards the contract checker itself: it must accept the selector and class shapes the spec allows
// and reject deliberately broken ones, so a passing contract test means something.
import { describe, expect, it } from "vitest";
import { classViolation, selectorViolation, selectorsOf } from "./checks";

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

describe("selectorViolation", () => {
  it.each([
    ".go123",
    ".go1:hover",
    ".go1:disabled",
    ".go1:focus-visible",
    '.go1[data-state="active"]',
    ".go1[data-state='active']",
    ".go1[data-highlighted]",
    ".go1[aria-selected=true]",
    ".go1::before",
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
    [".go1:focus", "state outside the list"],
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
