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
  await draw(examples[1]!);
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
  await draw(examples[2]!);
  expect(host.querySelector("[data-state=invalid]")).toBeNull();
  expect(
    [...host.querySelectorAll(".openui-dashboard-card-title")].map((el) => el.textContent),
  ).toEqual(["Tickets by product area", "Slowest queues", "Agents"]);
  expect(kpiValues()).toEqual(["184", "96", "94.2%"]);
  expect(host.querySelectorAll(".openui-dashboard-table tbody tr")).toHaveLength(4);
});

test("the live-data prompt example draws from its Queries and refetches when the period changes", async () => {
  const asked: unknown[] = [];
  const days = {
    "7d": [
      { day: "Nov 5", revenue: 1200, previous_revenue: 1000, orders: 12, previous_orders: 10 },
      { day: "Nov 6", revenue: 1800, previous_revenue: 1500, orders: 18, previous_orders: 15 },
    ],
    "30d": [
      { day: "Oct 13", revenue: 40000, previous_revenue: 36000, orders: 400, previous_orders: 380 },
      { day: "Oct 20", revenue: 44000, previous_revenue: 39000, orders: 430, previous_orders: 400 },
    ],
  };
  const channels = [
    { channel: "Online", revenue: 52000, previous_revenue: 47000, orders: 510 },
    { channel: "Retail", revenue: 32000, previous_revenue: 28000, orders: 320 },
  ];
  await act(async () =>
    root.render(
      <ThemeProvider>
        <Renderer
          library={library}
          response={examples[0]!}
          isStreaming={false}
          toolProvider={{
            sales_by_day: async (args: Record<string, unknown>) => {
              const period = args["period"] as keyof typeof days;
              asked.push(period);
              return { columns: Object.keys(days["7d"][0]!), rows: days[period] };
            },
            sales_by_channel: async () => ({ columns: Object.keys(channels[0]!), rows: channels }),
          }}
        />
      </ThemeProvider>,
    ),
  );
  await expect.poll(kpiValues).toEqual(["$84K", "830"]);
  expect(host.querySelector("[data-state=invalid]")).toBeNull();
  expect(
    [...host.querySelectorAll(".openui-dashboard-card-title")].map((el) => el.textContent),
  ).toEqual(["Revenue by day", "Revenue by channel", "Channels"]);
  expect(host.querySelectorAll(".openui-dashboard-table tbody tr")).toHaveLength(2);
  const week = [...host.querySelectorAll('[role="radio"]')].find((el) => el.textContent === "7D")!;
  await act(async () => (week as HTMLElement).click());
  await expect.poll(kpiValues).toEqual(["$3K", "30"]);
  expect(asked).toEqual(["30d", "7d"]);
});
