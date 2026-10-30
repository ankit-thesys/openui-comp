// Diagnostic metadata only. Snapshots render the public entry and read its public sheet; this
// scan identifies the source of a hash, which neither public markup nor CSS can tell us. It
// compiles the built modules into an isolated Goober target without changing the library sheet.
import { libraryRoot } from "#paths";
import { readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

export async function styleProvenance() {
  const require = createRequire(new URL("package.json", libraryRoot));
  const { css } = require("goober");
  const compile = css.bind({ target: { data: "" } });
  const owners = new Map();
  const contexts = new Map();
  const add = (name, module) => {
    if (!/^go\d+$/.test(name)) return;
    const modules = owners.get(name) ?? new Set();
    modules.add(module);
    owners.set(name, modules);
  };
  const root = new URL("dist/components/", libraryRoot);
  const rootPath = fileURLToPath(root);
  const visit = async (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const url = new URL(entry.isDirectory() ? `${entry.name}/` : entry.name, dir);
      if (entry.isDirectory()) await visit(url);
      else if (entry.name.endsWith(".styles.mjs")) {
        const module = fileURLToPath(url).slice(rootPath.length);
        const exports = await import(url.href);
        const touched = new Map();
        const tag = (strings, ...values) => {
          const name = compile(strings, ...values);
          const caller = new Error().stack
            ?.split("\n")
            .find((line) => line.includes(".styles.mjs:"));
          const source = caller?.match(/([^\s(]+\.styles\.mjs):\d+:\d+/)?.[1];
          const origin = source ? source.replace(/^file:\/\//, "").slice(rootPath.length) : module;
          add(name, origin);
          const modules = touched.get(name) ?? new Set();
          modules.add(origin);
          touched.set(name, modules);
          return name;
        };
        const stableValues = (value) =>
          typeof value === "string" ? [value] : Object.values(value ?? {}).flatMap(stableValues);
        for (const [name, value] of Object.entries(exports)) {
          if (name === "names") continue;
          touched.clear();
          const result = typeof value === "function" ? value(tag) : value;
          const walk = (item) => {
            if (typeof item === "string" && /^go\d+$/.test(item)) {
              const sources = touched.get(item) ?? new Set([module]);
              const byModule = contexts.get(item) ?? new Map();
              for (const origin of sources) {
                add(item, origin);
                const targets = byModule.get(origin) ?? new Set();
                for (const target of stableValues(exports.names)) targets.add(target);
                // BarChart's empty horizontal branch uses the vertical root's rule with the
                // horizontal public name. The two style modules intentionally share this target.
                if (origin === "Charts/BarChart/barChart.styles.mjs")
                  targets.add("openui-horizontal-bar-chart");
                byModule.set(origin, targets);
              }
              contexts.set(item, byModule);
            } else if (item && typeof item === "object") {
              Object.values(item).forEach(walk);
            }
          };
          walk(result);
        }
      }
    }
  };
  await visit(root);
  return Object.fromEntries(
    [...owners].map(([name, modules]) => [
      name,
      [...modules].sort().map((module) => ({
        module,
        stableClasses: [...(contexts.get(name)?.get(module) ?? [])].sort(),
      })),
    ]),
  );
}
