import * as Core from "@openuidev/react-ui-core";
import { useState } from "react";
import { createRoot } from "react-dom/client";
function App() {
  const [mode, setMode] = useState("none"),
    [overrides, setOverrides] = useState(false),
    [visible, setVisible] = useState(true),
    [open, setOpen] = useState<string[]>([]),
    [disabled, setDisabled] = useState(false);
  const [controlled, setControlled] = useState(true),
    [events, setEvents] = useState<string[][]>([]);
  Object.assign(window, { setMode, setOverrides, setVisible, setOpen, setDisabled, setControlled });
  const framework = new URLSearchParams(location.search).get("framework");
  const className = overrides
    ? framework === "tailwind3"
      ? "!bg-red-500 !text-white !p-8 !rounded-none !border-0 hover:!bg-green-500 disabled:!bg-gray-500 disabled:!cursor-wait"
      : framework === "tailwind4"
        ? "bg-red-500! text-white! p-8! rounded-none! border-0! hover:bg-green-500! disabled:bg-gray-500! disabled:cursor-wait!"
        : "explicit"
    : undefined;
  const content = (
    <div id="contents">
      <Core.Card id="card-target" variant="sunk" width="full" className={className}>
        <Core.CardHeader
          title="Summary"
          subtitle="Details"
          className={className}
          icon={
            <svg viewBox="0 0 10 10">
              <path d="M0 0h10v10H0z" />
            </svg>
          }
          actions={<Core.Button type="button">Action</Core.Button>}
        />
        Body
      </Core.Card>
      {(["clear", "card", "sunk"] as const).map((variant) => (
        <Core.Card key={variant} variant={variant} width="standard">
          {variant}
        </Core.Card>
      ))}
      <Core.Separator orientation="horizontal" className={className} />
      <div style={{ height: 40 }}>
        <Core.Separator orientation="vertical" decorative={false} className={className} />
      </div>
      <Core.SectionV2 trigger="Section summary">
        <p>Section content</p>
      </Core.SectionV2>
      <Core.FoldableSectionRoot
        key={String(controlled)}
        type="multiple"
        value={controlled ? open : undefined}
        defaultValue={controlled ? undefined : ["b"]}
        onValueChange={(value) => {
          setOpen(value);
          setEvents((previous) => [...previous, value]);
        }}
        disabled={disabled}
        className={className}
      >
        {["a", "b"].map((value) => (
          <Core.FoldableSectionItem key={value} value={value}>
            <Core.FoldableSectionTrigger text={"Section " + value} className={className} />
            <Core.FoldableSectionContent className={className}>
              Content {value}
            </Core.FoldableSectionContent>
          </Core.FoldableSectionItem>
        ))}
      </Core.FoldableSectionRoot>
      <Core.Skeleton count={3} height="18px" width="70%" className={className} />
      <Core.Skeleton count={0} />
      <Core.TableSkeleton rows={2} columns={3} />
      <Core.PieChartSkeleton size={96} legendItems={2} />
      <Core.PieChartSkeleton size={96} variant="donut" legendItems={0} />
      <Core.PieChartSkeleton size={96} appearance="semiCircular" />
      <Core.PieChartSkeleton size={96} appearance="semiCircular" variant="donut" />
      <Core.DotMatrixLoader className={className} />
      <Core.DotMatrixLoader variant="compact" />
      <Core.DotMatrixLoader variant="compact" size={48} />
      <Core.Card width="full" id="combined-layout">
        <Core.Tabs defaultValue="combined-a" variant="clear">
          <Core.TabsList>
            <Core.TabsTrigger value="combined-a" text="Combined A" />
            <Core.TabsTrigger value="combined-b" text="Combined B" />
          </Core.TabsList>
          <Core.TabsContent value="combined-a">
            <Core.Accordion type="single" defaultValue="combined-item" collapsible variant="card">
              <Core.AccordionItem value="combined-item">
                <Core.AccordionTrigger text="Combined details" />
                <Core.AccordionContent>
                  <Core.Carousel>
                    <Core.CarouselContent>
                      {[1, 2, 3, 4].map((item) => (
                        <Core.CarouselItem key={item} style={{ flex: "0 0 180px" }}>
                          <Core.Card variant="sunk" width="full">
                            Item {item}
                          </Core.Card>
                        </Core.CarouselItem>
                      ))}
                    </Core.CarouselContent>
                    <Core.CarouselPrevious icon={<svg />} aria-label="Combined previous" />
                    <Core.CarouselNext icon={<svg />} aria-label="Combined next" />
                  </Core.Carousel>
                  <Core.Steps>
                    <Core.StepsItem title="First" details="Details" />
                    <Core.StepsItem title="Second" details="More details" />
                  </Core.Steps>
                </Core.AccordionContent>
              </Core.AccordionItem>
            </Core.Accordion>
          </Core.TabsContent>
          <Core.TabsContent value="combined-b">Second panel</Core.TabsContent>
        </Core.Tabs>
      </Core.Card>
      <Core.ThemeProvider
        mode="dark"
        cssSelector="#nested-theme"
        darkTheme={{ textNeutralPrimary: "rgb(12, 34, 56)" }}
      >
        <div id="nested-theme">
          <Core.Card variant="sunk" width="full">
            Nested theme
          </Core.Card>
        </div>
      </Core.ThemeProvider>
    </div>
  );
  return (
    <>
      <button id="start">Start</button>
      <div id="unrelated">Host content</div>
      <section id="zone">
        {visible &&
          (mode === "none" ? (
            content
          ) : (
            <Core.ThemeProvider
              mode={mode.includes("dark") ? "dark" : "light"}
              cssSelector="#zone"
              lightTheme={
                mode.startsWith("custom")
                  ? { textNeutralPrimary: "rgb(40,70,90)", spaceL: "22px" }
                  : undefined
              }
              darkTheme={
                mode.startsWith("custom")
                  ? { textNeutralPrimary: "rgb(40,70,90)", spaceL: "22px" }
                  : undefined
              }
            >
              {content}
            </Core.ThemeProvider>
          ))}
      </section>
      <output id="events">{JSON.stringify(events)}</output>
    </>
  );
}
createRoot(document.getElementById("app")!).render(<App />);
