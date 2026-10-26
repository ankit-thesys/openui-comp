# Repository instructions

## Repository scope

All GitHub writes must target `ankit-thesys/openui-comp`. Always pass
`--repo ankit-thesys/openui-comp` to `gh` commands that accept it, and use
`repos/ankit-thesys/openui-comp/...` for REST API paths.

`thesysdev/openui` is upstream for reading and syncing only. Do not create
or modify issues, labels, pull requests, branches, or other resources there.
Push only to this fork.

## Agent skills

### Issue tracker

Issues and specs live in GitHub Issues on `ankit-thesys/openui-comp`.
See `docs/agents/issue-tracker.md`.

### Triage labels

Use the five default triage labels. See `docs/agents/triage-labels.md`.

### Domain docs

Use a single shared context: root `GLOSSARY.md` and `docs/adr/`.
See `docs/agents/domain.md`.
