import { library, ThemeProvider } from "@openuidev/dashboard-library-next";
import { Renderer } from "@openuidev/react-lang";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { catalogComponents } from "./catalogCoverage";
import { catalogFixtures } from "./fixtures";
import { metricsProgram } from "./fixtures/metrics";

let host: HTMLDivElement;
let root: Root;
let errors: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div");
  host.style.width = "1200px";
  document.body.append(host);
  root = createRoot(host);
  errors = vi.spyOn(console, "error");
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  const calls = [...errors.mock.calls];
  errors.mockRestore();
  expect(calls).toEqual([]);
});
async function draw(children: ReactNode) {
  await act(async () => root.render(children));
}
const dashboard = (response: string, isStreaming = false) => (
  <Renderer library={library} response={response} isStreaming={isStreaming} />
);

// Every group's catalog programs, drawn as an app would: the package's public library.
for (const mode of ["light", "dark"] as const) {
  for (const fixture of catalogFixtures) {
    test(`catalog ${fixture.name} in ${mode}`, async () => {
      await draw(<ThemeProvider mode={mode}>{dashboard(fixture.program)}</ThemeProvider>);
      expect(host.textContent).toContain(fixture.text);
      expect(host.querySelector("[data-state=invalid]")).toBeNull();
    });
  }
}

test("a status Kpi marks its tone with a shape as well as a colour", async () => {
  const status = (tone: string) =>
    `Kpi("${tone}", "Degraded", null, null, null, null, null, null, "${tone}")`;
  await draw(
    dashboard(
      `root = Dashboard([Section("", [Kpis([${["good", "warning", "bad"].map(status).join(", ")}])])])`,
    ),
  );
  const mark = (tone: string) =>
    getComputedStyle(
      host.querySelector(`[aria-label="${tone}"] .openui-dashboard-status-icon > span`)!,
    );
  // Good is a dot; warning a triangle; bad a diamond.
  expect(mark("good").clipPath).toBe("none");
  expect(mark("warning").clipPath).toBe("polygon(50% 0px, 100% 100%, 0px 100%)");
  expect(mark("bad").clipPath).toBe("polygon(50% 0px, 100% 50%, 50% 100%, 0px 50%)");
});

test("a Card header shows its toolbar only when it has a control", async () => {
  await draw(dashboard(metricsProgram));
  const toolbar = host.querySelector(".openui-dashboard-card-controls")!;
  expect(toolbar.getAttribute("role")).toBe("toolbar");
  expect(getComputedStyle(toolbar).display).toBe("none");
  // A chart puts its view switch into the header's slot (a portal); then the toolbar shows.
  const button = document.createElement("button");
  button.textContent = "Bars";
  toolbar.querySelector(".openui-dashboard-card-slot")!.append(button);
  try {
    expect(getComputedStyle(toolbar).display).toBe("flex");
  } finally {
    button.remove();
  }
  // A chart's view checkbox (an input) shows it too.
  const input = document.createElement("input");
  input.type = "checkbox";
  toolbar.querySelector(".openui-dashboard-card-slot")!.append(input);
  try {
    expect(getComputedStyle(toolbar).display).toBe("flex");
  } finally {
    input.remove();
  }
});

test("while the model writes, the tile and card it is on show loading", async () => {
  await draw(dashboard(metricsProgram, true));
  // The last Card on the page is the one being written: a skeleton under one shimmer.
  const card = [...host.querySelectorAll(".openui-dashboard-card")].at(-1)!;
  expect(card.querySelector(".openui-dashboard-sheen")).not.toBeNull();
  expect(card.querySelector(".openui-dashboard-state")?.getAttribute("data-state")).toBe("loading");
  expect(card.textContent).toContain("Loading");
  // Finished: the numbers show.
  await draw(dashboard(metricsProgram));
  expect(host.querySelector(".openui-dashboard-sheen")).toBeNull();
  expect(host.textContent).toContain("18.4K");
});

for (const mode of ["light", "dark"] as const) {
  test(`full catalog renders every registered component in ${mode}`, async () => {
    const covered = new Set<string>();
    for (const fixture of catalogFixtures) {
      await draw(
        <ThemeProvider mode={mode}>
          <Renderer key={fixture.name} library={library} response={fixture.program} />
        </ThemeProvider>,
      );
      // Flush each measurement in its own act so nested ResizeObservers can commit.
      for (let frame = 0; frame < 3; frame++) {
        await act(async () => {
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        });
      }
      expect(host.textContent, fixture.name).toContain(fixture.text);
      expect(host.textContent, fixture.name).not.toContain("This card couldn't be drawn");
      expect(host.querySelector('[data-state="invalid"]'), fixture.name).toBeNull();
      expect(errors.mock.calls, fixture.name).toEqual([]);
      for (const name of catalogComponents(fixture.program)) covered.add(name);
    }
    expect(
      Object.keys(library.components).filter((name) => !covered.has(name)),
      "Registered components missing from successfully rendered catalog fixtures",
    ).toEqual([]);
  }, 15000);
}
