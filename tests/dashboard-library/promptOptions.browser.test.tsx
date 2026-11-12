import { examples, library, ThemeProvider } from "@openuidev/dashboard-library";
import { Renderer } from "@openuidev/react-lang";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

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
const draw = (program: string) =>
  act(async () =>
    root.render(
      <ThemeProvider>
        <Renderer library={library} response={program} isStreaming={false} />
      </ThemeProvider>,
    ),
  );
const kpiValues = () =>
  [...host.querySelectorAll(".openui-dashboard-kpi-value")].map((el) => el.textContent);

test("the filtered prompt example draws, and its period filter changes the numbers", async () => {
  await draw(examples[0]!);
  expect(host.querySelector("[data-state=invalid]")).toBeNull();
  expect(
    [...host.querySelectorAll(".openui-dashboard-card-title")].map((el) => el.textContent),
  ).toEqual(["Revenue", "Revenue by channel"]);
  expect(kpiValues()).toEqual(["$412.6K", "5,460", "$75.57"]);
  const week = [...host.querySelectorAll('[role="radio"]')].find((el) => el.textContent === "7D")!;
  await act(async () => (week as HTMLElement).click());
  expect(kpiValues()).toEqual(["$96.4K", "1,284", "$75.08"]);
});

test("the breakdown prompt example draws every card", async () => {
  await draw(examples[1]!);
  expect(host.querySelector("[data-state=invalid]")).toBeNull();
  expect(
    [...host.querySelectorAll(".openui-dashboard-card-title")].map((el) => el.textContent),
  ).toEqual(["Tickets by product area", "Slowest queues", "Agents"]);
  expect(kpiValues()).toEqual(["184", "96", "94.2%"]);
  expect(host.querySelectorAll(".openui-dashboard-table tbody tr")).toHaveLength(4);
});
