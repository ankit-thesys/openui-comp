import React, { useMemo } from "react";
import { Renderer } from "@openuidev/react-lang";
import { ThemeProvider } from "../../../src/components/ThemeProvider";
import { openuiChatLibrary } from "../../../src/genui-lib/openuiChatLibrary";

export type Scenario = "chat" | "dashboard";

// The production library is intentionally shared by both styling arms. It keeps
// component validation, markdown, form state, table pagination and D3 charts real.
export const benchmarkLibrary = openuiChatLibrary;
export const workloadMetadata = {
  library: "openuiChatLibrary",
  renderer: "@openuidev/react-lang Renderer",
  tablePageSize: 10,
  chart: "production D3 BarChartCondensed; animations disabled by genui adapter",
  sizeUnit: "chat response blocks or dashboard panels (each panel has ten table rows)",
} as const;

const quote = JSON.stringify;

/** A root-first OpenUI program, suitable for replaying progressively longer prefixes. */
export function makeResponse(scenario: Scenario | string, size = 10): string {
  const count = Math.max(1, Math.min(500, Math.floor(Number(size) || 1)));
  const dashboard = scenario === "dashboard";
  const children: string[] = ["heading"];
  const definitions: string[] = [
    `heading = CardHeader(${quote(dashboard ? "Regional revenue dashboard" : "OpenUI research conversation")}, ${quote("Production components and parser replay")})`,
  ];
  for (let i = 0; i < count; i++) {
    const id = `b${i}`;
    children.push(`${id}text`);
    definitions.push(
      `${id}text = TextContent(${quote(dashboard
        ? `### Region ${i + 1}\nRevenue and forecast across six months. Review the underlying regional data below.`
        : `### Response ${i + 1}\nOpenUI renders this streamed answer with **production markdown**. The analysis compares regional revenue, explains the assumptions, and proposes a follow-up.\n\n- Review the evidence\n- Update the question\n- Explore the results`)})`,
    );
    if (dashboard) {
      children.push(`${id}chart`, `${id}table`);
      const revenue = Array.from({ length: 6 }, (_, j) => 35 + ((i * 17 + j * 23) % 80));
      const forecast = revenue.map((value, j) => value + 7 + j);
      definitions.push(
        `${id}chart = BarChart(["Jan", "Feb", "Mar", "Apr", "May", "Jun"], [Series("Revenue", ${quote(revenue)}), Series("Forecast", ${quote(forecast)})], "grouped", "Month", "Revenue ($K)", 240)`,
        `${id}table = Table([Col("Account", ${quote(Array.from({ length: 10 }, (_, j) => `Region ${i + 1} account ${j + 1}`))}, "string"), Col("Revenue", ${quote(Array.from({ length: 10 }, (_, j) => 1000 + i * 37 + j * 123))}, "number"), Col("Status", ${quote(Array.from({ length: 10 }, (_, j) => j % 3 ? "Active" : "Review"))}, "string")])`,
      );
    }
    children.push(`${id}form`);
    definitions.push(
      `${id}form = Form(${quote(`question${i}`)}, ${id}buttons, [${id}control])`,
      `${id}control = FormControl("Follow-up question", Input(${quote(`question${i}`)}, "Ask about these results", "text"), "Edit when streaming completes")`,
      `${id}buttons = Buttons([Button("Explore results", null, "primary"), Button("Save view", null, "secondary")])`,
    );
  }
  return `root = Card([${children.join(", ")}])\n${definitions.join("\n")}\n`;
}

export interface BenchContentProps {
  scenario: Scenario | string;
  response: string;
  isStreaming: boolean;
  accent?: string;
}

export function BenchContent({ scenario, response, isStreaming, accent }: BenchContentProps) {
  const lightTheme = useMemo(() => accent ? { interactiveAccentDefault: accent } : undefined, [accent]);
  return (
    <ThemeProvider lightTheme={lightTheme}>
      <div data-real-openui-workload={scenario}>
        <Renderer response={response} library={benchmarkLibrary} isStreaming={isStreaming} />
      </div>
    </ThemeProvider>
  );
}
