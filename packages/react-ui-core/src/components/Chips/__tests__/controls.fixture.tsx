import * as Core from "@openuidev/react-ui-core";
import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";

const defaultSliderValue = [20];
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
    getRef: () => ref.current,
  });
  const items = [
    { value: "a", label: "Alpha", title: "**Alpha**", subtitle: "First _choice_" },
    { value: "b", label: "Beta", title: "Beta", disabled: true },
    { value: "c", label: "Gamma", title: "Gamma" },
  ];
  let control;
  if (kind === "slider")
    control = (
      <>
        <Core.Slider
          ref={ref}
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
        label="Volume"
        variant="continuous"
        min={0}
        max={100}
        step={5}
        defaultValue={defaultSliderValue}
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
          <Core.SelectTrigger ref={ref} id="trigger" aria-label="Plan">
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
        items={items}
        selected={selected}
        disabled={disabled}
        onToggle={(value) => {
          setSelected([value]);
          record(value);
        }}
      />
    );
  if (kind === "optionCards")
    control = (
      <Core.OptionCards
        ref={ref}
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
        mode="single"
        defaultMonth={new Date(2026, 9, 1)}
        startMonth={new Date(2020, 0, 1)}
        endMonth={new Date(2030, 11, 31)}
        selected={date}
        onSelect={(value) => {
          setDate(value);
          record(value?.toDateString());
        }}
        disabled={disabled}
      />
    );
  if (kind === "datePicker")
    control = (
      <Core.DatePicker
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
        <Core.ThemeProvider
          mode={mode}
          cssSelector="#zone"
          lightTheme={{ interactiveAccentDefault: "rgb(150,50,100)", spaceM: "18px" }}
          darkTheme={{ interactiveAccentDefault: "rgb(150,50,100)", spaceM: "18px" }}
        >
          {control}
        </Core.ThemeProvider>
      </section>
      <button id="end">End</button>
      <output id="events">{JSON.stringify(events)}</output>
    </>
  );
}
createRoot(document.getElementById("app")!).render(<App />);
