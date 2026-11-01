// Paths outside this package: the library it tests and the workspace's react-ui, which the benches
// compare against. Tests, scripts and fixture setup reach them only through here (`#paths`).
import { fileURLToPath } from "node:url";

export const libraryRoot = new URL("../../packages/react-components/", import.meta.url);
export const reactUiRoot = new URL("../../packages/react-ui/", import.meta.url);

/** Absolute path of `path` inside the library. */
export const library = (path = "") => fileURLToPath(new URL(path, libraryRoot));
/** Absolute path of `path` inside react-ui. */
export const reactUi = (path = "") => fileURLToPath(new URL(path, reactUiRoot));
