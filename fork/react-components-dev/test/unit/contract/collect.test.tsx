import { Button, getComponentStyles, Input } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { rulesOf, ruleViolation, selectorsOf } from "./checks";
import { cssFor, renderAndCollect } from "./collect";

it("collects a component's rules even when they registered before this render", () => {
  const elements = [<Button>Send</Button>];
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
