import { Button, getComponentStyles, Input, TooltipWrapper } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { rulesOf, ruleViolation, selectorsOf } from "./checks";
import { cssFor, renderAndCollect } from "./collect";

it("collects a component's rules even when they registered before this render", () => {
  const elements = (["primary", "secondary", "tertiary"] as const).flatMap((variant) =>
    (["extra-small", "small", "medium", "large"] as const).flatMap((size) =>
      (["default", "destructive"] as const).map((tone) => (
        <Button variant={variant} size={size} tone={tone} iconLeft={<svg />}>
          Send
        </Button>
      )),
    ),
  );
  const first = renderAndCollect(elements);
  const registered = getComponentStyles();
  const second = renderAndCollect(elements);

  expect(getComponentStyles()).toBe(registered);
  expect(selectorsOf(second.css).length).toBeGreaterThan(0);
  expect(second.css).toBe(first.css);
});

it("excludes rules registered by unrelated renders from the component's collection", () => {
  const elements = [<Button>Send</Button>];
  const first = renderAndCollect(elements);
  const registered = getComponentStyles();
  renderToString(<Input />);

  expect(getComponentStyles()).not.toBe(registered);
  expect(renderAndCollect(elements).css).toBe(first.css);
});

it("also checks rules registered for parts absent from server markup", () => {
  const { html, css } = renderAndCollect([
    <TooltipWrapper tooltipContent="Details">
      <button>Help</button>
    </TooltipWrapper>,
  ]);

  expect(html).not.toContain("openui-tooltip-wrapper");
  expect(css).toContain("animation-name:var(--_openui-tooltip-wrapper-animation)");
  for (const direction of ["up", "down", "left", "right"])
    expect(css).toContain(`@keyframes _openui-tooltip-${direction}{`);
});

it("keeps selected rules inside their original conditional and layer wrappers", () => {
  const css =
    "@layer openui{@media (min-width: 1px){.go1{color:red;}.go2{color:blue;}}" +
    "@container card (min-width: 2px){.go1:hover{color:green;}}}" +
    "@supports (display:grid){.go2{display:grid;}}";

  expect(cssFor('<div class="go1 openui-example"></div>', css)).toBe(
    "@layer openui{@media (min-width: 1px){.go1{color:red;}}" +
      "@container card (min-width: 2px){.go1:hover{color:green;}}}",
  );
});

it("unions the render delta with class selection without duplicating rules or losing wrappers", () => {
  const frames = "@keyframes pop{to{opacity:1;}}";
  const rendered = ".go1{color:red;}";
  const clientOnly = ".go2.extra{animation:pop 1s;}";
  const delta = `@layer openui{@supports (display:grid){${rendered}${clientOnly}}}`;
  const before = `@layer openui{${frames}.go3{color:blue;}}`;
  const sheet = `${before}${delta}`;
  const css = cssFor('<div class="go1"></div>', sheet, before);

  expect(css).toBe(`@layer openui{${frames}}${delta}`);
  expect(selectorsOf(css)).toEqual([".go1", ".go2.extra"]);
  expect(ruleViolation(rulesOf(css)[1]!, "openui")).not.toBeNull();
});

it("retains newly registered keyframes even before a rendered part references them", () => {
  const delta = "@layer openui{@keyframes unused{to{opacity:1;}}.go2{color:red;}}";
  expect(cssFor("", delta, "")).toBe(delta);
});

it("collects newly registered rules when the cumulative sheet has one outer layer", () => {
  const before = "@layer openui{.go1{color:red;}}";
  const after = "@layer openui{.go1{color:red;}.go2{color:blue;}}";
  expect(cssFor("", after, before)).toBe("@layer openui{.go2{color:blue;}}");
});

it("retains whole rules mentioning a rendered class anywhere in the selector", () => {
  const selected =
    ".go2.go1{color:red;}.go2 > .go1:hover{color:blue;}" +
    ":where(.go1) svg{fill:red;}.go3,.go1+.go1{margin:0;}";
  const css = cssFor(
    '<div class="go1 openui-example"></div>',
    `${selected}.go10{color:black;}.go1-extra{color:white;}.go2{color:green;}`,
  );

  expect(css).toBe(selected);
  // Invalid compounds, descendants and selector-list branches must still reach the checker.
  expect(rulesOf(css).map((rule) => ruleViolation(rule, "") !== null)).toEqual([
    true,
    true,
    false,
    false,
    false,
  ]);
});

it("selects only class tokens, ignoring class-like attribute values and declaration strings", () => {
  const selected = '.go1::before{content:"{;} .go2";}';
  const css =
    '[data-label=".go1"]{color:red;}.go2{content:".go1";}' + `${selected}.go3{color:blue;}`;

  expect(cssFor('<div class="go1" data-class="go3"></div>', css)).toBe(selected);
});

it("selects keyframes by exact animation references rather than classes or other values", () => {
  const frames = (name: string) => `@keyframes ${name}{from{opacity:0;}to{opacity:1;}}`;
  const used = frames("fade") + frames("turn") + frames("named");
  const unused = ["go1", "fade-extra", "content-only", "jump-end", "linear", "unused"]
    .map(frames)
    .join("");
  const rule =
    '.go1{animation:fade 1s steps(2, jump-end),turn 2s linear;content:"{animation:content-only;}";}' +
    ".go1:hover{animation-name:named;}";
  const css = `@layer openui{${used}${unused}@media (min-width:1px){${rule}}}`;

  expect(cssFor('<div class="go1"></div>', css)).toBe(
    `@layer openui{${used}@media (min-width:1px){${rule}}}`,
  );
});

it("retains prefixed and quoted animation names without changing their wrappers", () => {
  const frames = '@-webkit-keyframes blink{to{opacity:1;}}@keyframes "quoted"{to{opacity:0;}}';
  const rule = '.go1{-webkit-animation:blink 1s;animation-name:"quoted"!important;}';
  const css = `@layer a,b;@layer{@supports (display:grid){${frames}${rule}}}`;

  expect(cssFor('<div class="go1"></div>', css)).toBe(
    `@layer{@supports (display:grid){${frames}${rule}}}`,
  );
});

it("recognises keyword animation names after their shorthand field is already supplied", () => {
  const frames =
    "@keyframes linear{to{opacity:1;}}@keyframes reverse{to{opacity:0;}}" +
    "@keyframes infinite{to{opacity:0.5;}}@keyframes backwards{to{opacity:0.2;}}";
  const rule =
    ".go1{animation:1s linear linear,2s normal reverse,3s 2 infinite,1s none backwards;}" +
    ".go1:hover{animation:1s linear;}";

  expect(cssFor('<div class="go1"></div>', `${frames}${rule}`)).toBe(`${frames}${rule}`);
});

it("checks each state-dependent animation name in its full shorthand context", () => {
  const css =
    ".go1{--animation:fade;animation:1s linear var(--animation);}" +
    ".go1:hover{--animation:linear;}@keyframes fade{to{opacity:1;}}";

  expect(() => cssFor('<div class="go1"></div>', css)).toThrow("Missing @keyframes: linear");
});

it("rejects animation references whose keyframes are missing", () => {
  for (const declaration of [
    "animation:missing 1s ease-out;",
    "animation-name:missing;",
    "-webkit-animation:missing 1s;",
    "--animation:missing;animation-name:var(--animation);",
    "--animation:missing;animation-name:var( --animation );",
    "animation-name:var(--absent, var(--fallback, missing));",
  ])
    expect(() => cssFor('<div class="go1"></div>', `.go1{${declaration}}`)).toThrow(
      "Missing @keyframes: missing",
    );
});

it("ignores CSS-wide animation keywords and none", () => {
  const css = ["none", "initial", "inherit", "unset", "revert", "revert-layer"]
    .flatMap((value) => [`.go1{animation:${value};}`, `.go1{animation-name:${value};}`])
    .join("");

  expect(cssFor('<div class="go1"></div>', css)).toBe(css);
});
