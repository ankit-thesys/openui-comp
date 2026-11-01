import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const entry = fileURLToPath(new URL("./test/support/entry.ts", import.meta.url));

export default defineConfig({
  resolve: {
    // Only the bare entry: the component library has no subpath exports.
    alias: [{ find: /^@openuidev\/react-components$/, replacement: entry }],
  },
  plugins: [
    {
      // Without server rendering, css.ts exports no way to read its rules. Expose them to tests.
      name: "openui-test-sheet",
      transform(code, id) {
        if (!/packages\/react-components\/dist\/styles\/css\.mjs$/.test(id)) return;
        return `${code}\nexport const __openuiTestSheet = (options = {}) => wrap(store.rules, options.layer ?? store.layer) || " ";\n`;
      },
    },
  ],
  test: {
    // Browser specs under test/browser run with Playwright, not vitest.
    include: ["test/unit/**/*.test.{ts,tsx}"],
    // Server rendering is not in this build; these test only it.
    exclude: ["test/unit/componentStyles.test.tsx", "test/unit/styles-entry.test.tsx"],
  },
});
