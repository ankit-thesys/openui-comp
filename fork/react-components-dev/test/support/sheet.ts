// Fork-only test reader for builds without server rendering: the registered rules that
// getComponentStyles returned on the server branch, read from css.ts. vitest.config.ts and
// build-fixtures.ts add the export; a namespace import keeps other loaders (Playwright) linking.
import type { ConfigureStylesOptions } from "@openuidev/react-components";
import * as sheet from "../../../../packages/react-components/dist/styles/css.mjs";

type Reader = (options?: ConfigureStylesOptions) => string;

export const getComponentStyles = (options?: ConfigureStylesOptions): string => {
  const read = (sheet as { __openuiTestSheet?: Reader }).__openuiTestSheet;
  if (!read) throw new Error("Load css.mjs through the openui-test-sheet transform.");
  return read(options);
};
