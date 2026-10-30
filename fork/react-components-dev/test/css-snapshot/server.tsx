import { configureStyles, getComponentStyles } from "@openuidev/react-components";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { afterAll, expect, it, vi } from "vitest";
import { styleProvenance } from "../../scripts/style-provenance.mjs";
import { migratedComponents, otherChartContracts } from "../unit/contract/components";
import { renderWithPortals, withPortalTarget } from "../unit/contract/portal";
import {
  comparableAll,
  snapshot,
  type Collection,
  type LayerSnapshot,
  type Snapshot,
} from "./snapshot";

/**
 * Compares every server contract render with `file`, or records it under OPENUI_CSS_RECORD=1.
 * `layer` configures that app-wide cascade layer for the file (each snapshot file has its own module
 * graph) and keeps rules and order only (LayerSnapshot);
 * without it the snapshot keeps markup too and the raw collections feed the order report.
 */
export async function compareServerSnapshots(file: string, layer?: string) {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-15T12:00:00Z"));
  vi.stubEnv("TZ", "UTC");
  if (layer) configureStyles({ layer });
  afterAll(() => {
    if (layer) configureStyles({ layer: undefined });
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  const path = new URL(file, import.meta.url);
  const record = process.env["OPENUI_CSS_RECORD"] === "1";
  const provenance = layer
    ? { ...(await styleProvenance()), ...(await styleProvenance(layer)) }
    : await styleProvenance();
  const collections: Record<string, Collection> = {};
  const current: Record<string, Snapshot | LayerSnapshot> = {};
  const expected: Record<string, Snapshot | LayerSnapshot> = record
    ? {}
    : comparableAll(JSON.parse(readFileSync(path, "utf8")));

  // Render every contract, including the focused chart contracts. SharedBase and SkeletonPulse
  // are exercised by their public consumers in this same list, as in their focused contracts.
  for (const component of [...migratedComponents, ...otherChartContracts]) {
    const render = component.folder === "Modal" ? renderWithPortals : renderToString;
    const elements =
      component.folder === "Modal"
        ? withPortalTarget(() => component.elements())
        : component.elements();
    const html = elements.map((element) => render(element)).join("");
    collections[component.folder] = { html, sheet: getComponentStyles() };
    const { markup, ...rest } = snapshot(collections[component.folder]!, provenance);
    current[component.folder] = layer ? rest : { markup, ...rest };
    const mode = layer ? ` in the ${layer} layer` : "";
    if (layer)
      it(`${component.folder}: every rule sits in the ${layer} layer`, () => {
        expect(
          Object.values(rest.rules)
            .flat()
            .filter((rule) => rule.layer !== layer)
            .map((rule) => `${rule.selector} (layer: ${rule.layer ?? "none"})`),
        ).toEqual([]);
      });
    it(`${component.folder}: rendered markup and declarations${mode} match the pre-migration build`, () => {
      if (record) return;
      expect(current[component.folder], `${component.folder}: CSS/markup changed${mode}`).toEqual(
        expected[component.folder],
      );
    });
  }

  it(`covers exactly the recorded contract components${layer ? ` in the ${layer} layer` : ""}`, () => {
    if (record) return;
    expect(Object.keys(current).sort()).toEqual(Object.keys(expected).sort());
  });

  if (record) writeFileSync(path, JSON.stringify(current, null, 2) + "\n");
  const capture = process.env["OPENUI_CSS_CAPTURE"];
  if (capture && !layer) {
    mkdirSync(capture, { recursive: true });
    writeFileSync(`${capture}/server.json`, JSON.stringify(collections));
  }
}
