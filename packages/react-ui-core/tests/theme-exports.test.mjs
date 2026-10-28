import * as core from "@openuidev/react-ui-core";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

test("root exports retain theme helpers and immutable defaults without public contexts", () => {
  for (const name of [
    "ThemeProvider",
    "useTheme",
    "createTheme",
    "useSystemThemeMode",
    "useThemeModePreference",
    "swatch",
    "swatchToken",
    "withAlpha",
  ])
    assert.equal(typeof core[name], "function", name);
  assert(Object.isFrozen(core.defaultLightTheme));
  assert(Object.isFrozen(core.defaultDarkTheme));
  const theme = {
    interactiveAccentDefault: "oklch(0.6 0.2 260 / 1)",
    barChartPalette: ["#123456"],
  };
  assert.equal(core.createTheme(theme), theme);
  assert.equal(core.THEME_MODE_ATTRIBUTE, "data-openui-theme");
  assert.equal(core.THEME_MODE_STORAGE_KEY, "openui-theme-mode");
  assert.equal(core.swatchToken("blue-500"), core.swatch("blue", 500));
  assert.equal("ThemeContext" in core, false);
  assert.equal("InternalContext" in core, false);
});

test("CommonJS root exposes the same public names", () => {
  const require = createRequire(import.meta.url);
  assert.deepEqual(
    Object.keys(require("@openuidev/react-ui-core")).sort(),
    Object.keys(core).sort(),
  );
  assert.throws(() => require("@openuidev/react-ui-core/ThemeProvider"), {
    code: "ERR_PACKAGE_PATH_NOT_EXPORTED",
  });
});
