# Agent instructions

## Agent skills

### Issue tracker

Issues and specs live in GitHub Issues on `ankit-thesys/openui-comp` (the fork; never `thesysdev/openui`). See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix` (all exist on the fork). See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context, one context per package: root `GLOSSARY-MAP.md` points to `packages/<pkg>/GLOSSARY.md`; system-wide ADRs in `docs/adr/`, package ADRs in `packages/<pkg>/docs/adr/`, package specs and tickets in `packages/<pkg>/docs/specs/`. See `docs/agents/domain.md`.

## Where non-code docs go

| Kind                                                        | Location                                                                                         |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Decision (ADR) spanning packages                            | `docs/adr/NNNN-<slug>.md`                                                                        |
| Decision (ADR) for one package                              | `packages/<pkg>/docs/adr/NNNN-<slug>.md`                                                         |
| Spec or ticket breakdown for one package                    | `packages/<pkg>/docs/specs/<slug>.md` (also published to the issue tracker when a skill says so) |
| Glossary terms                                              | `packages/<pkg>/GLOSSARY.md`, listed in `GLOSSARY-MAP.md`                                        |
| Agent and skill configuration                               | `docs/agents/`                                                                                   |
| Scratch notes, lab output, drafts not meant to be committed | `.workspace/` (gitignored)                                                                       |

Number ADRs per directory, starting at `0001`. Each ADR states its status (Proposed, Accepted, Superseded by …).

## Current package docs

### `@openuidev/react-components`

- [ADR 0001: Flat component styles and override contract](packages/react-components/docs/adr/0001-flat-styles.md)
- [Spec: flat styles pilot](packages/react-components/docs/specs/flat-styles-pilot.md)
- [Tickets: flat styles pilot](packages/react-components/docs/specs/flat-styles-pilot-tickets.md)
