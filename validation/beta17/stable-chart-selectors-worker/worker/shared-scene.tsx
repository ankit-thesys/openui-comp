/** Test fixture only. Reuses the host entry's React and public package import. */
type SharedSceneProps = {
  React: typeof import("react");
  ui: typeof import("@openuidev/react-components");
  theme?: "light" | "dark" | "nested";
};

const palette = ["#336699", "#994433", "#337755", "#775599", "#997722", "#227788", "#885566", "#557733", "#665588", "#995522", "#448877", "#774455"];
const seriesKeys = Array.from({ length: 12 }, (_, i) => `Series ${i + 1}`);
const condensedData = ["January", "February", "March"].map((month, i) => ({
  month,
  ...Object.fromEntries(seriesKeys.map((key, j) => [key, (i + 2) * (j + 1) + 3])),
}));
const overflowData = Array.from({ length: 24 }, (_, i) => ({ month: `Month ${i + 1}`, value: 10 + i * 2 }));
const pieData = seriesKeys.map((name, i) => ({ name, value: i + 2 }));
const legendItems = pieData.map((item, i) => ({ key: `standalone-${i}`, label: item.name, value: item.value, color: palette[i]! }));

export function SharedChartProbeScene({ React, ui, theme = "nested" }: SharedSceneProps) {
  const { BarChart, BarChartCondensed, HorizontalBarChart, MiniLineChart, PieChart, StackedLegend, ThemeProvider } = ui;
  const [miniClicks, setMiniClicks] = React.useState(0);
  const [hiddenKeys, setHiddenKeys] = React.useState(new Set<string>());
  const [activeKey, setActiveKey] = React.useState<string | null>(null);
  const content = (
    <div data-shared-chart-probes style={{ width: 620 }}>
      <section data-shared-chart-scene="condensed">
        <BarChartCondensed data={condensedData} categoryKey="month" width={420} height={280} xAxisLabel="Month" yAxisLabel="Count" customPalette={palette} />
      </section>
      <section data-shared-chart-scene="empty">
        <BarChart data={[]} categoryKey="month" width={420} height={220} />
      </section>
      <section data-shared-chart-scene="mini">
        <MiniLineChart data={[4, 9, 6, 12]} size={140} isAnimationActive onLineClick={() => setMiniClicks(n => n + 1)} />
        <MiniLineChart data={[7]} size={100} isAnimationActive />
        <output data-shared-mini-clicks>{miniClicks}</output>
      </section>
      <section data-shared-chart-scene="horizontal-scroll">
        <BarChart data={overflowData} categoryKey="month" width={320} height={220} legend={false} />
      </section>
      <section data-shared-chart-scene="vertical-scroll">
        <HorizontalBarChart data={overflowData} categoryKey="month" width={480} height={240} legend={false} fitLegendInHeight={false} />
      </section>
      <section data-shared-chart-scene="stacked-row">
        <PieChart data={pieData} categoryKey="name" dataKey="value" width={520} height={296} legendVariant="stacked" customPalette={palette} />
      </section>
      <section data-shared-chart-scene="stacked-column">
        <PieChart data={pieData} categoryKey="name" dataKey="value" width={320} height={300} legendVariant="stacked" customPalette={palette} />
      </section>
      <section data-shared-chart-scene="standalone-legend">
        <StackedLegend items={legendItems} layout="scrollable" style={{ height: 128 }} separator hiddenKeys={hiddenKeys} activeKey={activeKey}
          onItemHover={setActiveKey}
          onItemToggle={key => setHiddenKeys(previous => {
            const next = new Set(previous);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
          })} />
      </section>
    </div>
  );
  const lightTheme = { textNeutralPrimary: "rgb(31, 32, 33)", foreground: "rgb(246, 247, 248)" };
  const darkTheme = { textNeutralPrimary: "rgb(211, 212, 213)", foreground: "rgb(21, 22, 23)" };
  return theme === "nested" ? (
    <ThemeProvider mode="dark" darkTheme={darkTheme}>
      <ThemeProvider mode="light" lightTheme={lightTheme}>{content}</ThemeProvider>
    </ThemeProvider>
  ) : <ThemeProvider mode={theme} lightTheme={lightTheme} darkTheme={darkTheme}>{content}</ThemeProvider>;
}
