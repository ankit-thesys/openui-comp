import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

it("warns in development when configuration changes after returning server rules", async () => {
  vi.resetModules();
  const { configureStyles, getComponentStyles } = await import("@openuidev/react-components");
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.stubEnv("NODE_ENV", "development");

  configureStyles({ layer: "openui" });
  expect(warn).not.toHaveBeenCalled();
  expect(getComponentStyles()).toMatch(/^@layer openui\{/);
  configureStyles({ layer: "openui" });
  expect(warn).not.toHaveBeenCalled();

  configureStyles({ layer: "app.components" });
  expect(warn).toHaveBeenCalledExactlyOnceWith(
    expect.stringContaining("configureStyles was called after component rules were written"),
  );
  expect(getComponentStyles()).toMatch(/^@layer app\.components\{/);
  warn.mockClear();
  configureStyles({ layer: undefined });
  expect(warn).toHaveBeenCalledOnce();
  expect(getComponentStyles()).not.toMatch(/^@layer /);
});

it("does not warn about late or invalid configuration in production", async () => {
  vi.resetModules();
  const { configureStyles, getComponentStyles } = await import("@openuidev/react-components");
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.stubEnv("NODE_ENV", "production");

  getComponentStyles();
  configureStyles({ layer: "openui" });
  configureStyles({ layer: "invalid layer" });
  configureStyles({ layer: undefined });
  expect(warn).not.toHaveBeenCalled();
});

// A server-rendered app passes the layer to <ComponentStyles>, so `configureStyles` may first run
// on a later request, when a route module that calls it is evaluated. Same layer: nothing changed.
it("does not warn when configuration matches the layer the server sheet was returned in", async () => {
  vi.resetModules();
  const { configureStyles, getComponentStyles } = await import("@openuidev/react-components");
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.stubEnv("NODE_ENV", "development");

  expect(getComponentStyles({ layer: "openui" })).toMatch(/^@layer openui\{/);
  expect(getComponentStyles({ layer: "openui" })).toMatch(/^@layer openui\{/);
  configureStyles({ layer: "openui" });
  configureStyles({ layer: "openui" });
  expect(warn).not.toHaveBeenCalled();

  configureStyles({ layer: "other" });
  expect(warn).toHaveBeenCalledExactlyOnceWith(
    expect.stringContaining("configureStyles was called after component rules were written"),
  );
});

// An unbundled browser or a CDN ESM build has no `process` global.
it("never throws without a process global", async () => {
  vi.resetModules();
  const { configureStyles, getComponentStyles } = await import("@openuidev/react-components");
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  getComponentStyles();
  vi.stubGlobal("process", undefined);
  expect(() => {
    configureStyles({ layer: "invalid layer" });
    configureStyles({ layer: "later" });
  }).not.toThrow();
  vi.unstubAllGlobals();
  expect(warn).not.toHaveBeenCalled();
});
