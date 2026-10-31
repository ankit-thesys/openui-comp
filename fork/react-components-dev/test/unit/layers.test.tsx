// Public built-package seam: configuration wraps the whole sheet, independent of registration.
import {
  Button,
  configureStyles,
  css,
  getComponentStyles,
  keyframes,
  ThemeProvider,
  type ConfigureStylesOptions,
} from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { rulesOf } from "./contract/checks";

const registerImported = () => css`
  color: rgb(21, 43, 65);
`;
const imported = registerImported();

afterEach(() => configureStyles({ layer: undefined }));

it("wraps rules registered before configuration in one app-wide layer", () => {
  expect(getComponentStyles()).toContain(`.${imported}{color:rgb(21, 43, 65);}`);
  configureStyles({ layer: "openui" });
  const sheet = getComponentStyles();
  expect(sheet).toMatch(/^@layer openui\{/);
  expect(sheet.match(/@layer /g)).toHaveLength(1);
  expect(sheet).toContain(`.${imported}{color:rgb(21, 43, 65);}`);
  expect(sheet.endsWith("}}")).toBe(true);
});

it("ignores invalid layer names with a development warning, preserving the configured sheet", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    configureStyles({ layer: "app.openui" });
    const sheet = getComponentStyles();
    expect(sheet).toMatch(/^@layer app\.openui\{/);
    for (const layer of ["open ui", "openui{", "", "a,b", "1openui"]) {
      configureStyles({ layer });
      expect(getComponentStyles()).toBe(sheet);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining(`layer "${layer}"`));
    }
  } finally {
    warn.mockRestore();
  }
});

it("switches the whole sheet to unlayered and back without changing any classes or rules", () => {
  const html = renderToString(<Button>Save</Button>);
  const unlayered = getComponentStyles();
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    const options: ConfigureStylesOptions = { layer: "openui" };
    configureStyles(options);
    expect(getComponentStyles()).toBe(`@layer openui{${unlayered}}`);
    expect(renderToString(<Button>Save</Button>)).toBe(html);
    configureStyles({ layer: undefined });
    expect(getComponentStyles()).toBe(unlayered);
    configureStyles({ layer: "app.components" });
    expect(getComponentStyles()).toBe(`@layer app.components{${unlayered}}`);
    expect(registerImported()).toBe(imported);
    expect(warn).toHaveBeenCalledTimes(3);
  } finally {
    warn.mockRestore();
  }
});

it("puts later rules and keyframes in the same wrapper, outside and inside nested providers", () => {
  configureStyles({ layer: "openui" });
  const animation = keyframes`from { opacity: 0.21; } to { opacity: 0.79; }`;
  const lazy = css`
    animation: ${animation} 3s linear;
  `;
  const outside = renderToString(<Button>Save</Button>);
  const nested = renderToString(
    <ThemeProvider>
      <ThemeProvider>
        <Button>Save</Button>
      </ThemeProvider>
    </ThemeProvider>,
  );
  expect(nested).toContain(outside);
  const sheet = getComponentStyles();
  expect(sheet.match(/@layer /g)).toHaveLength(1);
  expect(sheet).toContain(`.${lazy}{animation:${animation} 3s linear;}`);
  expect(sheet).toContain(`@keyframes ${animation}{from{opacity:0.21;}to{opacity:0.79;}}`);
  expect(rulesOf(sheet).length).toBeGreaterThan(0);
  expect(rulesOf(sheet).every((rule) => rule.layer === "openui")).toBe(true);
  expect(sheet).not.toContain("openui-defaults");
});

it("leaves the default sheet unlayered for an invalid name and suppresses warnings in production", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const sheet = getComponentStyles();
  try {
    configureStyles({ layer: "invalid layer" });
    expect(getComponentStyles()).toBe(sheet);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockClear();
    vi.stubEnv("NODE_ENV", "production");
    configureStyles({ layer: "invalid layer" });
    expect(getComponentStyles()).toBe(sheet);
    expect(warn).not.toHaveBeenCalled();
  } finally {
    vi.unstubAllEnvs();
    warn.mockRestore();
  }
});
