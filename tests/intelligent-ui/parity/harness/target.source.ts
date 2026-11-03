// Copied into a checkout of the source app by capture-source.ts, so these paths resolve there.
// @ts-nocheck
export { runLibraryAction } from "../src/lib/actions";
export { demoTools } from "../src/lib/demo-data";
export { library } from "../src/lib/library";
// The chat page gets its theme from AgentInterface, which is this provider and this stylesheet.
import "@openuidev/react-ui/styles/index.css";
export { ThemeProvider as Provider } from "@openuidev/react-ui";

export const vars = { canvas: "--iui-canvas", ink: "--iui-ink", font: "--iui-font" };
