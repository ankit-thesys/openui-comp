// The bench app, rendered against either package: `m` is its namespace (`@openuidev/react-components`
// or `@openuidev/react-ui`). The spec server-renders it and `bench-*.tsx` hydrates it, so hydration,
// interaction and theme benches exercise both packages on the same tree.
import React, { useState } from "react";

// Components that server-render with no props in both packages, rendered bare for broad
// hydration coverage. A name a package lacks renders a `data-missing` marker instead.
export const BARE = [
  "AreaChart",
  "AreaChartCondensed",
  "BarChart",
  "BarChartCondensed",
  "Button",
  "Buttons",
  "CalendarHeatmap",
  "Callout",
  "Card",
  "CardHeader",
  "CheckBoxGroup",
  "CheckBoxItem",
  "Chips",
  "Citation",
  "CodeBlock",
  "CompositeCardBlock",
  "ContextCardBlock",
  "DotMatrixLoader",
  "EntityList",
  "FormControl",
  "Hint",
  "HorizontalBarChart",
  "IconButton",
  "IconTag",
  "IconText",
  "Image",
  "ImageBlock",
  "ImageText",
  "ImageTextLarge",
  "InlineHeader",
  "InlineMarkdownRenderer",
  "Input",
  "Label",
  "LineChart",
  "LineChartCondensed",
  "ListBlock",
  "ListItem",
  "ListedSources",
  "MarkDownRenderer",
  "MetricIndicatorInline",
  "MetricIndicatorWithStrikethrough",
  "MiniAreaChart",
  "MiniBarChart",
  "MiniLineChart",
  "OptionCards",
  "OverviewCardBlock",
  "PieChartSkeleton",
  "SectionV2",
  "SegmentedBar",
  "Separator",
  "SingleStackedBar",
  "Skeleton",
  "SliderBlock",
  "SnippetCardBlock",
  "Sources",
  "Steps",
  "SwitchGroup",
  "SwitchItem",
  "Table",
  "TableSkeleton",
  "Tag",
  "TagBlock",
  "TextArea",
  "TextCallout",
  "TextContent",
  "TextContentWrapper",
  "VisualCardBlock",
];

const chartData = [
  { month: "Jan", a: 10, b: 4 },
  { month: "Feb", a: 14, b: 9 },
  { month: "Mar", a: 8, b: 12 },
];

class Boundary extends React.Component<
  { name: string; children: React.ReactNode },
  { err?: string }
> {
  override state: { err?: string } = {};
  static getDerivedStateFromError(e: unknown) {
    return { err: String((e as Error)?.message ?? e) };
  }
  override render() {
    if (this.state.err) return <div data-render-error={this.props.name}>{this.state.err}</div>;
    return this.props.children;
  }
}

export type Mode = "light" | "dark";

export function makeApp(m: any) {
  function Controls() {
    const [checked, setChecked] = useState(false);
    const [sel, setSel] = useState<string>("");
    return (
      <section data-testid="interactive">
        <div data-testid="select">
          <m.Select value={sel} onValueChange={setSel}>
            <m.SelectTrigger aria-label="Fruit" data-testid="select-trigger">
              <m.SelectValue placeholder="Pick a fruit" />
            </m.SelectTrigger>
            <m.SelectContent data-testid="select-content">
              <m.SelectItem value="apple">Apple</m.SelectItem>
              <m.SelectItem value="banana">Banana</m.SelectItem>
              <m.SelectItem value="cherry">Cherry</m.SelectItem>
            </m.SelectContent>
          </m.Select>
          <output data-testid="select-value">{sel}</output>
        </div>

        <div data-testid="accordion">
          <m.Accordion type="single" collapsible defaultValue="one">
            <m.AccordionItem value="one">
              <m.AccordionTrigger text="First" />
              <m.AccordionContent>First body</m.AccordionContent>
            </m.AccordionItem>
            <m.AccordionItem value="two">
              <m.AccordionTrigger text="Second" />
              <m.AccordionContent>Second body</m.AccordionContent>
            </m.AccordionItem>
          </m.Accordion>
        </div>

        <div data-testid="tabs">
          <m.Tabs defaultValue="t1">
            <m.TabsList>
              <m.TabsTrigger value="t1" text="Tab one" />
              <m.TabsTrigger value="t2" text="Tab two" />
            </m.TabsList>
            <m.TabsContent value="t1">Panel one</m.TabsContent>
            <m.TabsContent value="t2">Panel two</m.TabsContent>
          </m.Tabs>
        </div>

        <div data-testid="tooltip">
          <m.TooltipWrapper
            tooltipHeading="Tip heading"
            tooltipContent="Tip body"
            delayDuration={0}
          >
            <button type="button" data-testid="tooltip-trigger">
              Hover me
            </button>
          </m.TooltipWrapper>
        </div>

        <div data-testid="datepicker">
          <m.DatePicker />
        </div>

        <div data-testid="switch">
          <m.SwitchItem label="Notify" checked={checked} onChange={setChecked} />
        </div>
        <div data-testid="checkbox">
          <m.CheckBoxItem label="Agree" />
        </div>
        <div data-testid="radio">
          <m.RadioGroup defaultValue="r1">
            <m.RadioItem value="r1" label="R1" />
            <m.RadioItem value="r2" label="R2" />
          </m.RadioGroup>
        </div>
        <div data-testid="slider">
          <m.Slider variant="continuous" min={0} max={100} step={1} defaultValue={[50]} />
        </div>

        <div data-testid="carousel" style={{ width: 300 }}>
          <m.Carousel showButtons>
            <m.CarouselContent>
              {Array.from({ length: 8 }, (_, i) => (
                <m.CarouselItem key={i} style={{ minWidth: 200 }}>
                  Item {i}
                </m.CarouselItem>
              ))}
            </m.CarouselContent>
            <m.CarouselPrevious />
            <m.CarouselNext />
          </m.Carousel>
        </div>
      </section>
    );
  }

  function ThemeProbe() {
    const t = m.useTheme();
    return <output data-testid="theme-mode">{t.mode}</output>;
  }

  return function App({ initialMode = "light" }: { initialMode?: "light" | "dark" }) {
    const [mode, setMode] = useState<"light" | "dark">(initialMode);
    return (
      <m.ThemeProvider mode={mode}>
        <button
          type="button"
          data-testid="toggle-mode"
          onClick={() => setMode((x) => (x === "light" ? "dark" : "light"))}
        >
          toggle
        </button>
        <ThemeProbe />
        <div data-testid="probe-button">
          <m.Button variant="primary">Primary</m.Button>
          <m.Button variant="secondary">Secondary</m.Button>
        </div>
        <div data-testid="probe-card">
          <m.Card>Card body</m.Card>
        </div>
        <div data-testid="nested" id="nested-scope">
          <m.ThemeProvider
            mode={mode}
            lightTheme={m.createTheme({
              interactiveAccentDefault: "rgb(200, 30, 30)",
            })}
          >
            <m.Button variant="primary">Nested primary</m.Button>
          </m.ThemeProvider>
        </div>
        <Controls />
        <section data-testid="bare">
          {BARE.map((name) =>
            m[name] ? (
              <div key={name} data-component={name}>
                <Boundary name={name}>
                  {React.createElement(
                    m[name],
                    /Chart|Bar$/.test(name) && !/Skeleton/.test(name)
                      ? { data: chartData, categoryKey: "month" }
                      : {},
                  )}
                </Boundary>
              </div>
            ) : (
              <div key={name} data-missing={name} />
            ),
          )}
        </section>
      </m.ThemeProvider>
    );
  };
}
