import test from "node:test";
import assert from "node:assert/strict";
import {
  verdict,
  summarize,
  compareLayer,
  classifyKnown,
  matrix,
  rendererNoticesPass,
} from "../bench/model.mjs";
import { htmlReport } from "../bench/report.mjs";
test("deliberate mismatches stay in their actual layer and never pass", () => {
  const layers = {
    behavior: { status: "Pass" },
    semantics: compareLayer("wrong", "right", "text"),
    layout: compareLayer({ x: 1 }, { x: 2 }, "geometry"),
    screenshot: { status: "Review" },
  };
  assert.equal(layers.semantics.differences[0].path, "text");
  assert.equal(layers.layout.status, "Fail");
  assert.equal(verdict(layers), "Fail");
  assert.equal(verdict({ screenshot: { status: "Review" } }), "Review");
});
test("known signatures are exact, unexpected failures remain failures", () => {
  const issue = { id: "old-bug", assertionIds: ["click"], actual: [0, 0] };
  const base = () => ({
    behavior: {
      status: "Fail",
      assertions: [{ id: "click", pass: false, actual: [0, 0] }],
    },
  });
  assert.equal(classifyKnown(base(), [issue]).behavior.status, "Known issue");
  const other = base();
  other.behavior.assertions.push({ id: "other", pass: false, actual: [1, 0] });
  assert.equal(classifyKnown(other, [issue]).behavior.status, "Fail");
  assert.equal(verdict(classifyKnown(base(), [issue])), "Known issue");
});
test("missing, cancelled and unimplemented assertions never become green", () => {
  assert.equal(
    summarize([{ verdict: "Pass", executed: true }], 2).verdict,
    "Not covered",
  );
  assert.equal(
    verdict({ behavior: { status: "Pass" } }, { cancelled: true }),
    "Not covered",
  );
  assert.equal(verdict({ behavior: { status: "Not covered" } }), "Not covered");
  assert.equal(
    matrix([{ id: "x", deliveries: ["instant", "stream"] }], "full").length,
    60,
  );
});
test("exports escape hostile case/source/action strings", () => {
  const bad = '<script>alert("private")</script>';
  const html = htmlReport({
    id: bad,
    status: "incomplete",
    provenance: { note: bad },
    results: [
      {
        cell: { id: bad, caseId: "x" },
        verdict: "Fail",
        layers: { behavior: { actual: bad } },
        images: [],
      },
    ],
    cases: [{ id: "x", source: bad }],
  });
  assert(!html.includes("<script>"));
  assert(html.includes("&lt;script&gt;"));
  assert(html.includes("Missing evidence"));
});

test("renderer notice oracle passes clean arms and fails either actual error", () => {
  assert.equal(rendererNoticesPass([[], []]), true);
  assert.equal(rendererNoticesPass([["Parse error"], []]), false);
  assert.equal(rendererNoticesPass([[], ["Missing component"]]), false);
});

test("recorded cancellation placeholders do not mean execution completed", () => {
  const summary = summarize(
    [
      { executed: true, verdict: "Pass" },
      { executed: false, verdict: "Not covered" },
    ],
    2,
  );
  assert.equal(summary.complete, false);
  assert.equal(summary.recordedComplete, true);
  assert.equal(summary.verdict, "Not covered");
});
