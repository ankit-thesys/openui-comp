# Goober-only styling prototype

Throwaway code answering whether Goober meets the OpenUI extraction requirements. This is **not** a production component migration, a styling decision, or a comparison with other libraries.

The three columns are Goober with its default insertion, Goober using a native cascade layer, and Goober with an explicit framework-aware adapter. They use identical representative Button, portal panel, and SVG chart fixtures. Actual OpenUI components have not been ported.

## Run

From this directory, install the pinned dependencies once with `npm ci`, then run:

```sh
npm run demo
```

Open http://127.0.0.1:4177. Select Tailwind v3/v4, Bootstrap, plain CSS or no framework; switch stylesheet order and theme. No component-CSS import is present in the consumer fixture.

## Generate evidence

The browser checks use an installed Google Chrome. Set `BROWSER_CHANNEL` to another installed Playwright-supported channel if required.

For the additional Next.js smoke fixture, install its dependencies once:

```sh
npm ci --prefix next-fixture
npm run check:all
```

`check:all` builds the fixtures, starts missing local servers, runs the observations, and generates the report. Stop older prototype servers before rerunning after code changes so server-side imports cannot be stale. It leaves already-running servers alone.

- `results/DECISION.md`: generated requirements assessment.
- `results/manifest.json`: structured version, source, requirement and observation metadata for agents.
- `results/REPORT.md` and `results/results.json`: complete CSS matrix, including failures.
- `results/NEXT.md` and `results/next.json`: App Router SSR/hydration smoke observations.

The experimental checks intentionally record failed compatibility expectations without treating those findings as execution failures. Execution errors still fail the script. Read the generated decision report; a zero exit code does **not** mean Goober meets every requirement.

## Important boundaries

- Default Goober styles do not automatically cooperate with every framework's cascade.
- The adapter is prototype code, not a Goober feature. It moves the shared `_goober` style tag, which can affect applications using that same tag; it is not ready to ship.
- Classic SSR uses explicit extraction. The Next.js fixture deliberately has no Goober SSR registry, to test the zero-setup claim.
- Traceability uses data attributes and metadata added by this prototype, plus source maps. Goober does not create our documentation or source inventory itself.
- The chart uses stable style rules, CSS keyframes/transitions and changing SVG attributes. It does not prove all production chart interactions.
- No production Next.js streaming, concurrent-request, full OpenUI visual parity, copied-component installer, or cross-browser certification is claimed.

## Sources

- [Goober](https://github.com/cristianbote/goober)
- [Tailwind v3 custom styles](https://v3.tailwindcss.com/docs/adding-custom-styles)
- [Tailwind v4 custom styles](https://tailwindcss.com/docs/adding-custom-styles)
- [Next.js CSS-in-JS](https://nextjs.org/docs/app/guides/css-in-js)
