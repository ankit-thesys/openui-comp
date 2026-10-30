import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { expect, it } from "vitest";
import { orderReport, type Provenance } from "../css-snapshot/order";
import type { Collection } from "../css-snapshot/snapshot";

const capture = process.env["OPENUI_CSS_CAPTURE"];
it.skipIf(!capture)(
  "reports every cross-module element and overlapping declaration property",
  () => {
    const provenance: Provenance = JSON.parse(readFileSync(`${capture}/provenance.json`, "utf8"));
    const files = readdirSync(capture!).filter(
      (file) => file !== "provenance.json" && file.endsWith(".json"),
    );
    expect(files).toContain("server.json");
    for (const file of files) {
      const collections: Record<string, Collection> = JSON.parse(
        readFileSync(`${capture}/${file}`, "utf8"),
      );
      writeFileSync(
        `${capture}/order-${file.replace(".json", ".md")}`,
        orderReport(collections, provenance),
      );
    }
  },
);
