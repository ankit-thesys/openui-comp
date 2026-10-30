// Demo tools are internal: the kit only exports their specs. The source app passes the same ones.
export { demoTools } from "../../../lib/demo-data";
export { library, runLibraryAction } from "../../../lib";
export { ThemeProvider as Provider } from "@openuidev/react-components";

export const vars = {
  canvas: "--openui-intelligent-canvas",
  ink: "--openui-intelligent-ink",
  font: "--openui-intelligent-font",
};
