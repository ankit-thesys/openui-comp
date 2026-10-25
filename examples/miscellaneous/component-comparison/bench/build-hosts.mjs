import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import postcss from "postcss";
import tailwind3 from "tailwindcss3";
import tailwind4 from "@tailwindcss/postcss";
const out = new URL("../public/bench-host/", import.meta.url);
await fs.mkdir(out, { recursive: true });
const utilities =
  "text-sm font-medium bg-red-500 text-blue-600 p-4 rounded-lg border flex gap-4 disabled:cursor-not-allowed hover:bg-red-600";
const input3 = "@tailwind base;\n@tailwind components;\n@tailwind utilities;";
const input4 =
  '@import "tailwindcss" source(none);\n@source inline("' + utilities + '");';
const css3 = (
  await postcss([
    tailwind3({
      content: [{ raw: utilities, extension: "html" }],
      corePlugins: {},
      theme: { extend: {} },
    }),
  ]).process(input3, { from: undefined })
).css;
const css4 = (
  await postcss([
    tailwind4({ base: import.meta.dirname, optimize: true }),
  ]).process(input4, {
    from: new URL("../bench-host-input.css", import.meta.url).pathname,
  })
).css;
const contents = {
  plain:
    "/* Plain application CSS; no framework and no disabled preflight. */\nbody { margin:0; font-family:system-ui,sans-serif; }\nbutton,input,textarea,select { font:inherit; }\n",
  tailwind3: css3,
  tailwind4: css4,
};
const manifest = {
  builders: { tailwind3: "3.4.17", tailwind4: "4.1.18", postcss: "8.5.8" },
  source: { input3, input4, utilities },
  files: {},
};
for (const [name, css] of Object.entries(contents)) {
  await fs.writeFile(new URL(name + ".css", out), css);
  manifest.files[name] = {
    sha256: createHash("sha256").update(css).digest("hex"),
    bytes: Buffer.byteLength(css),
  };
}
await fs.writeFile(
  new URL("manifest.json", out),
  JSON.stringify(manifest, null, 2) + "\n",
);
console.log(
  "Built genuine pinned Tailwind3/Tailwind4 fixtures",
  manifest.files,
);
