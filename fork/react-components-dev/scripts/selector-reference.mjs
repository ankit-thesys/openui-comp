// Generates the library's docs/reference/selectors.md, public documentation that ships upstream,
// from the `names` constant each component's style module exports (its stable classes). Reads the
// built library: build it first.
//   pnpm docs:selectors        write the reference
// test/unit/contract/reference.test.ts fails when the committed file drifts from this output.
import { libraryRoot } from "#paths";
import { readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const components = new URL("dist/components/", libraryRoot);
const output = new URL("docs/reference/selectors.md", libraryRoot);

/**
 * Stable names of every built style module that exports `names`, in path order. `component` is the
 * module's folder under dist/components (nested folders included, such as "Charts/BarChart"), and
 * `module` is its file name without `.styles.mjs`.
 */
export async function readStableNames() {
  const found = [];
  const visit = async (dir, folder) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const url = new URL(entry.isDirectory() ? `${entry.name}/` : entry.name, dir);
      if (entry.isDirectory()) await visit(url, folder ? `${folder}/${entry.name}` : entry.name);
      else if (entry.name.endsWith(".styles.mjs")) {
        const { names } = await import(url.href);
        if (names)
          found.push({
            component: folder,
            module: entry.name.slice(0, -".styles.mjs".length),
            names,
          });
      }
    }
  };
  await visit(components, "");
  return found;
}

const code = (text) => `\`${text}\``;
// Shared internals (ADR Q19): classes one module family owns and other families render. They keep
// the owning family's name (the shared base, the skeleton pulse and the `openui-chart-*` family).
const sharedInternal = (name) =>
  name === "openui-border-box" ||
  name === "openui-skeleton-pulse" ||
  name.startsWith("openui-chart-");
const prop = (axis, value, name) => {
  const modifier = name.split("--")[1];
  if (value === "true") {
    const propName = modifier.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    return code(`${propName}={true}`);
  }
  const suffix = String(value).replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  const classAxis = modifier?.endsWith(`-${suffix}`) ? modifier.slice(0, -suffix.length - 1) : axis;
  const propName = classAxis.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  return code(`${propName}="${value}"`);
};

/** The reference markdown for `entries` from `readStableNames`. */
export function renderSelectorReference(entries) {
  const perFolder = new Map();
  for (const { component } of entries)
    perFolder.set(component, (perFolder.get(component) ?? 0) + 1);
  const sections = entries.map(({ component, module, names }) => {
    // A folder with several style modules gets one section per module, named by its component.
    const member = module.charAt(0).toUpperCase() + module.slice(1);
    const heading =
      perFolder.get(component) > 1 && member !== component ? `${component} (${member})` : component;
    const rows = [];
    for (const [key, value] of Object.entries(names)) {
      if (typeof value === "string") {
        const kind = key === "root" ? "Root" : `Part (${code(key)})`;
        rows.push(
          `| ${code(`.${value}`)} | ${sharedInternal(value) ? `${kind}, shared internal` : kind} | ${key === "root" ? "Always" : "On that part, whenever it renders"} |`,
        );
      }
    }
    for (const [axis, values] of Object.entries(names)) {
      if (typeof values === "string") continue;
      for (const [value, name] of Object.entries(values)) {
        rows.push(`| ${code(`.${name}`)} | Modifier | ${prop(axis, value, name)} |`);
      }
    }
    return [
      `## ${heading}`,
      "",
      "| Stable class | Kind | Present when |",
      "| --- | --- | --- |",
      ...rows,
    ].join("\n");
  });
  return [
    "# Stable classes",
    "",
    "<!-- Generated from each component's stable class names. Do not edit by hand. -->",
    "",
    "Every class below is a public override target: one class, so a consumer rule on it wins over the",
    "library's rule (add the same state, such as `:hover` or `[data-state=active]`, to restyle a state).",
    "A root is always present and a part whenever its element renders; a modifier is present when the",
    "prop has that value, including its default. Every component follows this convention; the states",
    "each family's library rules use are listed in the [package README](../../README.md#stable-selectors).",
    "",
    "A shared internal is a class one module family owns and other families render: the shared",
    "`.openui-border-box` base, the `.openui-skeleton-pulse` animation and the `openui-chart-*` chart",
    "foundations. It keeps the owning family's name, so it is not prefixed by the component that",
    "renders it, and it is a public override target like any other class.",
    "",
    ...sections.flatMap((section) => [section, ""]),
  ].join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(output, renderSelectorReference(await readStableNames()));
  console.log(`wrote ${fileURLToPath(output)}`);
}
