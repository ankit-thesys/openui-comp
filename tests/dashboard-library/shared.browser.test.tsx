import { library } from "@openuidev/dashboard-library";
import { Renderer } from "@openuidev/react-lang";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test } from "vitest";
import { Empty } from "../../packages/libraries/dashboard/src/components/shared/States";
import {
  FilterRegistryProvider,
  useReportFilter,
} from "../../packages/libraries/dashboard/src/shared/filterRegistry";

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});
function Report({ value }: { value: string }) {
  useReportFilter("region", value);
  return null;
}
const program = `data = Query("metrics", {}, {value: null})
root = Dashboard([Section("", [Row([Card("Query result", [Stat(data.value)])])])])`;
function scene(tool: () => Promise<unknown>, value = "all"): ReactNode {
  return (
    <Renderer library={library} response={program} toolProvider={{ metrics: tool }}>
      <Renderer.Content />
      <FilterRegistryProvider>
        <Report value={value} />
        <Empty />
      </FilterRegistryProvider>
    </Renderer>
  );
}
async function draw(children: ReactNode) {
  await act(async () => root.render(children));
}

test("Query loading resolves into no data, then active filters mean no results", async () => {
  let resolve!: (data: unknown) => void;
  const pending = new Promise((done) => {
    resolve = done;
  });
  const tool = () => pending;
  await draw(scene(tool));
  await expect
    .poll(() => host.querySelector(".openui-dashboard-empty")?.getAttribute("data-state"))
    .toBe("loading");
  expect(host.querySelector(".openui-dashboard-empty")?.textContent).toContain("Loading");
  await act(async () => resolve({ value: null }));
  await expect
    .poll(() => host.querySelector(".openui-dashboard-empty")?.getAttribute("data-state"))
    .toBe("empty");
  expect(host.querySelector(".openui-dashboard-empty")?.textContent).toContain(
    "No data for this period",
  );
  await draw(scene(tool, "eu"));
  expect(host.querySelector(".openui-dashboard-empty")?.getAttribute("data-state")).toBe(
    "no-results",
  );
  expect(host.querySelector(".openui-dashboard-empty")?.textContent).toContain(
    "Try changing or clearing a filter.",
  );
  await draw(scene(tool));
  expect(host.querySelector(".openui-dashboard-empty")?.getAttribute("data-state")).toBe("empty");
});

test("Query failure renders the shared data error instead of empty", async () => {
  await draw(
    scene(async () => {
      throw new Error("Fixture data unavailable");
    }),
  );
  await expect
    .poll(() => host.querySelector(".openui-dashboard-empty")?.getAttribute("data-state"))
    .toBe("error");
  expect(host.querySelector(".openui-dashboard-empty")?.textContent).toContain(
    "This data didn’t load",
  );
});
