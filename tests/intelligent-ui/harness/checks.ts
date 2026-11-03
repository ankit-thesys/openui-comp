import type { Page } from "@playwright/test";
import { pageChecks } from "./page-checks";
import type { HostState } from "./state";

/**
 * The automatic failures, in one place. Each check looks at one rendered program and returns the
 * problems it found, as sentences for the report; an empty list is a pass. #201 adds overflow,
 * bad text values and broken media here; #203 adds the interaction and streaming checks.
 */
export type Rendered = {
  page: Page;
  state: HostState;
  /** Console errors and uncaught exceptions logged while the program rendered. */
  console: string[];
};

export type Check = { name: string; run: (rendered: Rendered) => string[] | Promise<string[]> };

export const checks: Check[] = [
  {
    name: "host",
    run: ({ state }) => state.hostErrors,
  },
  {
    name: "parses",
    run: ({ state }) => {
      if (!state.parse) return ["the Renderer never reported a parse"];
      const { meta, hasRoot } = state.parse;
      return [
        ...(hasRoot ? [] : ["no root"]),
        ...(meta.incomplete ? ["the parser says the program is incomplete"] : []),
        ...meta.errors.map((error) => `parse error: ${JSON.stringify(error)}`),
        ...meta.unresolved.map((name) => `unresolved reference: ${name}`),
        ...meta.orphaned.map((name) => `orphaned statement: ${name}`),
      ];
    },
  },
  {
    name: "no render errors",
    run: ({ state }) => state.renderErrors.map((error) => `render error: ${error}`),
  },
  {
    name: "no console errors",
    run: ({ console }) => console.map((message) => `console error: ${message}`),
  },
  // Layout, text values and media: what a reader would see as broken (#201).
  ...pageChecks,
];

/** Starts collecting console errors and uncaught exceptions; call before the page loads. */
export function watchConsole(page: Page) {
  const logged: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") logged.push(message.text());
  });
  page.on("pageerror", (error) => logged.push(`uncaught: ${error.message}`));
  return logged;
}
