/**
 * Browser verification fixture for issue #23.
 *
 * One page, one scenario per `?s=<name>`, rendering the UNCHANGED legacy
 * components so real Chrome input can close the gaps jsdom could not.
 *
 * Contract with browser/run.mjs:
 *   - `window.__probe` accumulates observable state the runner asserts on.
 *   - `window.__ready === true` once a scenario has mounted.
 *   - `window.__error` holds a render error instead of blanking the page, which
 *     is what makes the SE-1 crash observable rather than fatal.
 *
 * The real component SCSS is imported so geometry assertions (G-8) measure a
 * genuinely laid-out popup rather than an unstyled box.
 */
import { Component, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

import "../../../../packages/react-ui/src/components/index.scss";
import "./fixture.css";

import * as RadixRadio from "@radix-ui/react-radio-group";
import { Calendar } from "../../../../packages/react-ui/src/components/Calendar";
import { CheckBoxItem } from "../../../../packages/react-ui/src/components/CheckBoxItem";
import { DatePicker } from "../../../../packages/react-ui/src/components/DatePicker";
import { RadioGroup } from "../../../../packages/react-ui/src/components/RadioGroup";
import { RadioItem } from "../../../../packages/react-ui/src/components/RadioItem";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../packages/react-ui/src/components/Select";
import { Slider } from "../../../../packages/react-ui/src/components/Slider/Slider";

// ---------------------------------------------------------------------------
// Probe plumbing
// ---------------------------------------------------------------------------
type Probe = Record<string, unknown> & { events: unknown[] };
const probe: Probe = { events: [] };
(window as unknown as { __probe: Probe }).__probe = probe;

const record = (key: string, value: unknown) => {
  probe[key] = value;
};
const push = (event: unknown) => {
  probe.events.push(event);
};

/** Fixed, deterministic date: Thursday 14 March 2024. Matches fixtures/data.ts. */
const FIXED_DATE = new Date(2024, 2, 14);

class Boundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  override state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  override componentDidCatch(error: Error) {
    (window as unknown as { __error: string }).__error = error.message;
    record("renderError", error.message);
  }
  override render() {
    if (this.state.error) {
      return <pre id="render-error">{this.state.error.message}</pre>;
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

/** G-1 — arrow-key focus AND selection, OpenUI vs raw Radix side by side. */
const RadioArrows = () => (
  <div className="scenario">
    <div className="panel" id="openui-panel">
      <h3>OpenUI RadioGroup</h3>
      <RadioGroup onValueChange={(v) => push({ src: "openui", value: v })}>
        <RadioItem value="standard" label="Standard" description="5 days" />
        <RadioItem value="express" label="Express" description="2 days" />
        <RadioItem value="overnight" label="Overnight" description="tomorrow" />
      </RadioGroup>
    </div>
    <div className="panel" id="radix-panel">
      <h3>raw Radix RadioGroup (control group)</h3>
      <RadixRadio.Root onValueChange={(v) => push({ src: "radix", value: v })}>
        <RadixRadio.Item value="standard" id="rx-1">
          <RadixRadio.Indicator />
        </RadixRadio.Item>
        <RadixRadio.Item value="express" id="rx-2">
          <RadixRadio.Indicator />
        </RadixRadio.Item>
        <RadixRadio.Item value="overnight" id="rx-3">
          <RadixRadio.Indicator />
        </RadixRadio.Item>
      </RadixRadio.Root>
    </div>
  </div>
);

/** G-3 — nested-label activation: does one click toggle once, twice, or not at all? */
const NestedLabel = () => (
  <div className="scenario">
    <div className="panel" id="checkbox-panel">
      <h3>CheckBoxItem (container label + inner label, same `for`)</h3>
      <CheckBoxItem
        label="Email digest"
        description="A weekly summary."
        onChange={(checked) => push({ src: "checkbox", checked })}
      />
    </div>
    <div className="panel" id="radio-panel">
      <h3>RadioItem (same nesting)</h3>
      <RadioGroup onValueChange={(v) => push({ src: "radio", value: v })}>
        <RadioItem value="standard" label="Standard" description="5 days" />
      </RadioGroup>
    </div>
  </div>
);

/** G-4 — real pointer drag and track click. */
const SliderScenario = () => {
  const [value, setValue] = useState<number[]>([200]);
  record("sliderValue", value);
  return (
    <div className="scenario">
      <div className="panel" style={{ width: 520 }}>
        <h3>Slider, discrete, 0–1000 step 100</h3>
        <Slider
          variant="discrete"
          min={0}
          max={1000}
          step={100}
          value={value}
          onValueChange={(next) => {
            setValue(next);
            record("sliderValue", next);
            push({ src: "slider", value: next });
          }}
        />
      </div>
    </div>
  );
};

/** G-8 — Select popup geometry and dismissal. */
const SelectGeometry = () => (
  <div className="scenario">
    <div className="panel">
      <h3>Select</h3>
      <Select onValueChange={(v) => push({ src: "select", value: v })}>
        <SelectTrigger aria-label="Currency">
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="eur">Euro</SelectItem>
          <SelectItem value="gbp">Pound sterling</SelectItem>
          <SelectItem value="jpy">Japanese yen</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <button type="button" className="outside" id="outside" onClick={() => push({ src: "outside" })}>
      outside
    </button>
    <div className="spacer" />
  </div>
);

/** SE-1 — hideDropdownIcon. Wrapped so a throw is observable, not fatal. */
const SelectHideIcon = () => (
  <div className="scenario">
    <div className="panel">
      <h3>SelectTrigger hideDropdownIcon</h3>
      <Select>
        <SelectTrigger hideDropdownIcon aria-label="Currency">
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="eur">Euro</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);

/** SE-2 — textValue. */
const SelectTextValue = () => (
  <div className="scenario">
    <div className="panel">
      <h3>SelectItem textValue</h3>
      <Select>
        <SelectTrigger aria-label="Currency">
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="eur" textValue="Euro currency">
            Euro
          </SelectItem>
          <SelectItem value="gbp" textValue="Pound currency">
            Pound sterling
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);

/** G-8 — DatePicker popup geometry and dismissal. */
const DatePickerGeometry = () => (
  <div className="scenario">
    <div className="panel">
      <h3>DatePicker, single</h3>
      <DatePicker
        mode="single"
        setSelectedSingleDate={(d) => push({ src: "dp", date: d?.toDateString() })}
      />
    </div>
    <button type="button" className="outside" id="outside" onClick={() => push({ src: "outside" })}>
      outside
    </button>
    <div className="spacer" />
  </div>
);

/** DP-2 — controlled clear. */
const DatePickerClear = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  record("controlledDate", date?.toDateString() ?? null);
  return (
    <div className="scenario">
      <button
        type="button"
        id="clear"
        className="outside"
        onClick={() => {
          setDate(undefined);
          record("controlledDate", null);
          push({ src: "clear" });
        }}
      >
        clear
      </button>
      <div className="panel">
        <h3>DatePicker, controlled</h3>
        <DatePicker
          mode="single"
          selectedSingleDate={date}
          setSelectedSingleDate={(d) => {
            setDate(d);
            record("controlledDate", d?.toDateString() ?? null);
            push({ src: "dp", date: d?.toDateString() ?? null });
          }}
        />
      </div>
      <div className="spacer" />
    </div>
  );
};

/** DP-3 — isOpen supplied with no setIsOpen. */
const DatePickerStuck = () => (
  <div className="scenario">
    <div className="panel">
      <h3>DatePicker isOpen, no setIsOpen</h3>
      <DatePicker isOpen />
    </div>
    <button type="button" className="outside" id="outside" onClick={() => push({ src: "outside" })}>
      outside
    </button>
    <div className="spacer" />
  </div>
);

/** Calendar caption menus and multiple mode. */
const CalendarCaption = () => {
  const [days, setDays] = useState<Date[] | undefined>(undefined);
  record("multipleCount", days?.length ?? 0);
  return (
    <div className="scenario">
      <div className="panel" id="caption-panel">
        <h3>Calendar, dropdown caption</h3>
        {/*
          `defaultMonth`, not `month`: `month` is the CONTROLLED displayed
          month, so with it the caption menus cannot navigate at all and a
          "choosing a month does nothing" result would be the fixture's fault
          rather than the component's.
        */}
        <Calendar
          mode="single"
          defaultMonth={FIXED_DATE}
          selected={FIXED_DATE}
          onSelect={() => {}}
        />
      </div>
      <div className="panel" id="multiple-panel">
        <h3>Calendar, multiple mode</h3>
        <Calendar
          mode="multiple"
          month={FIXED_DATE}
          selected={days}
          onSelect={(next) => {
            setDays(next);
            record("multipleCount", next?.length ?? 0);
            push({ src: "calendar-multiple", count: next?.length ?? 0 });
          }}
        />
      </div>
      <div className="spacer" />
    </div>
  );
};

const SCENARIOS: Record<string, () => ReactNode> = {
  "radio-arrows": RadioArrows,
  "nested-label": NestedLabel,
  slider: SliderScenario,
  "select-geometry": SelectGeometry,
  "select-hide-icon": SelectHideIcon,
  "select-textvalue": SelectTextValue,
  "datepicker-geometry": DatePickerGeometry,
  "datepicker-clear": DatePickerClear,
  "datepicker-stuck": DatePickerStuck,
  "calendar-caption": CalendarCaption,
};

const name = new URLSearchParams(location.search).get("s") ?? "";
const Scenario = SCENARIOS[name];

const root = createRoot(document.getElementById("root")!);
if (!Scenario) {
  record("unknownScenario", name);
  root.render(
    <pre id="unknown-scenario">
      unknown scenario: {JSON.stringify(name)}
      {"\n"}known: {Object.keys(SCENARIOS).join(", ")}
    </pre>,
  );
} else {
  // No StrictMode: its intentional double-invocation would double-count the
  // change events these scenarios assert on.
  root.render(
    <Boundary>
      <Scenario />
    </Boundary>,
  );
}

/**
 * Signal readiness.
 *
 * Both a frame-based and a timer-based path, because headless Chrome can starve
 * `requestAnimationFrame` on a page it is not painting. Relying on rAF alone
 * left heavier scenarios (a Calendar with a dropdown caption mounted up front)
 * stuck at `__ready === false` forever, which the runner correctly reported as
 * a failure rather than passing coverage — but the fault was here, not in the
 * component under test.
 */
const markReady = () => {
  (window as unknown as { __ready: boolean }).__ready = true;
};
requestAnimationFrame(() => requestAnimationFrame(markReady));
setTimeout(markReady, 300);
