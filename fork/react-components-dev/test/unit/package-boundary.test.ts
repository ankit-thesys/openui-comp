// Guards the split between the library and this fork-only package: packages/react-components holds
// only what ships upstream, and nothing it publishes points into fork/. Tooling belongs here, and
// fork/make-upstream-branch.sh strips this package from upstream branches. Needs a library build
// for the dist check; reads the library's file list from git (tracked and untracked, not ignored).
import { library } from "#paths";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";

const allowed = [
  /^src\//,
  /^package\.json$/,
  /^tsdown\.config\.ts$/,
  /^tsconfig\.json$/,
  /^README\.md$/,
  /^docs\/reference\/selectors\.md$/,
  /^LICENSE$/,
  /^THIRD_PARTY_NOTICES\.md$/,
  /^eslint\.config\.[cm]?js$/,
];
// Test code never ships, even under src/.
const denied = /\.(test|spec|stories)\.[cm]?[jt]sx?$|(^|\/)__tests__\//;
const libraryFiles = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "--full-name", "--", "."],
  { cwd: library(), encoding: "utf8" },
)
  .split("\n")
  .filter(Boolean)
  .map((file) => file.replace(/^packages\/react-components\//, ""));

it("keeps only the shipped files in packages/react-components", () => {
  expect(libraryFiles.length).toBeGreaterThan(0);
  expect(
    libraryFiles.filter(
      (file) => !allowed.some((pattern) => pattern.test(file)) || denied.test(file),
    ),
  ).toEqual([]);
});

// The package.json `files` entries (expanded), package.json itself and the source upstream reviews.
const manifest = JSON.parse(readFileSync(library("package.json"), "utf8")) as { files: string[] };
const below = (path: string): string[] =>
  statSync(library(path)).isDirectory()
    ? readdirSync(library(path), { recursive: true, encoding: "utf8" })
        .map((file) => join(path, file))
        .filter((file) => statSync(library(file)).isFile())
    : [path];
const shipped = [...new Set(["package.json", ...manifest.files.flatMap(below), ...below("src")])];

it("publishes nothing that references fork/", () => {
  expect(shipped).toContain("README.md");
  expect(shipped.some((file) => file.startsWith("dist/"))).toBe(true);
  expect(shipped.filter((file) => /\bfork\//.test(readFileSync(library(file), "utf8")))).toEqual(
    [],
  );
});

// Ticket numbers belong to the fork's tracker; upstream reads them as its own PRs. Matches `#NN` in
// source comments and in the shipped docs, not colours (a colour is code, not a comment).
const ticketRef = /(^|[^\w&/])#\d{1,4}\b/;
const commentsOf = (text: string) => (text.match(/\/\/.*|\/\*[\s\S]*?\*\//g) ?? []).join("\n");

it("publishes no fork ticket numbers", () => {
  const texts = shipped
    .filter((file) => !file.startsWith("dist/"))
    .map((file) => {
      const text = readFileSync(library(file), "utf8");
      return [file, /\.[cm]?[jt]sx?$/.test(file) ? commentsOf(text) : text] as const;
    });
  expect(texts.filter(([, text]) => ticketRef.test(text)).map(([file]) => file)).toEqual([]);
});
