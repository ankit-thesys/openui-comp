import test from "node:test";
import assert from "node:assert/strict";
import { reconcile } from "../bench/reconcile.mjs";
import { matrix } from "../bench/model.mjs";
test("reconciliation requires actual current case revisions and retains old failures", () => {
  const cases = [{ id: "case", version: "new", deliveries: ["instant"] }];
  const cells = matrix(cases, "full");
  const old = {
    id: "old-run",
    cases: [{ id: "case", version: "old" }],
    results: cells.map((cell) => ({
      cell,
      executed: true,
      verdict: "Fail",
      layers: { behavior: { status: "Fail" } },
    })),
  };
  const missing = reconcile(cases, [old]);
  assert.equal(missing.missing.length, 30);
  assert.equal(missing.summary.verdict, "Not covered");
  assert.equal(missing.superseded.length, 30);
  const fresh = {
    id: "new-run",
    cases,
    results: cells.map((cell) => ({
      cell,
      executed: true,
      verdict: "Known issue",
      layers: { behavior: { status: "Known issue" } },
    })),
  };
  const complete = reconcile(cases, [old, fresh]);
  assert.equal(complete.missing.length, 0);
  assert.equal(complete.summary.verdict, "Known issue");
  assert.equal(complete.superseded.length, 30);
  assert(complete.results.every((r) => r.sourceRun === "new-run"));
});

test("partial placeholders cannot earn coverage or erase a prior failure", () => {
  const cases = [{ id: "case", version: "same", deliveries: ["instant"] }];
  const cells = matrix(cases, "full");
  const partial = {
    id: "partial",
    status: "cancelled",
    cases,
    results: cells.map((cell, i) => ({
      cell,
      executed: i === 0,
      verdict: i === 0 ? "Fail" : "Not covered",
      layers: {},
    })),
  };
  const missing = reconcile(cases, [partial]);
  assert.equal(missing.missing.length, 29);
  const fresh = {
    id: "fresh",
    status: "completed",
    cases,
    results: cells.map((cell) => ({
      cell,
      executed: true,
      verdict: "Pass",
      layers: {},
    })),
  };
  const complete = reconcile(cases, [partial, fresh]);
  assert.equal(complete.missing.length, 0);
  assert.equal(complete.priorFindings.length, 1);
  assert.equal(complete.summary.verdict, "Fail");
});
