import { getComponentStyles } from "@openuidev/react-components";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { afterAll, expect, it, vi } from "vitest";
import { snapshot, type Collection, type Snapshot } from "../css-snapshot/snapshot";
import { migratedComponents, otherChartContracts } from "./contract/components";
import { renderWithPortals, withPortalTarget } from "./contract/portal";

vi.mock("react-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-dom")>()),
  createPortal: (children: ReactNode) => children,
}));

vi.useFakeTimers({ toFake: ["Date"] });
vi.setSystemTime(new Date("2026-10-15T12:00:00Z"));
vi.stubEnv("TZ", "UTC");
afterAll(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

const path = new URL("../css-snapshot/server.json", import.meta.url);
const record = process.env["OPENUI_CSS_RECORD"] === "1";
const collections: Record<string, Collection> = {};
const current: Record<string, Snapshot> = {};
const expected: Record<string, Snapshot> = record ? {} : JSON.parse(readFileSync(path, "utf8"));

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
  current[component.folder] = snapshot(collections[component.folder]!);
  it(`${component.folder}: rendered markup and declarations match the pre-migration build`, () => {
    if (record) return;
    expect(current[component.folder], `${component.folder}: CSS/markup changed`).toEqual(
      expected[component.folder],
    );
  });
}

it("covers exactly the recorded contract components", () => {
  if (record) return;
  expect(Object.keys(current).sort()).toEqual(Object.keys(expected).sort());
});

if (record) writeFileSync(path, JSON.stringify(current, null, 2) + "\n");
const capture = process.env["OPENUI_CSS_CAPTURE"];
if (capture) {
  mkdirSync(capture, { recursive: true });
  writeFileSync(`${capture}/server.json`, JSON.stringify(collections));
}
