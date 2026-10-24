/**
 * Real-Chrome verification run for issue #23.
 *
 * Closes the four browser-only gaps left open by #19 (G-1 arrow-key selection,
 * G-3 nested-label activation, G-4 pointer drag, G-8 popup geometry) and
 * re-checks the reported Select/DatePicker defects in a real engine.
 *
 * Every assertion runs against genuinely trusted input (see browser/cdp.mjs).
 * Coordinates are always MEASURED from getBoundingClientRect, never hardcoded:
 * a missed hit target produces no error, and for G-3 it would look exactly like
 * "the label does not activate".
 *
 * Exit code is 0 only if every scenario ran AND every check passed. A scenario
 * that fails to load, throws unexpectedly, or reports a page error is a FAILURE,
 * never silently-passing coverage.
 *
 * One command, from the repository root:
 *   node validation/friend-controls-baseline/browser/run.mjs
 *
 * It builds the fixture itself, serves it, drives Chrome and reports. Options:
 *   --only <name>   run a single scenario
 *   --json <path>   write the full machine-readable result
 *   --no-build      reuse an existing browser/dist
 */
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { launch } from "./cdp.mjs";
import { freePort, serve } from "./serve.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DIST = join(HERE, "dist");
const PORT = Number(process.env.FIXTURE_PORT ?? 4321);
const CDP_PORT = Number(process.env.CDP_PORT ?? 9335);

const argv = process.argv.slice(2);
const only = argv.includes("--only") ? argv[argv.indexOf("--only") + 1] : null;
const jsonOut = argv.includes("--json") ? argv[argv.indexOf("--json") + 1] : null;
const noBuild = argv.includes("--no-build");

/** Build the fixture through react-ui's installed vite, as everything else does. */
const buildFixture = () => {
  const repoRoot = join(HERE, "../../..");
  const res = spawnSync(
    "pnpm",
    [
      "--dir",
      "packages/react-ui",
      "exec",
      "vite",
      "build",
      "--config",
      "../../validation/friend-controls-baseline/browser/vite.config.ts",
    ],
    { cwd: repoRoot, encoding: "utf8" },
  );
  if (res.status !== 0) {
    console.error(
      `fixture build failed (exit ${res.status}).\n` +
        `${(res.stderr || "").slice(-3000)}\n${(res.stdout || "").slice(-2000)}`,
    );
    process.exit(2);
  }
};

// ---------------------------------------------------------------------------
// Check helpers
// ---------------------------------------------------------------------------
const mk = () => {
  const checks = [];
  const api = {
    checks,
    /** Record a boolean check with the observed value attached. */
    ok(name, pass, detail) {
      checks.push({ name, pass: !!pass, detail });
      return !!pass;
    },
    eq(name, actual, expected) {
      const pass = JSON.stringify(actual) === JSON.stringify(expected);
      checks.push({
        name,
        pass,
        detail: pass
          ? `= ${JSON.stringify(actual)}`
          : `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
      });
      return pass;
    },
    /** A recorded observation that is evidence, not a pass/fail gate. */
    note(name, value) {
      checks.push({ name, pass: true, note: true, detail: JSON.stringify(value) });
    },
  };
  return api;
};

const probe = (s) => s.json("return window.__probe");
const events = async (s, src) => (await probe(s)).events.filter((e) => e.src === src);

/** Load a scenario and fail loudly if it did not mount. */
const open = async (s, base, name) => {
  await s.goto(`${base}/?s=${encodeURIComponent(name)}`);
  // Wait for the fixture's own readiness signal rather than assuming a fixed
  // number of frames is enough.
  await s.waitFor(
    `window.__ready === true || !!document.getElementById("unknown-scenario")`,
    `scenario "${name}" to mount`,
  );
  await s.settle(2);
  const state = await s.json(`return {
    ready: window.__ready === true,
    error: window.__error ?? null,
    unknown: !!document.getElementById("unknown-scenario"),
  }`);
  if (state.unknown) throw new Error(`fixture does not know scenario "${name}"`);
  if (!state.ready) throw new Error(`scenario "${name}" did not signal ready`);
  return state;
};

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------
const SCENARIOS = [
  {
    name: "radio-arrows",
    gaps: ["G-1"],
    title: "RadioGroup arrow-key focus AND selection, vs raw Radix",
    async run(s, base) {
      const c = mk();
      await open(s, base, "radio-arrows");

      const focusInfo = () =>
        s.json(`
          const a = document.activeElement;
          const group = a && a.closest("#openui-panel") ? "openui"
                      : a && a.closest("#radix-panel") ? "radix" : null;
          return { group, value: a?.getAttribute("value") ?? null,
                   role: a?.getAttribute("role") ?? null,
                   state: a?.getAttribute("data-state") ?? null };
        `);
      const states = (panel) =>
        s.json(`
          return Array.from(document.querySelectorAll("#${panel} [role=radio]"))
            .map(n => ({ value: n.getAttribute("value"), state: n.getAttribute("data-state") }));
        `);

      // --- OpenUI RadioGroup ---
      await s.eval(`document.querySelector("#openui-panel [role=radio]").focus()`);
      await s.settle();
      c.eq("openui: focus starts on first radio", (await focusInfo()).value, "standard");

      await s.key("ArrowDown");
      const afterDown = await focusInfo();
      c.eq("openui: ArrowDown moves focus to 2nd radio", afterDown.value, "express");

      const openuiStates = await states("openui-panel");
      const openuiSelected = openuiStates.filter((r) => r.state === "checked").map((r) => r.value);
      const openuiEvents = await events(s, "openui");

      // THE question G-1 left open: does arrow-key focus also SELECT?
      // Answer in a real browser: YES. (It does not under jsdom, which is why
      // #19 could only record a gap.) Note this check is sensitive to key dwell
      // time — see the `key()` docs in cdp.mjs.
      c.ok(
        "G-1 RESOLVED — openui: ArrowDown SELECTS the focused radio",
        openuiSelected.length === 1 && openuiSelected[0] === "express",
        `selected=${JSON.stringify(openuiSelected)} onValueChange=${JSON.stringify(openuiEvents.map((e) => e.value))}`,
      );

      // --- raw Radix control group ---
      await s.eval(`document.querySelector("#radix-panel [role=radio]").focus()`);
      await s.settle();
      await s.key("ArrowDown");
      const radixStates = await states("radix-panel");
      const radixSelected = radixStates.filter((r) => r.state === "checked").map((r) => r.value);
      const radixEvents = await events(s, "radix");
      c.ok(
        "radix control group: ArrowDown SELECTS too",
        radixSelected.length === 1 && radixSelected[0] === "express",
        `selected=${JSON.stringify(radixSelected)} onValueChange=${JSON.stringify(radixEvents.map((e) => e.value))}`,
      );

      c.ok(
        "openui matches raw Radix (wrapper adds no deviation)",
        JSON.stringify(openuiSelected) === JSON.stringify(radixSelected),
        `openui=${JSON.stringify(openuiSelected)} radix=${JSON.stringify(radixSelected)}`,
      );

      // Space on an already-focused radio, for completeness.
      await s.eval(`document.querySelector("#openui-panel [role=radio]").focus()`);
      await s.key(" ");
      c.note("openui: states after Space on first radio", await states("openui-panel"));
      return c.checks;
    },
  },

  {
    name: "nested-label",
    gaps: ["G-3"],
    title: "Nested <label> activation: once, twice, or not at all",
    async run(s, base) {
      const c = mk();
      await open(s, base, "nested-label");

      // Inner label of the checkbox row.
      await s.click("#checkbox-panel .openui-checkbox-item-label");
      let evs = await events(s, "checkbox");
      const boxState = await s.eval(
        `document.querySelector('#checkbox-panel [role=checkbox]').getAttribute('data-state')`,
      );
      c.eq("checkbox: clicking the inner label fires onChange exactly once", evs.length, 1);
      c.eq("checkbox: ends up checked (no double-toggle)", boxState, "checked");
      c.note(
        "checkbox: inner-label payloads",
        evs.map((e) => e.checked),
      );

      // Description text, which only the container <label> covers.
      await open(s, base, "nested-label");
      await s.click("#checkbox-panel .openui-checkbox-item-description");
      evs = await events(s, "checkbox");
      c.eq("checkbox: clicking the description also toggles once", evs.length, 1);

      // The control itself.
      await open(s, base, "nested-label");
      await s.click("#checkbox-panel [role=checkbox]");
      evs = await events(s, "checkbox");
      c.eq("checkbox: clicking the control toggles once", evs.length, 1);

      // Radio row, same nesting.
      await open(s, base, "nested-label");
      await s.click("#radio-panel .openui-radio-item-label");
      const radioEvs = await events(s, "radio");
      const radioState = await s.eval(
        `document.querySelector('#radio-panel [role=radio]').getAttribute('data-state')`,
      );
      c.eq("radio: clicking the inner label fires onValueChange once", radioEvs.length, 1);
      c.eq("radio: ends up checked", radioState, "checked");

      // Document the invalid nesting as a fact of the DOM.
      const nesting = await s.json(`
        const outer = document.querySelector("#checkbox-panel label.openui-checkbox-item-container");
        const inner = outer?.querySelector("label");
        return { hasOuterLabel: !!outer, hasInnerLabel: !!inner,
                 sameFor: outer?.getAttribute("for") === inner?.getAttribute("for") };
      `);
      c.ok(
        "nested <label> with identical `for` is present in the DOM",
        nesting.hasInnerLabel && nesting.sameFor,
        JSON.stringify(nesting),
      );
      return c.checks;
    },
  },

  {
    name: "slider",
    gaps: ["G-4"],
    title: "Slider real pointer drag and track click",
    async run(s, base) {
      const c = mk();
      await open(s, base, "slider");

      const value = () => s.json("return window.__probe.sliderValue");
      c.eq("initial value", await value(), [200]);

      // --- Drag the thumb to the right ---
      const thumb = await s.rect(".openui-slider-thumb");
      const track = await s.rect(".openui-slider-track");
      if (!thumb || !track) throw new Error("slider thumb or track not found");
      c.ok(
        "thumb has real layout geometry (non-zero size)",
        thumb.width > 0 && thumb.height > 0,
        JSON.stringify(thumb),
      );

      const from = {
        x: Math.round(thumb.left + thumb.width / 2),
        y: Math.round(thumb.top + thumb.height / 2),
      };
      const to = { x: Math.round(track.left + track.width * 0.8), y: from.y };
      await s.drag(from, to);

      const dragged = await value();
      c.ok(
        "dragging the thumb changes the value (real pointer capture)",
        Array.isArray(dragged) && dragged[0] > 200,
        `from [200] to ${JSON.stringify(dragged)} (dragged to 80% of track)`,
      );
      c.ok(
        "dragged value lands on a step multiple of 100",
        Array.isArray(dragged) && dragged[0] % 100 === 0,
        JSON.stringify(dragged),
      );

      // --- Click directly on the track ---
      await open(s, base, "slider");
      const track2 = await s.rect(".openui-slider-track");
      await s.clickPoint(
        Math.round(track2.left + track2.width * 0.3),
        Math.round(track2.top + track2.height / 2),
      );
      const clicked = await value();
      c.ok(
        "clicking the track jumps the value",
        Array.isArray(clicked) && clicked[0] !== 200,
        `from [200] to ${JSON.stringify(clicked)} (clicked 30% of track)`,
      );
      return c.checks;
    },
  },

  {
    name: "select-geometry",
    gaps: ["G-8"],
    title: "Select popup geometry and dismissal",
    async run(s, base) {
      const c = mk();
      await open(s, base, "select-geometry");

      const trigger = await s.rect(".openui-select-trigger");
      c.ok("trigger has real geometry", trigger && trigger.width > 0, JSON.stringify(trigger));

      await s.click(".openui-select-trigger");
      const popup = await s.rect(".openui-select-content");
      c.ok("popup exists after opening", !!popup, JSON.stringify(popup));
      if (!popup) return c.checks;

      c.ok(
        "popup has non-zero size",
        popup.width > 0 && popup.height > 0,
        `${popup.width}x${popup.height}`,
      );
      const viewport = await s.json("return { w: innerWidth, h: innerHeight }");
      c.ok(
        "popup is inside the viewport",
        popup.left >= 0 &&
          popup.top >= 0 &&
          popup.right <= viewport.w + 1 &&
          popup.bottom <= viewport.h + 1,
        `popup=${JSON.stringify(popup)} viewport=${JSON.stringify(viewport)}`,
      );
      c.ok(
        "popup is anchored below the trigger (sideOffset 2)",
        popup.top >= trigger.bottom - 1 && popup.top - trigger.bottom < 12,
        `trigger.bottom=${trigger.bottom} popup.top=${popup.top} gap=${(popup.top - trigger.bottom).toFixed(1)}`,
      );
      c.ok(
        "popup is horizontally aligned with the trigger",
        Math.abs(popup.left - trigger.left) < 8,
        `trigger.left=${trigger.left} popup.left=${popup.left}`,
      );

      // Choose an option for real.
      await s.click('.openui-select-content [role="option"]', { index: 1 });
      const chosen = await events(s, "select");
      c.eq(
        "choosing an option reports its value",
        chosen.map((e) => e.value),
        ["gbp"],
      );
      c.eq(
        "choosing closes the popup",
        await s.eval(`!!document.querySelector(".openui-select-content")`),
        false,
      );

      // Dismissal by outside click.
      //
      // Radix Select shields the rest of the page while open, so the click does
      // NOT reach the element underneath. That is why this uses a raw point
      // click rather than clickVerified (which correctly refuses to click a
      // point whose hit target is not the intended element).
      await s.click(".openui-select-trigger");
      c.eq("reopens", await s.eval(`!!document.querySelector(".openui-select-content")`), true);

      const shield = await s.json(`
        const b = document.getElementById("outside");
        const r = b.getBoundingClientRect();
        const x = Math.round(r.left + r.width / 2), y = Math.round(r.top + r.height / 2);
        return {
          x, y,
          bodyPointerEvents: getComputedStyle(document.body).pointerEvents,
          buttonPointerEvents: getComputedStyle(b).pointerEvents,
          hitTarget: document.elementFromPoint(x, y)?.tagName ?? null,
        };
      `);
      c.eq(
        "while open, Radix sets pointer-events:none on the body (page is shielded)",
        shield.bodyPointerEvents,
        "none",
      );
      c.ok(
        "so the outside button is not hit-testable",
        shield.hitTarget !== "BUTTON",
        `elementFromPoint at the button is <${shield.hitTarget}>`,
      );

      await s.clickPoint(shield.x, shield.y);
      c.eq(
        "outside click dismisses the popup",
        await s.eval(`!!document.querySelector(".openui-select-content")`),
        false,
      );
      c.eq(
        "and the click never reached the underlying button",
        (await events(s, "outside")).length,
        0,
      );

      // Dismissal by Escape.
      await s.click(".openui-select-trigger");
      await s.key("Escape");
      c.eq(
        "Escape dismisses the popup",
        await s.eval(`!!document.querySelector(".openui-select-content")`),
        false,
      );
      c.eq(
        "focus returns to the trigger after Escape",
        await s.eval(
          `document.activeElement?.classList.contains("openui-select-trigger") === true`,
        ),
        true,
      );
      return c.checks;
    },
  },

  {
    name: "select-hide-icon",
    gaps: ["SE-1"],
    title: "SE-1 — SelectTrigger hideDropdownIcon in a real engine",
    async run(s, base) {
      const c = mk();
      const state = await open(s, base, "select-hide-icon");
      c.ok(
        "render throws with Radix's Slot message",
        typeof state.error === "string" && /slot onto its children/i.test(state.error),
        JSON.stringify(state.error),
      );
      c.eq(
        "no trigger renders at all",
        await s.eval(`!!document.querySelector(".openui-select-trigger")`),
        false,
      );
      return c.checks;
    },
  },

  {
    name: "select-textvalue",
    gaps: ["SE-2"],
    title: "SE-2 — SelectItem textValue rendering and typeahead",
    async run(s, base) {
      const c = mk();
      await open(s, base, "select-textvalue");
      await s.click(".openui-select-trigger");

      const texts = await s.json(`
        return Array.from(document.querySelectorAll('.openui-select-content [role="option"]'))
          .map(n => n.textContent);
      `);
      c.eq("option text is duplicated (children + textValue)", texts, [
        "EuroEuro currency",
        "Pound sterlingPound currency",
      ]);

      // Does Radix typeahead still work, and on which string?
      await s.key("p", { code: "KeyP", keyCode: 80, text: "p" });
      await s.settle(4);
      const afterP = await s.json(`
        const a = document.activeElement;
        return { activeText: a?.textContent ?? null,
                 activeValue: a?.getAttribute("data-value") ?? null,
                 role: a?.getAttribute("role") ?? null };
      `);
      c.note("typeahead 'p' lands on", afterP);
      c.ok(
        "typeahead still matches on the rendered children",
        afterP.role === "option" && /Pound/.test(afterP.activeText ?? ""),
        JSON.stringify(afterP),
      );
      return c.checks;
    },
  },

  {
    name: "datepicker-geometry",
    gaps: ["G-8", "DP-1"],
    title: "DatePicker popup geometry, dismissal and keyboard reachability",
    async run(s, base) {
      const c = mk();
      await open(s, base, "datepicker-geometry");

      const trigger = await s.rect(".openui-date-picker-renderer-floating-input-container");
      c.ok("trigger has real geometry", trigger && trigger.width > 0, JSON.stringify(trigger));

      // DP-1: is it reachable by Tab in a real browser?
      await s.eval("document.body.focus()");
      await s.key("Tab");
      const firstTab = await s.json(`
        const a = document.activeElement;
        return { tag: a?.tagName ?? null, id: a?.id ?? null,
                 isTrigger: !!a?.closest?.(".openui-date-picker-renderer-floating-input-container") };
      `);
      c.eq("DP-1: Tab does NOT reach the DatePicker trigger", firstTab.isTrigger, false);
      c.note("DP-1: first Tab lands on", firstTab);

      await s.click(".openui-date-picker-renderer-floating-input-container");
      const popup = await s.rect(".openui-date-picker-renderer-floating-content");
      c.ok("popup opens on click", !!popup, JSON.stringify(popup));
      if (!popup) return c.checks;

      c.ok(
        "popup has non-zero size",
        popup.width > 0 && popup.height > 0,
        `${popup.width}x${popup.height}`,
      );
      const viewport = await s.json("return { w: innerWidth, h: innerHeight }");
      c.ok(
        "popup is inside the viewport",
        popup.left >= 0 && popup.top >= 0 && popup.right <= viewport.w + 1,
        `popup=${JSON.stringify(popup)} viewport=${JSON.stringify(viewport)}`,
      );
      c.ok(
        "popup is placed below the trigger (floating-ui bottom-start, offset 5)",
        popup.top >= trigger.bottom - 1,
        `trigger.bottom=${trigger.bottom} popup.top=${popup.top} gap=${(popup.top - trigger.bottom).toFixed(1)}`,
      );

      // Escape is not wired up (consequence of DP-1).
      await s.key("Escape");
      c.eq(
        "Escape does NOT dismiss (no key handling)",
        await s.eval(`!!document.querySelector(".openui-date-picker-renderer-floating-content")`),
        true,
      );

      // The outside target is pinned top-right precisely so the popup cannot
      // cover it; clickVerified additionally refuses to click a covered point.
      c.note(
        "element at the outside-click point",
        await s.json(`
        const b = document.getElementById("outside"); const r = b.getBoundingClientRect();
        const el = document.elementFromPoint(Math.round(r.left + r.width/2), Math.round(r.top + r.height/2));
        return { hit: el?.tagName ?? null, isOutsideButton: el === b };
      `),
      );
      c.eq(
        "unlike Select, the DatePicker does NOT shield the page",
        await s.eval(`getComputedStyle(document.body).pointerEvents`),
        "auto",
      );
      await s.clickVerified("#outside");
      c.eq(
        "outside click dismisses",
        await s.eval(`!!document.querySelector(".openui-date-picker-renderer-floating-content")`),
        false,
      );
      c.eq(
        "and the click DID reach the underlying button (no shield)",
        (await events(s, "outside")).length,
        1,
      );
      return c.checks;
    },
  },

  {
    name: "datepicker-clear",
    gaps: ["DP-2"],
    title: "DP-2 — controlled DatePicker cannot be cleared",
    async run(s, base) {
      const c = mk();
      await open(s, base, "datepicker-clear");

      const triggerText = () =>
        s.eval(
          `document.querySelector(".openui-date-picker-renderer-floating-input-container-text")?.textContent ?? null`,
        );
      c.eq("starts on the placeholder", await triggerText(), "Select a date");

      await s.click(".openui-date-picker-renderer-floating-input-container");
      // Measure the day cell rather than guessing, then click its centre.
      const dayIndex = await s.json(`
        const btns = Array.from(document.querySelectorAll(".openui-date-picker-renderer-floating-content button"));
        const i = btns.findIndex(b => b.textContent.trim() === "14" && !b.disabled);
        return i;
      `);
      if (dayIndex < 0) throw new Error("could not find an enabled day 14 in the popup");
      await s.click(".openui-date-picker-renderer-floating-content button", { index: dayIndex });

      const afterPick = await triggerText();
      c.ok(
        "picking a day updates the trigger",
        /\w+ 14, \d{4}/.test(afterPick ?? ""),
        JSON.stringify(afterPick),
      );
      c.note("controlled value after pick", await s.json("return window.__probe.controlledDate"));

      // The consumer clears its own state.
      await s.clickVerified("#clear");
      const afterClear = await triggerText();
      const controlled = await s.json("return window.__probe.controlledDate");

      c.eq("consumer state really is cleared", controlled, null);
      c.ok(
        "DP-2 confirmed: trigger still shows the old date after clearing",
        afterClear !== "Select a date",
        `controlledDate=${JSON.stringify(controlled)} but trigger shows ${JSON.stringify(afterClear)}`,
      );
      return c.checks;
    },
  },

  {
    name: "datepicker-stuck",
    gaps: ["DP-3"],
    title: "DP-3 — isOpen without setIsOpen is stuck open",
    async run(s, base) {
      const c = mk();
      await open(s, base, "datepicker-stuck");
      const isOpen = () =>
        s.eval(`!!document.querySelector(".openui-date-picker-renderer-floating-content")`);

      c.eq("opens from isOpen={true}", await isOpen(), true);
      await s.click(".openui-date-picker-renderer-floating-input-container");
      c.eq("DP-3: a trigger click does not close it", await isOpen(), true);
      await s.clickVerified("#outside");
      c.eq("DP-3: an outside click does not close it either", await isOpen(), true);
      await s.key("Escape");
      c.eq("DP-3: Escape does not close it", await isOpen(), true);
      return c.checks;
    },
  },

  {
    name: "calendar-caption",
    gaps: ["G-7"],
    title: "Calendar caption menus and multiple mode",
    async run(s, base) {
      const c = mk();
      await open(s, base, "calendar-caption");

      const combos = await s.json(`
        return Array.from(document.querySelectorAll("#caption-panel [role=combobox]"))
          .map(n => ({ text: n.textContent, cls: n.className }));
      `);
      c.eq("caption renders two openui Select comboboxes, not native <select>", combos.length, 2);
      c.eq(
        "no native <select> in the caption",
        await s.eval(`document.querySelectorAll("#caption-panel select").length`),
        0,
      );
      c.note(
        "caption combobox labels",
        combos.map((x) => x.text),
      );

      // Open the month menu for real and choose another month.
      await s.click("#caption-panel [role=combobox]", { index: 0 });
      const options = await s.json(`
        return Array.from(document.querySelectorAll('.openui-select-content [role="option"]'))
          .map(n => n.textContent).slice(0, 14);
      `);
      c.ok(
        "month menu opens with month options",
        options.length >= 12,
        `${options.length} options: ${JSON.stringify(options.slice(0, 3))}`,
      );

      const popup = await s.rect(".openui-select-content");
      c.ok(
        "month menu has real geometry inside the viewport",
        !!popup && popup.width > 0 && popup.top >= 0,
        JSON.stringify(popup),
      );

      const mayIndex = options.findIndex((t) => /May/.test(t ?? ""));
      if (mayIndex >= 0) {
        await s.click('.openui-select-content [role="option"]', { index: mayIndex });
        const caption = await s.eval(
          `document.querySelector("#caption-panel [role=combobox]")?.textContent ?? null`,
        );
        c.eq("choosing a month updates the caption", caption, "May");
      } else {
        c.ok("month menu contained a May option", false, `options=${JSON.stringify(options)}`);
      }

      // multiple mode: two real clicks accumulate two dates.
      await open(s, base, "calendar-caption");
      const dayIdx = (day) =>
        s.json(`
          const btns = Array.from(document.querySelectorAll("#multiple-panel button"));
          return btns.findIndex(b => b.textContent.trim() === ${JSON.stringify(day)} && !b.disabled);
        `);
      const i14 = await dayIdx("14");
      const i20 = await dayIdx("20");
      if (i14 < 0 || i20 < 0)
        throw new Error("could not locate day cells in multiple-mode calendar");
      await s.click("#multiple-panel button", { index: i14 });
      await s.click("#multiple-panel button", { index: i20 });
      c.eq(
        "multiple mode accumulates two selected dates",
        await s.json("return window.__probe.multipleCount"),
        2,
      );
      c.eq(
        "both days are marked selected in the DOM",
        await s.eval(`document.querySelectorAll('#multiple-panel [aria-selected="true"]').length`),
        2,
      );
      return c.checks;
    },
  },
];

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------
const main = async () => {
  const chosen = only ? SCENARIOS.filter((x) => x.name === only) : SCENARIOS;
  if (only && chosen.length === 0) {
    console.error(`unknown scenario "${only}". known: ${SCENARIOS.map((x) => x.name).join(", ")}`);
    process.exit(2);
  }

  if (!noBuild) buildFixture();

  const server = await serve(DIST, await freePort(PORT)).catch((error) => {
    console.error(
      `could not serve ${DIST}: ${error.message}\n` +
        `Build the fixture first:\n` +
        `  pnpm --dir packages/react-ui exec vite build --config ../../validation/friend-controls-baseline/browser/vite.config.ts`,
    );
    process.exit(2);
  });

  const browser = await launch({ port: await freePort(CDP_PORT), width: 1280, height: 900 }).catch(
    async (error) => {
      await server.close();
      console.error(`could not launch Chrome: ${error.message}`);
      process.exit(2);
    },
  );

  const { session, version, close } = browser;

  // Never leak a headless Chrome or a listening socket, whatever happens:
  // a leaked process holds its debugging port and breaks the next run.
  let cleaned = false;
  const cleanup = async () => {
    if (cleaned) return;
    cleaned = true;
    try {
      await close();
    } catch {}
    try {
      await server.close();
    } catch {}
  };
  for (const sig of ["SIGINT", "SIGTERM"]) {
    process.once(sig, async () => {
      await cleanup();
      process.exit(130);
    });
  }
  process.once("uncaughtException", async (error) => {
    await cleanup();
    console.error(`uncaught: ${error.stack ?? error.message}`);
    process.exit(2);
  });
  const results = [];
  const pageErrors = [];
  session.on("Runtime.exceptionThrown", (p) =>
    pageErrors.push(p.exceptionDetails?.exception?.description ?? p.exceptionDetails?.text),
  );

  console.log(`browser : ${version.Browser}`);
  console.log(`fixture : ${server.url}`);
  console.log("");

  for (const scenario of chosen) {
    const before = pageErrors.length;
    try {
      const checks = await scenario.run(session, server.url);
      // A scenario that logged an unexpected page exception is not a pass,
      // EXCEPT where the throw is the thing under test (SE-1).
      const newErrors = pageErrors.slice(before);
      const expectsThrow = scenario.gaps.includes("SE-1");
      if (newErrors.length && !expectsThrow) {
        checks.push({
          name: "no unexpected page exceptions",
          pass: false,
          detail: newErrors.join(" | ").slice(0, 400),
        });
      }
      results.push({ ...scenario, checks, ran: true });
    } catch (error) {
      results.push({
        ...scenario,
        ran: false,
        checks: [{ name: "scenario executed", pass: false, detail: error.message }],
      });
    }
  }

  await cleanup();

  // --- report ---
  let failed = 0;
  let passed = 0;
  for (const r of results) {
    const bad = r.checks.filter((x) => !x.pass).length;
    const head = bad === 0 ? "PASS" : "FAIL";
    console.log(`${head}  ${r.name}  [${r.gaps.join(", ")}]  ${r.title}`);
    if (!r.ran) console.log(`      !! scenario did not complete`);
    for (const check of r.checks) {
      const mark = check.note ? "  ·" : check.pass ? "  ✓" : "  ✗";
      console.log(`    ${mark} ${check.name}${check.detail ? `  — ${check.detail}` : ""}`);
      if (!check.note) check.pass ? passed++ : failed++;
    }
    console.log("");
  }

  const summary = {
    browser: version.Browser,
    protocol: version["Protocol-Version"],
    scenarios: results.length,
    scenariosCompleted: results.filter((r) => r.ran).length,
    checksPassed: passed,
    checksFailed: failed,
    results: results.map((r) => ({
      name: r.name,
      gaps: r.gaps,
      title: r.title,
      ran: r.ran,
      checks: r.checks,
    })),
  };
  if (jsonOut) {
    writeFileSync(jsonOut, JSON.stringify(summary, null, 2));
    console.log(`json written: ${jsonOut}`);
  }

  console.log(
    `${failed === 0 ? "ALL GREEN" : "FAILURES"}: ${passed} passed, ${failed} failed, ` +
      `${summary.scenariosCompleted}/${results.length} scenarios completed`,
  );
  process.exit(failed === 0 && summary.scenariosCompleted === results.length ? 0 : 1);
};

main().catch((error) => {
  console.error(`runner crashed: ${error.stack ?? error.message}`);
  process.exit(2);
});
