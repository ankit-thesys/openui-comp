// Public chart compositions cover shared foundations without exporting their implementation parts.
import {
  BarChart,
  HorizontalBarChart,
  LineChart,
  MiniAreaChart,
  MiniBarChart,
  MiniLineChart,
  PieChart,
  StackedLegend,
} from "@openuidev/react-components";

export const foundationItems = Array.from({ length: 9 }, (_, i) => ({
  key: `series${i}`,
  label: `Series ${i}`,
  value: i + 1,
  color: "teal",
}));
const data = Array.from({ length: 25 }, (_, i) => ({ month: `Month ${i}`, sales: i + 1 }));
const manySeries: Array<Record<string, string | number>> = [
  { month: "Jan", ...Object.fromEntries(foundationItems.map((item) => [item.key, item.value])) },
];
const Icon = () => (
  <svg viewBox="0 0 10 10">
    <circle cx="5" cy="5" r="4" />
  </svg>
);

export const chartFoundationElements = () => [
  <LineChart key="empty" data={[]} categoryKey="month" />,
  <BarChart key="empty-bar" data={[]} categoryKey="month" />,
  <PieChart key="empty-pie" data={[]} categoryKey="name" dataKey="value" legend={false} />,
  <LineChart
    key="legend"
    data={manySeries}
    categoryKey="month"
    width={240}
    height={260}
    xAxisLabel="Month"
    yAxisLabel="Sales"
    icons={{ series0: Icon }}
  />,
  <LineChart
    key="axes"
    data={data.slice(0, 2)}
    categoryKey="month"
    width={400}
    height={260}
    condensed
    xAxisLabel="Month"
    yAxisLabel="Sales"
  />,
  <LineChart
    key="scroll"
    data={data}
    categoryKey="month"
    width={300}
    height={260}
    isAnimationActive
  />,
  <HorizontalBarChart key="vertical" data={data} categoryKey="month" width={300} height={260} />,
  <PieChart
    key="percentages"
    format="percentage"
    data={foundationItems.map((item) => ({ name: item.label, value: item.value }))}
    categoryKey="name"
    dataKey="value"
    width={400}
    height={260}
    legendVariant="default"
  />,
  <PieChart
    key="layout-row"
    data={[]}
    categoryKey="name"
    dataKey="value"
    width={500}
    height={296}
  />,
  <PieChart
    key="layout-column"
    data={[]}
    categoryKey="name"
    dataKey="value"
    width={300}
    height={296}
  />,
  <StackedLegend
    key="stacked"
    items={foundationItems}
    activeKey="series0"
    hiddenKeys={new Set(["series1"])}
    separator
    onItemToggle={() => {}}
  />,
  <StackedLegend key="more" items={foundationItems} layout="showMore" format="number" />,
  ...(["linear", "natural", "step"] as const).flatMap((variant) => [
    <MiniLineChart
      key={`line-${variant}`}
      data={[1, 2, 3]}
      size={120}
      variant={variant}
      isAnimationActive
      onLineClick={() => {}}
    />,
    <MiniAreaChart
      key={`area-${variant}`}
      data={[1, 2, 3]}
      size={120}
      variant={variant}
      isAnimationActive
      onAreaClick={() => {}}
    />,
  ]),
  <MiniLineChart key="point" data={[1]} size={120} />,
  <MiniAreaChart key="area-point" data={[1]} size={120} useGradient={false} />,
  <MiniBarChart key="bar" data={[1, -2, 3]} size={120} isAnimationActive onBarsClick={() => {}} />,
  <MiniBarChart key="empty-mini" data={[]} size={120} />,
];
