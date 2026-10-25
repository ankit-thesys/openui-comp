import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID, createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { loadCases } from "./runner.mjs";
import { getThemePreset } from "../src/theme-presets.mjs";
import { validateCase } from "./model.mjs";
const root = path.resolve(import.meta.dirname, "..");
const json = async (p) => JSON.parse(await fs.readFile(p, "utf8"));
const safeId = (id) =>
  typeof id === "string" && /^[a-zA-Z0-9][a-zA-Z0-9-]{0,120}$/.test(id);
async function body(req) {
  const chunks = [];
  let n = 0;
  for await (const c of req) {
    n += c.length;
    if (n > 300000) throw Error("Request too large");
    chunks.push(c);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
export function createBenchApi() {
  const jobs = new Map();
  const respond = (res, status, data) => {
    res.writeHead(status, {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    });
    res.end(JSON.stringify(data));
  };
  return async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (
      !url.pathname.startsWith("/bench-api/") &&
      !url.pathname.startsWith("/bench-artifacts/")
    )
      return false;
    try {
      const host = new URL("http://" + req.headers.host);
      if (
        !["localhost", "127.0.0.1", "[::1]"].includes(host.hostname) ||
        (req.headers.origin && req.headers.origin !== host.origin)
      )
        return (
          respond(res, 403, { error: "Local same-origin bench only" }),
          true
        );
      const parts = url.pathname.split("/").filter(Boolean);
      if (req.method === "GET" && url.pathname === "/bench-api/cases")
        return (
          respond(res, 200, {
            cases: await loadCases(),
            checklist: await json(path.join(root, "bench/checklist.json")),
          }),
          true
        );
      if (req.method === "POST" && url.pathname === "/bench-api/cases") {
        const input = await body(req);
        const id = "saved-" + randomUUID();
        if (
          input.themePreset?.mode &&
          !["light", "dark"].includes(input.themePreset.mode)
        )
          throw Error("Invalid saved theme mode");
        const c = validateCase({
          id,
          name: String(input.name ?? "Saved response").slice(0, 120),
          source: input.source,
          coverage: Array.isArray(input.coverage) ? input.coverage : [],
          steps: input.steps ?? [],
          assertions: input.assertions ?? [],
          deliveries: input.deliveries ?? ["instant", "stream"],
          setup: Object.fromEntries(
            Object.entries(input.setup ?? {}).filter(([key]) =>
              [
                "pendingQuery",
                "directHorizontal",
                "clipboard",
                "holdAssets",
                "isStreaming",
                "sharedSession",
              ].includes(key),
            ),
          ),
          knownIssues: [],
          environments: [
            "plain",
            "tailwind3-before",
            "tailwind3-after",
            "tailwind4-before",
            "tailwind4-after",
          ],
          chunkSchedule: {
            seed: 0,
            characters: 180,
            delayMs: 10,
            checkpoints: [0.5, 1],
          },
          themePreset: {
            ...getThemePreset(input.themePreset?.id ?? "default"),
            mode: input.themePreset?.mode ?? "light",
          },
          saved: true,
        });
        c.version = createHash("sha256")
          .update(JSON.stringify(c))
          .digest("hex");
        await fs.mkdir(path.join(root, ".bench-cases"), { recursive: true });
        await fs.writeFile(
          path.join(root, ".bench-cases", id + ".json"),
          JSON.stringify(c, null, 2),
        );
        return (
          respond(res, 201, {
            case: c,
            status: c.assertions.length
              ? "Ready for execution"
              : "Not covered: no independent expected assertions",
          }),
          true
        );
      }
      if (req.method === "GET" && url.pathname === "/bench-api/runs") {
        const history = [];
        let dirs = [];
        try {
          dirs = await fs.readdir(path.join(root, ".bench-runs"));
        } catch {}
        for (const id of dirs.filter(safeId).sort().reverse())
          try {
            const p = await json(
              path.join(root, ".bench-runs", id, "progress.json"),
            );
            history.push({ ...p, id });
          } catch {
            history.push({
              id,
              status: "incomplete",
              summary: { verdict: "Not covered" },
            });
          }
        return (respond(res, 200, { runs: history }), true);
      }
      if (req.method === "POST" && url.pathname === "/bench-api/runs") {
        if ([...jobs.values()].some((j) => j.status === "running"))
          return (
            respond(res, 409, { error: "A local run is already active" }),
            true
          );
        const input = await body(req);
        if (!["quick", "full"].includes(input.mode))
          throw Error("Choose Quick or Full");
        const id =
          new Date().toISOString().replace(/[:.]/g, "-") +
          "-" +
          randomUUID().slice(0, 8);
        if (
          input.caseIds &&
          (!Array.isArray(input.caseIds) ||
            input.caseIds.some((x) => typeof x !== "string"))
        )
          throw Error("Invalid case selection");
        if (input.fromRun && !safeId(input.fromRun))
          throw Error("Invalid historical run");
        if (!input.fromRun) getThemePreset(input.presetId ?? "default");
        const job = { id, status: "running", completed: 0, total: 0 };
        jobs.set(id, job);
        const dir = path.join(root, ".bench-runs", id);
        const argumentsList = [
          path.join(root, "bench/cli.mjs"),
          `--id=${id}`,
          `--mode=${input.mode}`,
          "--concurrency=2",
        ];
        if (input.fromRun) {
          if (!safeId(input.fromRun)) throw Error("Invalid historical run");
          argumentsList.push("--from-run=" + input.fromRun);
        } else argumentsList.push("--preset=" + (input.presetId ?? "default"));
        if (input.caseIds?.length)
          argumentsList.push("--case=" + input.caseIds.join(","));
        const child = spawn(process.execPath, argumentsList, {
          cwd: root,
          env: {
            PATH: process.env.PATH,
            HOME: process.env.HOME,
            TMPDIR: process.env.TMPDIR,
            NODE_ENV: "production",
          },
          stdio: ["ignore", "pipe", "pipe"],
        });
        await fs.mkdir(path.join(root, ".bench-logs"), { recursive: true });
        const log = (await import("node:fs")).createWriteStream(
          path.join(root, ".bench-logs", id + ".log"),
        );
        child.stdout.pipe(log, { end: false });
        child.stderr.pipe(log, { end: false });
        child.once("close", () => {
          log.end();
          void json(path.join(dir, "progress.json"))
            .then((p) => Object.assign(job, p))
            .catch(() =>
              Object.assign(job, {
                status: "infrastructure-error",
                error: "Runner stopped before writing final evidence",
              }),
            );
        });
        child.once("error", (error) =>
          Object.assign(job, {
            status: "infrastructure-error",
            error: error.message,
          }),
        );
        return (respond(res, 202, job), true);
      }
      if (req.method === "GET" && parts[0] === "bench-artifacts") {
        // Artifact URLs use /bench-artifacts/<run-id>/<relative-path>.
        const artifactId = parts[1];
        if (!safeId(artifactId)) throw Error("Invalid artifact run");
        const base = path.join(root, ".bench-runs", artifactId);
        const file = path.resolve(base, ...parts.slice(2));
        if (!file.startsWith(base + path.sep))
          throw Error("Invalid artifact path");
        const type = {
          ".png": "image/png",
          ".json": "application/json",
          ".gz": "application/gzip",
          ".html": "text/html; charset=utf-8",
        }[path.extname(file)];
        if (!type) throw Error("Unsupported evidence type");
        res.writeHead(200, {
          "Content-Type": type,
          "Cache-Control": "no-store",
        });
        res.end(await fs.readFile(file));
        return true;
      }
      const id = parts[2];
      if (!safeId(id)) throw Error("Invalid run ID");
      const dir = path.join(root, ".bench-runs", id);
      if (req.method === "POST" && parts[3] === "cancel") {
        const progress = await json(path.join(dir, "progress.json"));
        if (progress.status !== "running")
          throw Error("Run is already finalized");
        await fs.writeFile(
          path.join(dir, "cancel.requested"),
          "Requested by local user\n",
        );
        return (
          respond(res, 202, { id, status: "cancellation-requested" }),
          true
        );
      }
      if (req.method === "GET" && parts[3] === "progress") {
        let progress;
        try {
          progress = await json(path.join(dir, "progress.json"));
        } catch {
          progress = jobs.get(id);
        }
        return (
          respond(res, 200, progress ?? { id, status: "incomplete" }),
          true
        );
      }
      if (req.method === "GET" && parts[3] === "bundle") {
        await fs.access(path.join(dir, "run.json"));
        res.writeHead(200, {
          "Content-Type": "application/gzip",
          "Content-Disposition": `attachment; filename="openui-bench-${id}.tar.gz"`,
        });
        const tar = spawn("tar", ["-czf", "-", "-C", dir, "."], {
          stdio: ["ignore", "pipe", "pipe"],
        });
        tar.stdout.pipe(res);
        tar.once("error", () => res.destroy());
        res.once("close", () => {
          if (!res.writableEnded) tar.kill();
        });
        return true;
      }
      if (
        req.method === "GET" &&
        parts[0] === "bench-api" &&
        parts.length === 3
      )
        return (
          respond(res, 200, await json(path.join(dir, "run.json"))),
          true
        );
      return (respond(res, 404, { error: "Bench route not found" }), true);
    } catch (error) {
      return (
        respond(res, 400, {
          error:
            error.code === "ENOENT"
              ? "Run or evidence is missing/incomplete"
              : error.message,
        }),
        true
      );
    }
  };
}
