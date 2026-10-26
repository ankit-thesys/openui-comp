# Issue tracker: GitHub

Issues and specs live in `ankit-thesys/openui-comp`. Use the `gh` CLI.
Never infer the destination from GitHub's fork defaults. Always specify
`--repo ankit-thesys/openui-comp`, or the explicit fork REST API path.
Do not write to `thesysdev/openui`.

## Conventions

- Create: `gh issue create --repo ankit-thesys/openui-comp --title "..." --body-file <file>`.
- Read: `gh issue view <number> --repo ankit-thesys/openui-comp --json number,title,body,labels,comments`.
- List: `gh issue list --repo ankit-thesys/openui-comp --state open --json number,title,body,labels,assignees`.
- Comment: `gh issue comment <number> --repo ankit-thesys/openui-comp --body-file <file>`.
- Label: `gh issue edit <number> --repo ankit-thesys/openui-comp --add-label "..."` or `--remove-label "..."`.
- Close: `gh issue close <number> --repo ankit-thesys/openui-comp`.

For multiline content, write the exact Markdown to a temporary file and
pass `--body-file`. Publishing to the issue tracker means creating a GitHub
issue on this fork; fetching a ticket means reading its issue.

## Parent issues and blockers

Use native GitHub sub-issues and issue dependencies when available.
All API paths must start with `repos/ankit-thesys/openui-comp/`.
Sub-issue and dependency endpoints require numeric issue database IDs,
not issue numbers or node IDs. Resolve the ID with:
`gh api repos/ankit-thesys/openui-comp/issues/<number> --jq .id`.

If native relationships are unavailable, put `Part of #<parent>` and
`Blocked by: #<number>` in the child issue body, and maintain a task list
in the parent. Work is unblocked only when all blockers are closed.

## Pull requests as a triage surface

PRs as a request surface: no.

## Wayfinding

When using wayfinder, keep the map in a `wayfinder:map` issue. Link child
research, prototype, grilling, and task issues to it. Select unassigned,
unblocked work in map order; claim it before working. Record results in
the child and update the map's decisions and links when resolving it.
