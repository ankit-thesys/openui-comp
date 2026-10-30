const ORDINALS = [
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
  "seventh",
  "eighth",
  "ninth",
];

/**
 * Checks every claim the system prompt makes about argument order against the signatures the same
 * prompt publishes. openui-lang is positional and a schema often accepts the wrong type in the wrong
 * slot without an error, so a wrong parameter list in a rule fails silently.
 */
export function lintPrompt(prompt: string) {
  const lines = prompt.split("\n");

  const signatures = new Map<string, string[]>();
  for (const line of lines) {
    const match = /^([A-Z][A-Za-z]+)\((.*?)\)(?: —|$)/.exec(line);
    if (!match) continue;
    const params = match[2]
      ? match[2].split(/,\s*(?![^{]*})/).map((p) => p.split(":")[0]!.replace("?", "").trim())
      : [];
    signatures.set(match[1]!, params);
  }

  const problems: string[] = [];
  let checked = 0;

  for (const line of lines) {
    if (/^[A-Z][A-Za-z]+\(/.test(line)) continue;

    // Parameter lists written in prose: Name(a, b?, c?). Aliases are fine; a real parameter at the
    // wrong index, or a list longer than the signature, is not.
    for (const [, name, list] of line.matchAll(
      /\b([A-Z][A-Za-z]+)\(([a-z][A-Za-z]*\??(?:,\s*[a-z][A-Za-z]*\??)+)\)/g,
    )) {
      const real = signatures.get(name!);
      if (!real) continue;
      checked++;
      const claimed = list!.split(/,\s*/).map((p) => p.replace("?", ""));
      const misplaced = claimed.some((p, i) => real.includes(p) && real.indexOf(p) !== i);
      if (misplaced || claimed.length > real.length) {
        problems.push(`${name}(${claimed.join(", ")}) vs ${name}(${real.join(", ")})`);
      }
    }

    // Ordinal claims: `height "x" as the fifth Name argument`.
    for (const [, param, ordinal, name] of line.matchAll(
      /(\w+) "[^"]*" as the (\w+) ([A-Z][A-Za-z]+) argument/g,
    )) {
      const real = signatures.get(name!);
      if (!real) continue;
      checked++;
      if (ORDINALS.indexOf(ordinal!) !== real.indexOf(param!)) {
        problems.push(`${param} claimed as the ${ordinal} ${name} argument`);
      }
    }
  }

  return { checked, problems, signatures };
}
