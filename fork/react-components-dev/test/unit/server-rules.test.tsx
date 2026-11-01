// Node seam: a server render carries the rules of the classes it rendered, and only those, in
// React's hoisted component-rule tags (#178). Each contract entry's fixtures render on their own,
// so one component's rules cannot stand in for another's.
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { migratedComponents } from "./contract/components";

// Components not yet wired with styleRules. Each codemod batch removes its components; the
// contract ticket deletes the list.
const unwired = new Set(
  migratedComponents.map((component) => component.folder).filter((folder) => folder !== "Button"),
);

const GENERATED = /^go\d+$/;

/** The hoisted component-rule tags in `html`: the classes each one serves, and its text. */
function servedTags(html: string) {
  return [...html.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)]
    .filter(([, attrs]) => /data-precedence="openui"/.test(attrs!))
    .map(([, attrs, text]) => ({
      classes: (/data-href="([^"]*)"/.exec(attrs!)?.[1] ?? "").split(" ").filter(Boolean),
      text: text!,
    }));
}

function renderedClasses(html: string) {
  const markup = html.replace(/<style[\s\S]*?<\/style>/g, "");
  const used = new Set<string>();
  for (const [, value] of markup.matchAll(/\sclass="([^"]*)"/g))
    for (const name of value!.split(/\s+/)) if (GENERATED.test(name)) used.add(name);
  return used;
}

describe("server-rendered component rules", () => {
  it("lists only real contract entries as unwired", () => {
    expect(unwired.has("Button")).toBe(false);
    expect(unwired.size).toBe(migratedComponents.length - 1);
  });

  for (const component of migratedComponents) {
    if (unwired.has(component.folder)) continue;
    it(`${component.folder}: serves exactly the rendered classes, once each`, () => {
      const html = renderToString(<>{component.elements()}</>);
      const tags = servedTags(html);
      const served = tags.flatMap((tag) => tag.classes);
      const text = tags.map((tag) => tag.text).join("");
      const keyframes = new Set([...text.matchAll(/@keyframes (go\d+)/g)].map((match) => match[1]));
      const used = renderedClasses(html);

      expect(used.size, "the fixtures render generated classes").toBeGreaterThan(0);
      expect(
        [...used].filter((name) => !served.includes(name)),
        "rendered without a rule",
      ).toEqual([]);
      expect(
        served.filter((name) => !used.has(name) && !keyframes.has(name)),
        "served but not rendered",
      ).toEqual([]);
      expect(
        served.filter((name, index) => served.indexOf(name) !== index),
        "served twice",
      ).toEqual([]);
      for (const name of served) expect(text, `${name} has its rule`).toContain(`.${name}`);
    });
  }
});
