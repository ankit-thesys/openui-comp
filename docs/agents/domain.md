# Domain documentation

## Layout

Use one shared glossary at root `GLOSSARY.md` and architecture decisions
in root `docs/adr/`. Packages share this documentation; there are no
per-package glossaries or `GLOSSARY-MAP.md` in this layout.

## Before exploring

Read `GLOSSARY.md` and any ADRs relevant to the work. If they do not exist,
proceed silently. Do not create empty placeholders. Domain-modeling and
grill-with-docs create them when terminology or decisions are resolved.

## Use shared vocabulary

Use glossary terms consistently in specs, issues, proposals, and tests.
The glossary contains domain terminology, not implementation plans.
Raise missing or conflicting terms during domain modeling.

## Respect recorded decisions

If a proposal conflicts with an ADR, identify that ADR and explain why
it should be reconsidered rather than silently overriding it.
