// Hydrates the server-rendered bench app and records every error React reports while doing so.
import { hydrateRoot } from "react-dom/client";
import { makeApp, type Mode } from "./bench-app";

export interface HydrationReport {
  recoverable: string[];
  caught: string[];
  uncaught: string[];
  done: boolean;
}

declare global {
  interface Window {
    __hydration: HydrationReport;
  }
}

const describe = (error: unknown, info?: { componentStack?: string }) =>
  `${String((error as Error)?.message ?? error)}${
    info?.componentStack ? `\n${info.componentStack.split("\n").slice(0, 6).join("\n")}` : ""
  }`;

export function hydrateBench(m: unknown) {
  const App = makeApp(m);
  const root = document.getElementById("root")!;
  const report: HydrationReport = { recoverable: [], caught: [], uncaught: [], done: false };
  window.__hydration = report;
  hydrateRoot(root, <App initialMode={(root.dataset["mode"] as Mode) ?? "light"} />, {
    onRecoverableError: (error, info) => report.recoverable.push(describe(error, info)),
    onCaughtError: (error, info) => report.caught.push(describe(error, info)),
    onUncaughtError: (error, info) => report.uncaught.push(describe(error, info)),
  });
  // Effects and the first paint have run by then.
  requestAnimationFrame(() => setTimeout(() => (report.done = true), 300));
}
