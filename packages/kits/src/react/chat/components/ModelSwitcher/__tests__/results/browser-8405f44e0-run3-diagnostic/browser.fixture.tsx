// Each arm receives its own component imports from browser.mjs.
import { useState } from "react";
import { createRoot } from "react-dom/client";

const framework = new URLSearchParams(location.search).get("framework");
const overrideClass =
  framework === "tailwind3"
    ? "!bg-red-500 !text-white !p-8 !rounded-none !border-0 hover:!bg-green-500 disabled:!bg-gray-500 disabled:!cursor-wait"
    : framework === "tailwind4"
      ? "bg-red-500! text-white! p-8! rounded-none! border-0! hover:bg-green-500! disabled:bg-gray-500! disabled:cursor-wait!"
      : "explicit";
const customTheme = createTheme({
  textNeutralPrimary: "rgb(40, 70, 90)",
  textNeutralSecondary: "rgb(100, 80, 60)",
  highlight: "rgb(220, 230, 240)",
  highlightStrong: "rgb(190, 210, 230)",
  spaceS: "15px",
  spaceM: "20px",
});
const models = [
  {
    id: "fast",
    name: "Fast model",
    group: "Featured",
    recommended: true,
    badge: "Free",
    logo: { light: <span>L</span>, dark: <span>D</span> },
  },
  {
    id: "deep",
    name: "Deep model",
    group: "Paid",
    badge: "Pro",
    logo: { light: <span>L</span>, dark: <span>D</span> },
  },
  { id: "plain", name: "Plain model", badge: "Basic" },
];

function App() {
  const [theme, setTheme] = useState("light");
  const [value, setValue] = useState("fast");
  const [selections, setSelections] = useState<string[]>([]);
  const [queries, setQueries] = useState<string[]>([]);
  const [submits, setSubmits] = useState<string[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [overrides, setOverrides] = useState(false);
  Object.assign(window, { setTheme, setValue, setDisabled, setOverrides });
  const mode = theme.includes("dark") ? "dark" : "light";
  const contents = (
    <>
      <div id="model-zone" className={overrides ? "model-overrides" : undefined}>
        <ModelSwitcher
          models={models}
          value={value}
          onValueChange={(id) => {
            setValue(id);
            setSelections((previous) => [...previous, id]);
          }}
        />
      </div>
      <form
        id="queries"
        onSubmit={(event) => {
          event.preventDefault();
          const submitter = (event.nativeEvent as SubmitEvent).submitter;
          setSubmits((previous) => [...previous, submitter?.id ?? "none"]);
        }}
      >
        <button id="before-item" type="button">
          Before
        </button>
        <FollowUpBlock
          className="consumer-block"
          aria-label="Related questions"
          style={overrides ? { marginTop: 11 } : undefined}
        >
          <FollowUpItem
            id="default-item"
            text="Explain result"
            icon={<span aria-hidden="true">→</span>}
            name="query"
            value="explain"
            disabled={disabled}
            className={overrides ? overrideClass : undefined}
            style={overrides ? { marginLeft: 7 } : undefined}
            onClick={() => setQueries((previous) => [...previous, "explain"])}
          />
          <FollowUpItem
            id="button-item"
            type="button"
            text="Compare result"
            icon={<span aria-hidden="true">→</span>}
            onClick={() => setQueries((previous) => [...previous, "compare"])}
          />
        </FollowUpBlock>
        <button id="after-item" type="button">
          After
        </button>
      </form>
      <output id="selected">{value}</output>
      <output id="selections">{JSON.stringify(selections)}</output>
      <output id="query-events">{JSON.stringify(queries)}</output>
      <output id="submit-events">{JSON.stringify(submits)}</output>
      {theme === "nested" && (
        <section id="nested-zone">
          <ThemeProvider mode="dark" cssSelector="#nested-zone">
            <ModelSwitcher models={models} value="fast" onValueChange={() => {}} />
          </ThemeProvider>
        </section>
      )}
    </>
  );
  return (
    <>
      <div id="host-content">Host content</div>
      <section id="zone">
        {theme === "none" ? (
          contents
        ) : (
          <ThemeProvider
            mode={mode}
            cssSelector="#zone"
            lightTheme={theme.startsWith("custom") ? customTheme : undefined}
            darkTheme={theme.startsWith("custom") ? customTheme : undefined}
          >
            {contents}
          </ThemeProvider>
        )}
      </section>
      <output id="fixture-theme">{theme}</output>
    </>
  );
}

createRoot(document.getElementById("app")!).render(<App />);
