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

test("the live-data prompt example draws from its Queries and refetches when the range changes", async () => {
  const asked: string[] = [];
  // run_sql answers by what the query asks for: totals for the range or the period before it,
  // or one row per day. The range shows up as "current_date - 30" or "current_date - 7".
  const totals = {
    30: { now: { revenue: 84000, orders: 830 }, before: { revenue: 76000, orders: 780 } },
    7: { now: { revenue: 3000, orders: 30 }, before: { revenue: 2500, orders: 25 } },
  };
  const runSql = async (args: Record<string, unknown>) => {
    const query = String(args["query"]);
    asked.push(query);
    const range = query.includes("current_date - 7") ? 7 : 30;
    if (query.startsWith("SELECT sum")) {
      const row = query.includes("day < ") ? totals[range].before : totals[range].now;
      return { columns: ["revenue", "orders"], rows: [row] };
    }
    return {
      columns: ["day", "revenue"],
      rows: [
        { day: "Nov 5", revenue: totals[range].now.revenue / 2 },
        { day: "Nov 6", revenue: totals[range].now.revenue / 2 },
      ],
    };
  };
  const channels = [
    { channel: "Online", revenue: 52000, orders: 510 },
    { channel: "Retail", revenue: 32000, orders: 320 },
  ];
  await act(async () =>
    root.render(
      <ThemeProvider>
        <Renderer
          library={library}
          response={examples[0]!}
          isStreaming={false}
          toolProvider={{
            run_sql: runSql,
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
  ).toEqual(["Revenue by day", "Channels"]);
  expect(host.querySelectorAll(".openui-dashboard-table tbody tr")).toHaveLength(2);
  // The previous period is its own query, before the range starts.
  expect(asked.some((query) => query.includes("day < "))).toBe(true);
  await act(async () =>
    (host.querySelector(".openui-dashboard-filter-button") as HTMLElement).click(),
  );
  const week = [...document.querySelectorAll('[role="option"]')].find(
    (el) => el.textContent === "Last 7 days",
  )!;
  await act(async () => (week as HTMLElement).click());
  await expect.poll(kpiValues).toEqual(["$3K", "30"]);
  expect(asked.some((query) => query.includes("current_date - 7"))).toBe(true);
});
