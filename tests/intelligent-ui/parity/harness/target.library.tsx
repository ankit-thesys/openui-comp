// The library side of the parity run: only the package's root exports, resolved through its
// package.json to the built `dist`, and the test package's host's own mock Query tools.
import { library } from "@openuidev/intelligent-ui-library";
import { ThemeProvider } from "@openuidev/react-components";
import type { ReactNode } from "react";

export { demoTools } from "../../host/mock-tools.ts";
export { library };

/**
 * The library has no actions of its own since ce5fbf80 (the source app still copies to the
 * clipboard), so on this side every action is passed on, as `null` tells the entry.
 */
export const runLibraryAction = (_event: unknown): Promise<boolean> | null => null;

/**
 * The provider the test package's host gives the library: react-components' ThemeProvider for the
 * mode. `?host=plain` leaves it out.
 */
export function Provider({ mode, children }: { mode: "light" | "dark"; children: ReactNode }) {
  return <ThemeProvider mode={mode}>{children}</ThemeProvider>;
}

// The page colours itself from react-components' tokens, as a host page does.
export const vars = {
  canvas: "--openui-foreground",
  ink: "--openui-text-neutral-primary",
  font: "--openui-font-body",
};
