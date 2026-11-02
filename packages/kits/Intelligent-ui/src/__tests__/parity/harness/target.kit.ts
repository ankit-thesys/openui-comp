// Demo tools are internal: the kit only exports their specs. The source app passes the same ones.
export { demoTools } from "../../../lib/demo";
export { library, runLibraryAction } from "../../../lib";
export { ThemeProvider as Provider } from "@openuidev/react-components";

// The page colours itself from ThemeProvider's tokens, as a host page does: the kit sets no variables of its own.
export const vars = {
  canvas: "--openui-foreground",
  ink: "--openui-text-neutral-primary",
  font: "--openui-font-body",
};
