// Imports are supplied by browser.mjs so each arm has an independent module graph.
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
  spaceSM: "15px",
  spaceM: "20px",
  radiusM: "13px",
  interactiveAccentDefault: "rgb(150, 50, 100)",
  textNeutralPrimary: "rgb(40, 70, 90)",
});
function App() {
  const [mode, setMode] = useState("light");
  const [disabled, setDisabled] = useState(false);
  const [overrides, setOverrides] = useState(false);
  const [visible, setVisible] = useState(true);
  const [clicks, setClicks] = useState(0);
  Object.assign(window, { setMode, setDisabled, setOverrides, setVisible });
  const controls = (
    <main id="controls">
      <button id="start">Start</button>
      <Button id="action" onClick={() => setClicks(clicks + 1)}>
        Action
      </Button>
      <Button disabled>Disabled</Button>
      <Input id="name" aria-label="Name" />
      <Input disabled aria-label="Disabled name" />
      <TextArea id="notes" aria-label="Notes" />
      <TextArea disabled aria-label="Disabled notes" />
      <button id="end">End</button>
      <output id="clicks">{clicks}</output>
      <section id="variants">
        {(["normal", "destructive"] as const).flatMap((buttonType) =>
          (["primary", "secondary", "tertiary"] as const).flatMap((variant) =>
            (["extra-small", "small", "medium", "large"] as const).map((size) => (
              <Button
                key={`${buttonType}-${variant}-${size}`}
                data-sample={`button-${buttonType}-${variant}-${size}`}
                buttonType={buttonType}
                variant={variant}
                size={size}
                disabled={disabled}
                className={overrides ? overrideClass : undefined}
              >
                Test
                <svg viewBox="0 0 10 10">
                  <path d="M0 0h10v10H0z" />
                </svg>
              </Button>
            )),
          ),
        )}
      </section>
      {(["small", "medium", "large"] as const).flatMap((size) =>
        [false, true].map((hasError) => (
          <Input
            key={`${size}-${hasError}`}
            data-sample={`input-${size}-${hasError}`}
            placeholder="Name"
            size={size}
            hasError={hasError}
            disabled={disabled}
            className={overrides ? overrideClass : undefined}
          />
        )),
      )}
      {[false, true].map((hasError) => (
        <TextArea
          key={String(hasError)}
          data-sample={`textarea-${hasError}`}
          placeholder="Notes"
          hasError={hasError}
          disabled={disabled}
          className={overrides ? overrideClass : undefined}
        />
      ))}
    </main>
  );
  return (
    <>
      <div id="unrelated">Host content</div>
      <section id="zone">
        {visible &&
          (mode === "none" && ARM === "runtime" ? (
            controls
          ) : (
            <ThemeProvider
              mode={mode.includes("dark") ? "dark" : "light"}
              cssSelector="#zone"
              lightTheme={mode.startsWith("custom") ? customTheme : undefined}
            >
              {controls}
            </ThemeProvider>
          ))}
      </section>
    </>
  );
}
createRoot(document.getElementById("app")!).render(<App />);
