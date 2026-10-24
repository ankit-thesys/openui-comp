/**
 * Runnable legacy consumer for issue #19.
 *
 * One app that wires every in-scope form-control family using the UNCHANGED
 * components from packages/react-ui, the way a real consumer would: local
 * state, change callbacks, disabled cases, and a live summary of the resulting
 * values so behavior is observable both in a browser and from a test.
 *
 * Rules this fixture follows:
 *  - Deterministic inputs only (fixtures/data.ts); no Date.now(), no random.
 *  - Legacy components are imported and used as-is; nothing is patched.
 *  - Families that #19 excludes (Button/Input/TextArea, Charts) are absent,
 *    except where a legacy component composes them internally.
 *  - Components known to CRASH at this baseline (SelectTrigger's
 *    `hideDropdownIcon`, see defect SE-1) are exercised in the test suite
 *    rather than here, so the consumer itself always renders.
 *
 * Run it in a browser:  see ../README.md ("Running the consumer").
 */
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { Buttons } from "../../../packages/react-ui/src/components/Buttons";
import { Calendar } from "../../../packages/react-ui/src/components/Calendar";
import { CheckBoxGroup } from "../../../packages/react-ui/src/components/CheckBoxGroup";
import { CheckBoxItem } from "../../../packages/react-ui/src/components/CheckBoxItem";
import { Chips } from "../../../packages/react-ui/src/components/Chips";
import { DatePicker } from "../../../packages/react-ui/src/components/DatePicker";
import { FormControl, Hint } from "../../../packages/react-ui/src/components/FormControl";
import { IconButton } from "../../../packages/react-ui/src/components/IconButton";
import { Label } from "../../../packages/react-ui/src/components/Label";
import { OptionCards } from "../../../packages/react-ui/src/components/OptionCards";
import { RadioGroup } from "../../../packages/react-ui/src/components/RadioGroup";
import { RadioItem } from "../../../packages/react-ui/src/components/RadioItem";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../../../packages/react-ui/src/components/Select";
import { Slider } from "../../../packages/react-ui/src/components/Slider/Slider";
import { SwitchGroup } from "../../../packages/react-ui/src/components/SwitchGroup";
import { SwitchItem } from "../../../packages/react-ui/src/components/SwitchItem";
import { ToggleGroup } from "../../../packages/react-ui/src/components/ToggleGroup";
import { ToggleItem } from "../../../packages/react-ui/src/components/ToggleItem";

import {
  CHECKBOX_ITEMS,
  CHIPS_ITEMS,
  FIXED_DATE,
  OPTION_CARD_ITEMS,
  RADIO_ITEMS,
  SELECT_ITEMS,
  SLIDER_DEFAULT,
  SLIDER_MAX,
  SLIDER_MIN,
  SLIDER_STEP,
  SWITCH_ITEMS,
  TOGGLE_ITEMS,
} from "./data";

/** Shape of everything the consumer is holding, surfaced for assertions. */
export interface ConsumerState {
  checkboxes: string[];
  shipping: string;
  notifications: string[];
  view: string;
  currency: string;
  languages: string[];
  plan: string[];
  budget: number[];
  single?: Date;
  range?: DateRange;
  calendarDay?: Date;
  iconClicks: number;
}

const toggleInArray = (values: string[], value: string) =>
  values.includes(value) ? values.filter((v) => v !== value) : [...values, value];

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 5h10M6 5V3h4v2M5 5l1 8h4l1-8" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

export interface LegacyConsumerAppProps {
  /** Called with the full state after every change; used by the consumer test. */
  onStateChange?: (state: ConsumerState) => void;
}

export const LegacyConsumerApp = ({ onStateChange }: LegacyConsumerAppProps) => {
  const [checkboxes, setCheckboxes] = useState<string[]>([]);
  const [shipping, setShipping] = useState<string>(RADIO_ITEMS[0].value);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [view, setView] = useState<string>(TOGGLE_ITEMS[0].value);
  const [currency, setCurrency] = useState<string>("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [plan, setPlan] = useState<string[]>([]);
  const [budget, setBudget] = useState<number[]>(SLIDER_DEFAULT);
  const [single, setSingle] = useState<Date | undefined>(undefined);
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [calendarDay, setCalendarDay] = useState<Date | undefined>(FIXED_DATE);
  const [iconClicks, setIconClicks] = useState(0);

  const state: ConsumerState = {
    checkboxes,
    shipping,
    notifications,
    view,
    currency,
    languages,
    plan,
    budget,
    single,
    range,
    calendarDay,
    iconClicks,
  };

  /** Publish state AFTER the triggering update, so the test sees the new value. */
  const publish = (next: Partial<ConsumerState>) => onStateChange?.({ ...state, ...next });

  return (
    <main className="legacy-consumer" data-testid="legacy-consumer">
      <h1>Legacy form-control consumer (issue #19 baseline)</h1>

      {/* ---------------------------------------------------------------- */}
      <section data-testid="section-checkboxes">
        <FormControl>
          <Label htmlFor="digest-group" required>
            Email preferences
          </Label>
          <CheckBoxGroup variant="card">
            {CHECKBOX_ITEMS.map((item) => (
              <CheckBoxItem
                key={item.value}
                label={item.label}
                description={item.description}
                checked={checkboxes.includes(item.value)}
                disabled={item.value === "push"}
                onChange={() => {
                  const next = toggleInArray(checkboxes, item.value);
                  setCheckboxes(next);
                  publish({ checkboxes: next });
                }}
              />
            ))}
          </CheckBoxGroup>
          <Hint>At least one channel is recommended.</Hint>
        </FormControl>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section data-testid="section-radio">
        <FormControl hasError={shipping === "overnight"}>
          <Label>Shipping speed</Label>
          <RadioGroup
            variant="sunk"
            value={shipping}
            onValueChange={(value) => {
              setShipping(value);
              publish({ shipping: value });
            }}
          >
            {RADIO_ITEMS.map((item) => (
              <RadioItem
                key={item.value}
                value={item.value}
                label={item.label}
                description={item.description}
              />
            ))}
          </RadioGroup>
          <Hint>Overnight delivery is treated as an error state in this fixture.</Hint>
        </FormControl>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section data-testid="section-switches">
        <Label>Notifications</Label>
        <SwitchGroup variant="card">
          {SWITCH_ITEMS.map((item) => (
            <SwitchItem
              key={item.value}
              label={item.label}
              description={item.description}
              checked={notifications.includes(item.value)}
              onChange={() => {
                const next = toggleInArray(notifications, item.value);
                setNotifications(next);
                publish({ notifications: next });
              }}
            />
          ))}
        </SwitchGroup>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section data-testid="section-toggle">
        <Label>Result layout</Label>
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(value) => {
            setView(value);
            publish({ view: value });
          }}
        >
          {TOGGLE_ITEMS.map((item) => (
            <ToggleItem key={item.value} value={item.value}>
              {item.label}
            </ToggleItem>
          ))}
        </ToggleGroup>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section data-testid="section-select">
        <FormControl>
          <Label>Reporting currency</Label>
          <Select
            value={currency || undefined}
            onValueChange={(value) => {
              setCurrency(value);
              publish({ currency: value });
            }}
          >
            <SelectTrigger aria-label="Reporting currency">
              <SelectValue placeholder="Pick a currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Europe</SelectLabel>
                <SelectItem value={SELECT_ITEMS[0].value}>{SELECT_ITEMS[0].label}</SelectItem>
                <SelectItem value={SELECT_ITEMS[1].value}>{SELECT_ITEMS[1].label}</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Asia</SelectLabel>
                <SelectItem value={SELECT_ITEMS[2].value}>{SELECT_ITEMS[2].label}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Hint>Used for every figure in the report.</Hint>
        </FormControl>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section data-testid="section-chips">
        <Label>Languages</Label>
        <Chips
          items={CHIPS_ITEMS.map((item) => ({ ...item }))}
          selected={languages}
          type="multiple"
          onToggle={(value) => {
            // Chips emits only the toggled value; the consumer owns the array.
            const next = toggleInArray(languages, value);
            setLanguages(next);
            publish({ languages: next });
          }}
        />
      </section>

      {/* ---------------------------------------------------------------- */}
      <section data-testid="section-option-cards">
        <Label>Plan</Label>
        <OptionCards
          items={OPTION_CARD_ITEMS.map((item) => ({ ...item }))}
          selected={plan}
          type="single"
          onToggle={(value) => {
            // type="single" is NOT enforced by the component (finding OC-1/C-2),
            // so single-selection is implemented here, in the consumer.
            const next = plan.includes(value) ? [] : [value];
            setPlan(next);
            publish({ plan: next });
          }}
        />
      </section>

      {/* ---------------------------------------------------------------- */}
      <section data-testid="section-slider">
        <Label>Monthly budget</Label>
        <Slider
          variant="discrete"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={SLIDER_STEP}
          value={budget}
          onValueChange={(value) => {
            setBudget(value);
            publish({ budget: value });
          }}
          leftContent={<span>Min</span>}
          rightContent={<span>Max</span>}
        />
      </section>

      {/* ---------------------------------------------------------------- */}
      <section data-testid="section-datepicker-single">
        <Label>Report date</Label>
        <DatePicker
          mode="single"
          selectedSingleDate={single}
          setSelectedSingleDate={(date) => {
            setSingle(date);
            publish({ single: date });
          }}
        />
      </section>

      <section data-testid="section-datepicker-range">
        <Label>Comparison window</Label>
        <DatePicker
          mode="range"
          selectedRangeDates={range}
          setSelectedRangeDates={(next) => {
            setRange(next);
            publish({ range: next });
          }}
        />
      </section>

      {/* ---------------------------------------------------------------- */}
      <section data-testid="section-calendar">
        <Label>Inline calendar</Label>
        <Calendar
          mode="single"
          month={FIXED_DATE}
          selected={calendarDay}
          onSelect={(date) => {
            setCalendarDay(date);
            publish({ calendarDay: date });
          }}
        />
      </section>

      {/* ---------------------------------------------------------------- */}
      <section data-testid="section-buttons">
        <Label>Row actions</Label>
        <Buttons variant="horizontal" aria-label="Row actions">
          <IconButton
            // type="button" is set explicitly: IconButton does not default it,
            // so inside a <form> it would submit (finding IB-1).
            type="button"
            icon={<TrashIcon />}
            aria-label="Delete row"
            appearance="destructive"
            variant="secondary"
            onClick={() => {
              const next = iconClicks + 1;
              setIconClicks(next);
              publish({ iconClicks: next });
            }}
          />
          <IconButton
            type="button"
            icon={<TrashIcon />}
            aria-label="Delete row (disabled)"
            disabled
          />
        </Buttons>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section data-testid="summary">
        <h2>Current values</h2>
        <dl>
          <dt>checkboxes</dt>
          <dd data-testid="v-checkboxes">{checkboxes.join(",") || "—"}</dd>
          <dt>shipping</dt>
          <dd data-testid="v-shipping">{shipping}</dd>
          <dt>notifications</dt>
          <dd data-testid="v-notifications">{notifications.join(",") || "—"}</dd>
          <dt>view</dt>
          <dd data-testid="v-view">{view || "—"}</dd>
          <dt>currency</dt>
          <dd data-testid="v-currency">{currency || "—"}</dd>
          <dt>languages</dt>
          <dd data-testid="v-languages">{languages.join(",") || "—"}</dd>
          <dt>plan</dt>
          <dd data-testid="v-plan">{plan.join(",") || "—"}</dd>
          <dt>budget</dt>
          <dd data-testid="v-budget">{budget.join("-")}</dd>
          <dt>icon clicks</dt>
          <dd data-testid="v-icon-clicks">{iconClicks}</dd>
        </dl>
      </section>
    </main>
  );
};
