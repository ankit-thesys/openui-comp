// The browser snapshot ignores the inline sizes Calendar's dropdowns measure after opening, and
// nothing else. Built from the recorded Calendar baseline, so it exercises the real markup.
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { comparable, type Snapshot } from "../css-snapshot/snapshot";

const recorded = JSON.parse(
  readFileSync(new URL("../css-snapshot/browser-Calendar.json", import.meta.url), "utf8"),
) as Record<string, Snapshot>;
// Every unlayered sample that captured an open month or year dropdown with its measured sizes.
const samples = Object.entries(recorded).filter(
  ([key, sample]) =>
    !key.startsWith("openui/") && sample.markup.some((element) => /max-height: \d/.test(element)),
);
const edit = (sample: Snapshot, change: (element: string) => string): Snapshot => ({
  ...sample,
  markup: sample.markup.map((element) =>
    /openui-calendar-select-content-(months|years)"/.test(element) ? change(element) : element,
  ),
});

it("covers both measured dropdowns in the recorded baseline", () => {
  const markup = samples.flatMap(([, sample]) => sample.markup).join("");
  expect(markup).toMatch(/openui-calendar-select-content-months"[^>]*max-height: 237px/);
  expect(markup).toMatch(/openui-calendar-select-content-years"[^>]*min-height: 237px/);
});

it.each(samples)("%s compares equal before, after and between measurements", (_, sample) => {
  const unmeasured = edit(sample, (element) =>
    element
      .replace(/ max-height: \d+px;| min-height: \d+px;/g, "")
      .replace(/min-width: [\d.]+px;/, "min-width: 0px;"),
  );
  const remeasured = edit(sample, (element) => element.replace(/237px/g, "512px"));
  expect(comparable(unmeasured)).toEqual(comparable(sample));
  expect(comparable(remeasured)).toEqual(comparable(sample));
});

it.each(samples)("%s still fails on a real change to the measured element", (_, sample) => {
  const changes = [
    (element: string) => element.replace('data-side="bottom"', 'data-side="top"'),
    (element: string) => element.replace("pointer-events: auto;", "pointer-events: none;"),
    (element: string) => element.replace("max-height: 237px;", "max-height: 50%;"),
    (element: string) => element.replace(/ style="/, ' style="padding: 4px; '),
  ];
  for (const change of changes)
    expect(comparable(edit(sample, change))).not.toEqual(comparable(sample));
});

it("keeps measured-looking sizes on every other element", () => {
  const sample: Snapshot = {
    markup: ['<div class="openui-select-content" style="max-height: 237px;">'],
    rules: {},
    order: [],
  };
  expect(comparable(sample).markup).toEqual(sample.markup);
});
