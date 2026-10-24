import * as Core from "@openuidev/react-ui-core";
import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";

const defaultSliderValue = [20];
const defaultRangeValue = [20, 80];
const customTheme = {
  interactiveAccentDefault: "rgb(150,50,100)",
  spaceM: "18px",
  borderInteractiveSelected: "rgb(8,90,130)",
  textNeutralPrimary: "rgb(40,70,90)",
};
function App() {
  const kind = new URLSearchParams(location.search).get("case");
  const [disabled, setDisabled] = useState(false),
    [size, setSize] = useState("md"),
    [variant, setVariant] = useState("continuous");
  const [values, setValues] = useState([20]),
    [selected, setSelected] = useState(["a"]),
    [choice, setChoice] = useState("a");
  const [date, setDate] = useState(new Date(2026, 9, 15)),
    [range, setRange] = useState(undefined),
    [open, setOpen] = useState(false),
    [mode, setMode] = useState("light");
  const [events, setEvents] = useState([]);
  const [streaming, setStreaming] = useState(false),
    [blockRange, setBlockRange] = useState(false);
  const [visible, setVisible] = useState(true),
    [overrides, setOverrides] = useState(false),
    [calendarMode, setCalendarMode] = useState("single"),
    [calendarSelection, setCalendarSelection] = useState(new Date(2026, 9, 15)),
    [pickerMode, setPickerMode] = useState("single");
  const framework = new URLSearchParams(location.search).get("framework");
  const overrideClass =
    framework === "tailwind3"
      ? "!bg-red-500 !text-white !p-8 !rounded-none !border-0 hover:!bg-green-500 disabled:!bg-gray-500 disabled:!cursor-wait"
      : framework === "tailwind4"
        ? "bg-red-500! text-white! p-8! rounded-none! border-0! hover:bg-green-500! disabled:bg-gray-500! disabled:cursor-wait!"
        : "explicit";
  const ref = useRef(null);
  const record = (value) => setEvents((previous) => [...previous, value]);
  Object.assign(window, {
    setDisabled,
    setSize,
    setVariant,
    setValues,
    setSelected,
    setChoice,
    setMode,
    setOpen,
    setVisible,
    setOverrides,
    setCalendarMode,
    setCalendarSelection,
    setPickerMode,
    setStreaming,
    setBlockRange,
    getRef: () => ref.current,
  });
  const items = [
    {
      value: "a",
      label: "Alpha",
      title: "**Alpha**",
      subtitle: "First _choice_",
      icon: (
        <svg viewBox="0 0 10 10">
          <path d="M0 0h10v10H0z" />
        </svg>
      ),
    },
    { value: "b", label: "Beta", title: "Beta", disabled: true },
    { value: "c", label: "Gamma", title: "Gamma" },
  ];
  let control;
  if (kind === "slider")
    control = (
      <>
        <Core.Slider
          ref={ref}
          className={overrides ? overrideClass : undefined}
          aria-label="Volume"
          variant={variant}
          min={0}
          max={100}
          step={5}
          value={values}
          disabled={disabled}
          leftContent="Min"
          rightContent="Max"
          onValueChange={(value) => {
            setValues(value);
            record(value);
          }}
          onValueCommit={(value) => record({ commit: value })}
        />
        <output id="value">{JSON.stringify(values)}</output>
      </>
    );
  if (kind === "sliderBlock")
    control = (
      <Core.SliderBlock
        className={overrides ? overrideClass : undefined}
        label="Volume"
        variant={variant}
        min={0}
        max={100}
        step={5}
        defaultValue={blockRange ? defaultRangeValue : defaultSliderValue}
        isStreaming={streaming}
        disabled={disabled}
        onValueCommit={(value) => record(value)}
      />
    );
  if (kind === "select")
    control = (
      <>
        <Core.Select
          size={size}
          value={choice}
          onValueChange={(value) => {
            setChoice(value);
            record(value);
          }}
          disabled={disabled}
        >
          <Core.SelectTrigger
            ref={ref}
            id="trigger"
            aria-label="Plan"
            className={overrides ? overrideClass : undefined}
          >
            <Core.SelectValue placeholder="Choose" />
          </Core.SelectTrigger>
          <Core.SelectContent>
            <Core.SelectGroup>
              <Core.SelectLabel>Plans</Core.SelectLabel>
              <Core.SelectItem value="a">Alpha</Core.SelectItem>
              <Core.SelectItem value="b" disabled>
                Beta
              </Core.SelectItem>
              <Core.SelectSeparator />
              <Core.SelectItem value="c" textValue="Third">
                Gamma
              </Core.SelectItem>
            </Core.SelectGroup>
          </Core.SelectContent>
        </Core.Select>
        <output id="value">{choice}</output>
      </>
    );
  if (kind === "chips")
    control = (
      <Core.Chips
        ref={ref}
        className={overrides ? overrideClass : undefined}
        items={items}
        selected={selected}
        disabled={disabled}
        onToggle={(value) => {
          setSelected([value]);
          record(value);
        }}
      />
    );
  if (kind === "calendar")
    control = (
      <Core.Calendar
        ref={ref}
        className={overrides ? overrideClass : undefined}
        mode={calendarMode}
        defaultMonth={new Date(2026, 9, 1)}
        startMonth={new Date(2020, 0, 1)}
        endMonth={new Date(2030, 11, 31)}
        selected={calendarSelection}
        onSelect={(value) => {
          setCalendarSelection(value);
          record(value instanceof Date ? value.toDateString() : value);
        }}
        disabled={disabled}
      />
    );
  if (kind === "datePicker")
    control = (
      <Core.DatePicker
        className={overrides ? overrideClass : undefined}
        mode={pickerMode}
        selectedRangeDates={range}
        setSelectedRangeDates={(value) => {
          setRange(value);
          record(value);
        }}
        selectedSingleDate={date}
        setSelectedSingleDate={(value) => {
          setDate(value);
          record(value?.toDateString());
        }}
        isOpen={open}
        setIsOpen={setOpen}
      />
    );
  return (
    <>
      <div id="unrelated">Host content</div>
      <button id="start">Start</button>
      <section id="zone" data-ready>
        {visible &&
          (mode === "none" ? (
            control
          ) : (
            <Core.ThemeProvider
              mode={mode.includes("dark") ? "dark" : "light"}
              cssSelector="#zone"
              lightTheme={mode.startsWith("custom") ? customTheme : undefined}
              darkTheme={mode.startsWith("custom") ? customTheme : undefined}
            >
              {control}
            </Core.ThemeProvider>
          ))}
      </section>
      <button id="end">End</button>
      <output id="events">{JSON.stringify(events)}</output>
      <output id="calendar-selection">{JSON.stringify(calendarSelection)}</output>
    </>
  );
}
createRoot(document.getElementById("app")!).render(<App />);
