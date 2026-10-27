import test from "node:test";
import assert from "node:assert/strict";
import { chartVariantAssertions } from "../bench/chart-variant-oracles.mjs";
const c = { id: "bar-chart-variants", variants: [{}, {}] },
  probe = () => ({
    semantics: Array.from({ length: 2 }, () => ({
      role: "img",
      name: "Bar chart",
    })),
    geometry: Array.from({ length: 12 }, (_, i) => ({
      key: i + ":path",
      width: 10,
      height: 20,
    })),
    text: "Jan Feb Mar Jan Feb Mar",
  });
test("independent chart variant checks require actual rendered charts, marks and source labels", () => {
  assert(chartVariantAssertions(c, [probe(), probe()]).every((a) => a.pass));
  for (const field of ["semantics", "geometry", "text"]) {
    const broken = probe();
    broken[field] = field === "text" ? "Variant 1: variant=grouped" : [];
    assert(
      chartVariantAssertions(c, [broken, broken]).some((a) => !a.pass),
      field,
    );
  }
});
test("chart safeguards do not invent expectations for arbitrary exploratory cases", () => {
  assert.deepEqual(
    chartVariantAssertions({ id: "saved-response", variants: [{}, {}] }, [
      probe(),
      probe(),
    ]),
    [],
  );
});
