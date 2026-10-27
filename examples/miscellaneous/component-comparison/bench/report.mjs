const safeArtifact = (value) =>
  typeof value === "string" &&
  value.startsWith("evidence/") &&
  /^[a-zA-Z0-9_./-]+$/.test(value) &&
  !value.split("/").includes("..")
    ? value
    : "";
export const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function htmlReport(run) {
  const e = escapeHtml;
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>OpenUI bench ${e(run.id)}</title><style>body{font:15px/1.6 system-ui;background:#f3f4ee;color:#18382c;max-width:1200px;margin:32px auto;padding:20px}section,details{background:white;border:1px solid #ccd5c7;padding:16px;margin:12px 0;border-radius:8px}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#edf1e9;padding:12px}img{max-width:32%;vertical-align:top}a{color:#315f48}.warn{color:#8c3f17}</style><h1>Component parity bench</h1><p>Immutable run ${e(run.id)} · ${e(run.summary?.verdict ?? "Not covered")} · ${e(run.status)}</p><p>Preset: ${e(run.themePreset?.label ?? "Not recorded")} · ${e(run.themePreset?.definitionHash ?? "Missing theme definition")}</p><p>${e(JSON.stringify(run.summary))}</p><p class="warn">Known issues, review, missing cases and cancellation are never all-green. Unpack the evidence bundle beside this HTML for screenshots and full results. This is bounded component testing, not accessibility, SSR or performance certification.</p><details><summary>Exact provenance and normalization</summary><pre>${e(JSON.stringify({ themePreset: run.themePreset, options: run.options, ...run.provenance }, null, 2))}</pre><pre>${e(JSON.stringify(run.normalization, null, 2))}</pre></details>${run.results
    .map(
      (r) =>
        `<details><summary>${e(r.verdict)} · ${e(r.cell.id)}</summary><p>${e(r.reproduce)}</p><pre>${e(JSON.stringify(r.layers, null, 2))}</pre>${(r.images ?? []).map((src) => `<a href="${e(safeArtifact(src))}"><img alt="${e(safeArtifact(src))}" src="${e(safeArtifact(src))}" onerror="this.nextElementSibling.hidden=false"><span hidden class="warn">Missing artifact: ${e(safeArtifact(src))}</span></a>`).join("")}<details><summary>Selected case input and independent assertions</summary><pre>${e(
          JSON.stringify(
            run.cases.find((c) => c.id === r.cell.caseId),
            null,
            2,
          ),
        )}</pre></details><p>Full recorded evidence: <a href="${e(safeArtifact(r.evidence))}">${e(r.evidence ?? "Missing evidence")}</a></p></details>`,
    )
    .join(
      "",
    )}<p>JSON: <a href="run.json">run.json</a>. Missing images or evidence files are missing artifacts, not passes.</p>`;
}
