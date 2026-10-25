import * as Core from "@openuidev/react-ui-core";
import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";

type Configuration = {
  theme: string;
  nested: boolean;
  overrides: boolean;
  visible: boolean;
  count: number;
  width: number;
  type: "single" | "multiple";
  disabled: boolean;
  autoUpdate: boolean;
  subtitle: boolean;
  updated: boolean;
};
declare global {
  interface Window {
    mountOptions: () => void;
    configure: (next: Partial<Configuration>) => void;
    readRef: () => boolean;
    readEvents: () => string[];
    clearEvents: () => void;
    resetSelection: () => void;
  }
}
const custom = {
  textNeutralPrimary: "rgb(40,70,90)",
  textNeutralSecondary: "rgb(60,80,100)",
  textNeutralTertiary: "rgb(100,110,120)",
  spaceM: "18px",
  radius2xl: "17px",
};
function App() {
  const framework = new URLSearchParams(location.search).get("framework");
  const [config, setConfig] = useState<Configuration>({
    theme: "light",
    nested: false,
    overrides: false,
    visible: true,
    count: 5,
    width: 900,
    type: "single",
    disabled: false,
    autoUpdate: false,
    subtitle: true,
    updated: false,
  });
  const [selected, setSelected] = useState(["value-1"]);
  const [events, setEvents] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  Object.assign(window, {
    configure: (next: Partial<Configuration>) => setConfig((old) => ({ ...old, ...next })),
    readEvents: () => events,
    clearEvents: () => setEvents([]),
    resetSelection: () => setSelected(["value-1"]),
    readRef: () =>
      config.visible ? ref.current === document.querySelector("#options") : ref.current === null,
  });
  const override = !config.overrides
    ? undefined
    : framework === "tailwind3"
      ? "!bg-red-500 !text-white !p-8 !rounded-none !border-0 hover:!bg-green-500"
      : framework === "tailwind4"
        ? "bg-red-500! text-white! p-8! rounded-none! border-0! hover:bg-green-500!"
        : "explicit";
  const items: Core.OptionCardsItem[] = Array.from({ length: config.count }, (_, index) => ({
    value: `value-${index}`,
    title: `**${config.updated ? "Updated" : "Option"} ${index}**`,
    subtitle: config.subtitle ? "Choose *this option*" : undefined,
    disabled: index === 2,
    ...(index % 3 === 0
      ? { topContent: 0 }
      : index % 3 === 1
        ? {
            topContent: <img src="/image.svg" alt="Option image" />,
            topContentVariant: "image" as const,
          }
        : {}),
  }));
  const content = (
    <div style={{ width: config.width, maxWidth: "100%" }}>
      <Core.OptionCards
        id="options"
        aria-label="Choices"
        ref={ref}
        className={override}
        items={items}
        selected={selected}
        type={config.type}
        disabled={config.disabled}
        onToggle={(value) => {
          setEvents((old) => [...old, value]);
          if (config.autoUpdate)
            setSelected((old) =>
              config.type === "single"
                ? [value]
                : old.includes(value)
                  ? old.filter((item) => item !== value)
                  : [...old, value],
            );
        }}
      />
    </div>
  );
  return (
    <>
      <div id="unrelated">Host content</div>
      <button id="outside">Outside</button>
      <style>{`.descendant-overrides .openui-option-card{background:rgb(220,30,50)!important;border-radius:0!important}.descendant-overrides .openui-option-card:hover:not(:disabled){background:rgb(30,180,90)!important}.descendant-overrides .openui-option-card:disabled{cursor:wait!important;background:rgb(150,150,150)!important}`}</style>
      <section
        id="zone"
        className={config.overrides ? "descendant-overrides" : undefined}
        data-ready
        data-config={JSON.stringify(config)}
      >
        {config.visible &&
          (config.theme === "none" ? (
            content
          ) : (
            <Core.ThemeProvider
              cssSelector="#zone"
              mode={config.theme.includes("dark") ? "dark" : "light"}
              lightTheme={config.theme.startsWith("custom") ? custom : undefined}
              darkTheme={config.theme.startsWith("custom") ? custom : undefined}
            >
              <span id="outer-color" style={{ color: "var(--openui-text-neutral-primary)" }}>
                Outer scope
              </span>
              <div id="nested-owner">
                {config.nested ? (
                  <Core.ThemeProvider cssSelector="#nested-owner" mode="dark" darkTheme={custom}>
                    {content}
                  </Core.ThemeProvider>
                ) : (
                  content
                )}
              </div>
            </Core.ThemeProvider>
          ))}
      </section>
      <section id="independent">
        <Core.ThemeProvider cssSelector="#independent" mode="light">
          <span id="independent-color" style={{ color: "var(--openui-text-neutral-primary)" }}>
            Independent scope
          </span>
        </Core.ThemeProvider>
      </section>
      <output id="events">{JSON.stringify(events)}</output>
    </>
  );
}
const root = createRoot(document.getElementById("app")!);
window.mountOptions = () => root.render(<App />);
