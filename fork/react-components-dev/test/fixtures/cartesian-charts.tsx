// Public consumer cases for each cartesian family: empty, scroll/fit, all curves, signs and entrances.
import {
  AreaChart,
  BarChart,
  HorizontalBarChart,
  LineChart,
  ScatterChart,
} from "@openuidev/react-components";

export const cartesianData = [
  { month: "January long label", sales: -12, costs: 8 },
  { month: "February long label", sales: 20, costs: -5 },
  { month: "March long label", sales: 7, costs: 13 },
];
export const cartesianChartElements = (family: string) => {
  const common = { data: cartesianData, categoryKey: "month", width: 400, height: 260 } as const;
  if (family === "AreaChart")
    return [
      <AreaChart key="empty" {...common} data={[]} />,
      ...(["linear", "natural", "step"] as const).flatMap((variant) =>
        [false, true].flatMap((condensed) =>
          [false, true].map((isAnimationActive) => (
            <AreaChart
              key={`${variant}/${condensed}/${isAnimationActive}`}
              {...common}
              variant={variant}
              condensed={condensed}
              isAnimationActive={isAnimationActive}
              stacked={variant !== "linear"}
              crosshair
              highlight
              tickVariant="angled"
            />
          )),
        ),
      ),
    ];
  if (family === "LineChart")
    return [
      <LineChart key="empty" {...common} data={[]} />,
      ...(["linear", "natural", "step"] as const).flatMap((variant) =>
        [false, true].flatMap((condensed) =>
          [false, true].map((isAnimationActive) => (
            <LineChart
              key={`${variant}/${condensed}/${isAnimationActive}`}
              {...common}
              variant={variant}
              condensed={condensed}
              isAnimationActive={isAnimationActive}
              showDots
              crosshair
              highlight
              tickVariant="angled"
            />
          )),
        ),
      ),
    ];
  if (family === "BarChart")
    return [
      <BarChart key="empty" {...common} data={[]} />,
      ...(["grouped", "stacked"] as const).flatMap((variant) =>
        [false, true].flatMap((condensed) =>
          [false, true].map((isAnimationActive) => (
            <BarChart
              key={`${variant}/${condensed}/${isAnimationActive}`}
              {...common}
              variant={variant}
              condensed={condensed}
              isAnimationActive={isAnimationActive}
              tickVariant="angled"
            />
          )),
        ),
      ),
    ];
  if (family === "HorizontalBarChart")
    return [
      <HorizontalBarChart key="empty" {...common} data={[]} />,
      ...(["grouped", "stacked"] as const).flatMap((variant) =>
        [false, true].map((isAnimationActive) => (
          <HorizontalBarChart
            key={`${variant}/${isAnimationActive}`}
            {...common}
            variant={variant}
            isAnimationActive={isAnimationActive}
          />
        )),
      ),
    ];
  return [
    <ScatterChart key="empty" data={[]} />,
    ...[false, true].map((isAnimationActive) => (
      <ScatterChart
        key={String(isAnimationActive)}
        data={[
          {
            name: "Sales",
            data: [
              { x: -2, y: -3 },
              { x: 4, y: 5 },
            ],
          },
        ]}
        width={400}
        height={260}
        isAnimationActive={isAnimationActive}
      />
    )),
  ];
};
