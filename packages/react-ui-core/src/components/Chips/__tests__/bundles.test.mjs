import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
const consumer = process.env.CORE_CONSUMER
  ? path.resolve(process.env.CORE_CONSUMER)
  : fileURLToPath(new URL("../../../../", import.meta.url));
const { build } = createRequire(
  path.resolve(process.env.CORE_BROWSER_TOOLS || consumer, "package.json"),
)("esbuild");
async function bundle(name) {
  const result = await build({
    stdin: { contents: `export {${name}} from "@openuidev/react-ui-core";`, resolveDir: consumer },
    bundle: true,
    write: false,
    minify: true,
    metafile: true,
    format: "esm",
    platform: "browser",
    external: ["react", "react-dom", "react/jsx-runtime"],
  });
  return {
    text: result.outputFiles[0].text,
    inputs: Object.values(result.metafile.outputs).flatMap((output) =>
      Object.entries(output.inputs)
        .filter(([, v]) => v.bytesInOutput > 0)
        .map(([name]) => name),
    ),
  };
}
for (const [name, excluded] of Object.entries({
  Button: ["Calendar", "Chips", "DatePicker", "Select", "Slider"],
  IconButton: [
    "Button",
    "Calendar",
    "DatePicker",
    "Select",
    "Slider",
    "CheckBoxGroup",
    "RadioGroup",
    "SwitchGroup",
    "ThemeProvider",
  ],
  CheckBoxItem: [
    "Button",
    "Calendar",
    "DatePicker",
    "Select",
    "Slider",
    "RadioGroup",
    "SwitchGroup",
    "ThemeProvider",
  ],
  Chips: ["Calendar", "DatePicker", "Select", "Slider", "ThemeProvider"],
  Slider: ["Calendar", "DatePicker", "Select", "SliderBlock", "ThemeProvider"],
})) {
  test(`${name}-only root import excludes unrelated control modules and styles`, async () => {
    const result = await bundle(name);
    assert(
      result.inputs.some((file) => file.includes(`/components/${name}/${name}.mjs`)),
      name + " retained",
    );
    for (const other of excluded)
      assert(
        !result.inputs.some(
          (file) =>
            file.includes(`/components/${other}/`) ||
            file.includes(`/components/Slider/${other}.mjs`),
        ),
        other + " excluded",
      );
    for (const other of excluded.filter((value) => value !== "ThemeProvider"))
      assert(
        !result.text.includes(
          "openui-" +
            other.replace(/[A-Z]/g, (letter, index) => (index ? "-" : "") + letter.toLowerCase()),
        ),
        other + " styles excluded",
      );
  });
}
