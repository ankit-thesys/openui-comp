// Independent checks for the fixed three-category chart variant fixtures.
const contracts = {
  "bar-chart-variants": { label: "Bar chart", marks: 6 },
  "line-chart-variants": { label: "Line chart", marks: 2 },
  "area-chart-variants": { label: "Area chart", marks: 2 },
  "horizontal-bar-chart-variants": { label: "Horizontal bar chart", marks: 6 },
  "pie-chart-variants": { label: "Pie chart", marks: 3 },
};
export function chartVariantAssertions(c, probes) {
  const contract = contracts[c.id];
  if (!contract || !c.variants) return [];
  const n = c.variants.length;
  const rendered = probes.map(
    (p) =>
      p.semantics.filter((e) => e.role === "img" && e.name === contract.label)
        .length,
  );
  const marks = probes.map(
    (p) =>
      p.geometry.filter(
        (e) => /:(path|rect)$/.test(e.key) && e.width > 0 && e.height > 0,
      ).length,
  );
  const labels = probes.map((p) =>
    Object.fromEntries(
      ["Jan", "Feb", "Mar"].map((label) => [
        label,
        (p.text.match(new RegExp("\\b" + label + "\\b", "g")) ?? []).length,
      ]),
    ),
  );
  return [
    {
      id: "chart-variants.rendered",
      expected: [n, n],
      actual: rendered,
      pass: rendered.length === 2 && rendered.every((count) => count === n),
    },
    {
      id: "chart-variants.marks",
      expected: { minimumPerArm: contract.marks * n },
      actual: marks,
      pass:
        marks.length === 2 &&
        marks.every((count) => count >= contract.marks * n),
    },
    {
      id: "chart-variants.data-labels",
      expected: { minimumEachLabelPerArm: n, labels: ["Jan", "Feb", "Mar"] },
      actual: labels,
      pass:
        labels.length === 2 &&
        labels.every((arm) => Object.values(arm).every((count) => count >= n)),
    },
  ];
}
