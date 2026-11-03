# Parity tests

Is the kit the same as the real [open-intelligent-ui](https://github.com/thesysdev/open-intelligent-ui)
app? These tests answer that in a real browser, using the app's own 45 gallery programs and prompt
examples, which between them use all 55 components.

```sh
pnpm exec playwright install chromium
pnpm --filter @openuidev/intelligent-kit run test:parity
```

It takes about 8 minutes, so it isn't part of `pnpm test`. Nothing reaches the network: photos, map
tiles and the host's routes are answered locally, the same for both sides.

## What it checks

- **Library:** the same components, functions and actions as the app's spec.
- **Looks:** each program at 1280px light, 1280px dark and 390px, plus a bare host page with no CSS
  reset and no theme provider. The kit and the app build controls from different elements, so it
  compares what a person sees, not the DOM: text, controls, media and charts, with their sizes and colours.
- **Behaviour:** it uses every control of every program once, about 300 in all, and compares what
  changed on the page and any action sent. Three longer flows check state across steps: filling in and
  submitting a form, ticking a checklist, and running a timer.

## Reading a failure

Every known difference is a rule in [known-differences.ts](./known-differences.ts):

- `needsFix` still looks wrong. Its test passes while the problem exists and fails once it's fixed,
  which is your reminder to delete the rule.
- `accepted` is on purpose or harmless, and the rule says why.
- A difference no rule explains fails the test. Fix it, or add a rule and say why it's fine.

Boxes and positions follow from other changes, so they get a budget per screen in
`fixtures/layout-budget.json`, not a rule. The same file caps how many differences each rule may match,
so a new bug can't hide behind a rule that's already there. After a deliberate change, update it with
`PARITY_UPDATE=1 pnpm --filter @openuidev/intelligent-kit run test:parity`.

## The baseline

The tests compare against `fixtures/source-baseline.json`, so they need neither the app nor the network.
To record it again, from a checkout of the app at the commit in `fixtures/SOURCE.json` with its
dependencies installed:

```sh
PARITY_SOURCE=/path/to/open-intelligent-ui node src/__tests__/parity/capture-source.ts
```

## Seeing it

`gallery/` renders every program from the kit, live, with a light and dark switch:

```sh
pnpm --filter @openuidev/intelligent-kit run gallery
```
