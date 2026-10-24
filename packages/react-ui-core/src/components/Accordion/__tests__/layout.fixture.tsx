import * as Core from "@openuidev/react-ui-core";
import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
const picture =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Crect width='24' height='24' fill='blue'/%3E%3C/svg%3E";
const icon = (
  <svg viewBox="0 0 16 16">
    <path d="M2 8h12" stroke="currentColor" />
  </svg>
);
const custom = {
  textNeutralPrimary: "rgb(40,70,90)",
  textNeutralSecondary: "rgb(60,80,100)",
  borderInteractiveSelected: "rgb(8,90,130)",
  spaceM: "18px",
};
function App() {
  const kind = new URLSearchParams(location.search).get("case");
  const framework = new URLSearchParams(location.search).get("framework");
  const [config, setConfig] = useState({
    variant: kind === "accordion" ? "clear" : kind === "tabs" ? "title" : "card",
    disabled: false,
    overrides: false,
    visible: true,
    isolation: false,
    theme: "light",
    multiple: false,
    controlled: false,
    uncontrolled: false,
    noSnap: false,
    showButtons: true,
    itemsToScroll: 1,
  });
  const [selection, setSelection] = useState<any>("a");
  const [events, setEvents] = useState<any[]>([]);
  const [left, setLeft] = useState(false),
    [right, setRight] = useState(false);
  const rootRef = useRef<any>(null),
    partRef = useRef<any>(null),
    triggerRef = useRef<any>(null),
    contentRef = useRef<any>(null);
  const overrides = config.overrides
    ? framework === "tailwind3"
      ? "!bg-red-500 !text-white !p-8 !rounded-none !border-0 hover:!bg-green-500 disabled:!bg-gray-500 disabled:!cursor-wait"
      : framework === "tailwind4"
        ? "bg-red-500! text-white! p-8! rounded-none! border-0! hover:bg-green-500! disabled:bg-gray-500! disabled:cursor-wait!"
        : "explicit"
    : undefined;
  Object.assign(window, {
    configure: (next: any) => setConfig((old) => ({ ...old, ...next })),
    setSelection,
    refs: () => ({
      root: rootRef.current,
      part: partRef.current,
      trigger: triggerRef.current,
      content: contentRef.current,
    }),
    scrollCarousel: (direction: any) => rootRef.current.scroll(direction),
  });
  const changed = (value: any) => {
    setEvents((old) => [...old, value]);
    if (!config.controlled) setSelection(value);
  };
  let control;
  if (kind === "accordion")
    control = (
      <Core.Accordion
        key={`${config.multiple}/${config.uncontrolled}`}
        ref={rootRef}
        type={config.multiple ? "multiple" : "single"}
        {...(config.uncontrolled
          ? { defaultValue: config.multiple ? ["a"] : "a" }
          : { value: selection })}
        onValueChange={changed}
        collapsible={!config.multiple}
        variant={config.variant as any}
      >
        {["a", "b", "c"].map((value, i) => (
          <Core.AccordionItem
            key={value}
            value={value}
            disabled={config.disabled || i === 1}
            ref={i === 0 ? partRef : undefined}
          >
            <Core.AccordionTrigger
              ref={i === 0 ? triggerRef : undefined}
              text={["Alpha", "Beta", "Gamma"][i]}
              icon={icon}
              className={overrides}
            />
            <Core.AccordionContent ref={i === 0 ? contentRef : undefined}>
              <p>{value} details</p>
              <button type="button">Action {value}</button>
            </Core.AccordionContent>
          </Core.AccordionItem>
        ))}
      </Core.Accordion>
    );
  if (kind === "steps")
    control = (
      <Core.Steps>
        <Core.StepsItem title="First" details={<p>First details</p>} />
        <Core.StepsItem
          title="Second"
          number={7}
          details={<button type="button">Second action</button>}
        />
        <Core.StepsItem title="Third" details="Third details" />
      </Core.Steps>
    );
  if (kind === "carousel")
    control = (
      <Core.Carousel
        ref={rootRef}
        noSnap={config.noSnap}
        showButtons={config.showButtons}
        itemsToScroll={config.itemsToScroll}
        variant={config.variant as any}
        onScrollLeftEnabled={setLeft}
        onScrollRightEnabled={setRight}
      >
        <Core.CarouselContent ref={partRef}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Core.CarouselItem key={n} className={overrides}>
              <h3>Card {n}</h3>
              <p>Details {n}</p>
              <button type="button">Action {n}</button>
            </Core.CarouselItem>
          ))}
        </Core.CarouselContent>
        <Core.CarouselPrevious icon={icon} aria-label="Previous cards" />
        <Core.CarouselNext icon={icon} aria-label="Next cards" />
      </Core.Carousel>
    );
  if (kind === "tabs")
    control = (
      <Core.Tabs
        key={String(config.uncontrolled)}
        ref={rootRef}
        {...(config.uncontrolled ? { defaultValue: "a" } : { value: selection })}
        onValueChange={changed}
      >
        <Core.TabsList ref={partRef} variant={config.variant as any} aria-label="Sections">
          {["a", "b", "c", "d", "e", "f"].map((value, i) => (
            <Core.TabsTrigger
              key={value}
              ref={i === 0 ? triggerRef : undefined}
              value={value}
              disabled={config.disabled || i === 1}
              text={["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta"][i]}
              subtext={config.variant.includes("Subtext") ? "Supporting detail" : undefined}
              icon={config.variant.startsWith("icon") ? icon : undefined}
              image={config.variant.startsWith("image") ? picture : undefined}
              className={overrides}
            />
          ))}
        </Core.TabsList>
        {["a", "b", "c", "d", "e", "f"].map((value) => (
          <Core.TabsContent ref={value === "a" ? contentRef : undefined} key={value} value={value}>
            <p>Panel {value}</p>
            <button type="button">Panel action {value}</button>
          </Core.TabsContent>
        ))}
      </Core.Tabs>
    );
  return (
    <>
      <div id="unrelated">Host content</div>
      <button id="start">Start</button>
      <section id="zone" data-ready>
        {config.visible &&
          (config.theme === "none" ? (
            control
          ) : (
            <Core.ThemeProvider
              cssSelector="#zone"
              mode={config.theme.includes("dark") ? "dark" : "light"}
              lightTheme={config.theme.startsWith("custom") ? custom : undefined}
              darkTheme={config.theme.startsWith("custom") ? custom : undefined}
            >
              {control}
            </Core.ThemeProvider>
          ))}
      </section>
      {config.isolation && (
        <>
          <section id="independent">
            <Core.ThemeProvider cssSelector="#independent" mode="light" lightTheme={custom}>
              <Core.Accordion type="single">
                <Core.AccordionItem value="independent">
                  <Core.AccordionTrigger text="Independent" />
                </Core.AccordionItem>
              </Core.Accordion>
            </Core.ThemeProvider>
          </section>
          <section id="outer">
            <Core.ThemeProvider cssSelector="#outer" mode="light">
              <Core.Steps>
                <Core.StepsItem title="Outer" details="Light" />
              </Core.Steps>
              <section id="nested">
                <Core.ThemeProvider cssSelector="#nested" mode="dark">
                  <Core.Steps>
                    <Core.StepsItem title="Nested" details="Dark" />
                  </Core.Steps>
                </Core.ThemeProvider>
              </section>
            </Core.ThemeProvider>
          </section>
        </>
      )}
      <button id="end">End</button>
      <output id="events">{JSON.stringify(events)}</output>
      <output id="scroll-state">{JSON.stringify({ left, right })}</output>
    </>
  );
}
createRoot(document.getElementById("app")!).render(<App />);
