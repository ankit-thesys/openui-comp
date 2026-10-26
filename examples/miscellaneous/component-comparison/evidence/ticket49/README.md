# Ticket49 nonpublishing release verification — final handoff

**Local release discovery/independence, peer controls and native metadata verification PASS.** Source9006a2066f93359c991eeafcf9d812db3ae78450. Production PR51 contains that source; discovery prerequisite is PR50 at15d47db5c. Root reports no scheduled CI: CI is **not configured/not run**, not a green check.

## Independent results

- Normal workspace discovery sees nested chat-kit once. Normal Changesets CLI3.0.2 with the isolated chat-only patch changeset produces exactly chat0.0.0-beta.0→0.0.0; no core or unrelated fixed/linked package release. Config unchanged. This is normal non-prerelease mode, not beta.1. No version/release/publish executed.
- Five independently executed existing peer-guard controls pass: exact beta accepts; later beta and incompatible stable reject; normal compatible stable range accepts and incompatible stable rejects. No guard modifications.
- Final immutable native pnpm chat archive b4cb71c1d378bd4b50c69b0092af55ca55bc4ef0c33771624d367f782d739384 independently hash-verified. Core archive f62cf7f1d3bf9a6e3cfe57b6e2365ed821978d6d65cb080e0444bc907e94e46f independently hash-verified.
- Native manifest has exactly root/libs export maps, all ESM/CJS runtime/declaration targets exist, exact required core peer0.0.0-beta.0, no optional peer flag, no runtime dependency on core, no unresolved workspace/catalog ranges. Chat file set is dist/README/LICENSE/package.json only; no node_modules/lab/test-result/evidence files.
- Every file hash in worker47 final provenance was independently verified before reusing its clean consumer evidence. Its clean ESM/CJS imports, strict types, old/private import rejection,84-entry/schema correspondence, shared custom context/actions/stream and component-only/library separation remain worker-executed evidence, not re-executed49 checks.

## Provenance resolution

The diagnostic npm archive e8d916... remains separate and unaccepted. Worker47 recovered native pnpm b4cb71... exactly; all reused evidence is bound by ticket47-final-provenance.json and the independent hash verification list. Original mismatch is resolved without assigning old results to different bytes.

Initial49 inspection over-broadly rejected any node_modules-looking path in unchanged core dist. Inspection found eight inherited emitted Prism theme files (one-light/vsc-dark-plus JS/maps), consistent with the existing explicit tsdown vendor-theme exception. Assertion narrowed to the ticket's actual chat package boundary; no production change or acceptance criterion relaxed. Chat contains no such paths.

## Evidence / reproduction

commands.json records exact tools/cwd/output/status; peer-controls.json records all fixture inputs and results; provenance.json pins source/archive/config hashes; release-plan.json is raw Changesets output; packed-artifact-inspection.json holds both native manifests and file lists. inspect-final.py performs independent hash/metadata assertions. evidence-hashes.json hashes this compact handoff (excluding itself).

For release-plan reproduction: archive the pinned source into a private checkout, use pinned tooling, retain actual workspace/config, replace only copied pending markdown changesets with chat-only-changeset.md, initialize private git main baseline, run recorded changeset status command. Peer controls use minimal nested workspace and copied unchanged scripts. No install/build/browser work was duplicated after resume; no production edits.

Earlier setup attempts used wrongcwd(NO_PACKAGE), then lacked fixture git main; corrected successful commands are retained. These are harness setup issues.

## Accurate limits

Artifacts and consumer install remain version0.0.0-beta.0; the independent plan computes hypothetical0.0.0. No0.0.0-version artifact was built/installed, and no claim of actual publication readiness at that hypothetical version is made. If literal post-version install is required, it is an additional isolated check, not supplied by this evidence. Full-repo CI absent as reported by root. Existing component defects and theme gaps are unrelated and unchanged.

W1: copy this compact directory to PR41 validation evidence, not production packages. Exclude disposable workspace/peer-fixture, node_modules, git metadata and archives. No issue closure/merge/publication authorized.
