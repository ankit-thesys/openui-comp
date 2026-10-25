The first launch attempt lacked the Playwright-managed browser; the installed
Chrome channel was used thereafter. Run2 is provisional, not accepted evidence:
its terminal counters did not require each attempted cancellation to cancel an
active response. Run3 adds explicit server cancellation/completion assertions and
passes 48 cells, but review identified missing visible partial-render assertions,
actual stylesheet-order assertions and chart expectations in the handoff.
Those review gaps must pass before the fixture is released for formal timing.
Original run2 and run3 bytes remain unchanged. No product patch was made.
