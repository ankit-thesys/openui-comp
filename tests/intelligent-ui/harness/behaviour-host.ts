import { test } from "@playwright/test";
import type { Host } from "./matrix";

/** The host the spec is running on: its Playwright project's entry in harness/matrix.ts. */
export const currentHost = () => test.info().project.metadata["host"] as Host;

/**
 * #203's behaviour specs run once per React version, on the light desktop host with the library's
 * ThemeProvider. How a page looks across themes, widths and without the provider is the sweep's
 * job (#201); what a click or a keypress does doesn't change with them.
 */
export function onlyOnBehaviourHosts() {
  const host = currentHost();
  test.skip(
    host.theme !== "light" || !host.provider || host.width !== 1280,
    "behaviour runs on the light desktop host of each React version",
  );
}
