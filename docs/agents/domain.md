# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

This repo is **multi-context**: each package under `packages/` is a context.

## Before exploring, read these

- **`GLOSSARY-MAP.md`** at the repo root: it points at one `GLOSSARY.md` per package. Read each one relevant to the topic.
- **`docs/adr/`** at the repo root: system-wide decisions that span packages.
- **`packages/<pkg>/docs/adr/`**: decisions scoped to one package. Read the ADRs of every package you are about to work in.
- **`packages/<pkg>/docs/specs/`**: specs and ticket breakdowns for work in that package.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

```
/
├── GLOSSARY-MAP.md            ← lists each package context and its glossary
├── docs/adr/                  ← system-wide decisions
└── packages/
    ├── react-components/
    │   ├── GLOSSARY.md
    │   └── docs/
    │       ├── adr/           ← package decisions
    │       └── specs/         ← package specs and tickets
    └── lang-core/
        ├── GLOSSARY.md
        └── docs/adr/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in the relevant `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_
