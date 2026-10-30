// Shared checks for the Node and live-browser contract collections (ADR 0001, Q14).
import { library } from "#paths";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dist = library("dist/");
export const clientCode = (readdirSync(dist, { recursive: true }) as string[])
  .filter((file) => /\.m?js$/.test(file))
  .map((file) => readFileSync(join(dist, file), "utf8"))
  .join("\n");

// Shared chart parts set `--_<stable part class>-<property>` through `partVariable(className,
// "<property>")` or `partVariables(className, { <property>: … })`, so dist holds only the
// property. Accept a variable when it is a stable class plus a property the helper is called with.
export const helperProperties = new Set([
  ...[...clientCode.matchAll(/\bpartVariable\([^,()]+,\s*"([\w-]+)"\)/g)].map((m) => m[1]!),
  ...[...clientCode.matchAll(/\bpartVariables\([^,()]+,\s*\{([^}]*)\}/g)].flatMap(([, body]) =>
    [...body!.matchAll(/(?:^|,)\s*"?([a-z][\w-]*)"?\s*:/g)].map((m) => m[1]!),
  ),
]);

export const publicKeyframesIn = (sheet: string) =>
  [...sheet.matchAll(/@(?:-webkit-)?keyframes\s+(?:([\w-]+)|"([^"]+)"|'([^']+)')/g)]
    .map((match) => match[1] ?? match[2] ?? match[3]!)
    .filter((name) => !/^(--)?_openui-/.test(name));

export function unsetPrivateVariables(
  css: string,
  everything: string,
  stableClasses: ReadonlySet<string>,
): string[] {
  const declared = new Set([...everything.matchAll(/(--_openui-[\w-]+)\s*:/g)].map((m) => m[1]));
  const setByHelper = (name: string) =>
    [...helperProperties].some((property) => {
      const suffix = `-${property}`;
      return (
        name.endsWith(suffix) &&
        name.startsWith("--_") &&
        stableClasses.has(name.slice(3, -suffix.length))
      );
    });
  return [
    ...new Set([...css.matchAll(/var\((--_openui-[\w-]+)/g)].map((match) => match[1]!)),
  ].filter(
    (name) => !declared.has(name) && !clientCode.includes(`"${name}"`) && !setByHelper(name),
  );
}
