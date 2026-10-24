import {
  Card,
  CardHeader,
  DotMatrixLoader,
  FoldableSectionContent,
  FoldableSectionItem,
  FoldableSectionRoot,
  FoldableSectionTrigger,
  PieChartSkeleton,
  SectionV2,
  Separator,
  Skeleton,
  TableSkeleton,
  type CardHeaderProps,
  type CardProps,
  type DotMatrixLoaderVariant,
  type FoldableSectionContentProps,
  type FoldableSectionItemProps,
  type FoldableSectionRootProps,
  type FoldableSectionTriggerProps,
} from "@openuidev/react-ui-core";
import { createRef, type ComponentProps } from "react";
const div = createRef<HTMLDivElement>(),
  button = createRef<HTMLButtonElement>();
const card: CardProps = {
  variant: "sunk",
  width: "full",
  id: "card",
  style: { padding: 12 },
  "aria-label": "Card",
};
const header: CardHeaderProps = {
  title: <h2>Title</h2>,
  subtitle: "Subtitle",
  styles: { gap: 4 },
  style: { gap: 8 },
};
const root: FoldableSectionRootProps = {
  type: "multiple",
  value: ["a"],
  onValueChange: (values) => values.map((v) => v.toUpperCase()),
};
const item: FoldableSectionItemProps = { value: "a", disabled: false };
const trigger: FoldableSectionTriggerProps = {
  text: "Details",
  type: "button",
  "aria-label": "Details",
};
const content: FoldableSectionContentProps = {
  forceMount: true,
  style: { padding: 8 },
  children: "Body",
};
const variant: DotMatrixLoaderVariant = "compact";
const section: ComponentProps<typeof SectionV2> = { trigger: "Section", children: "Content" };
export const layout = (
  <>
    <Card {...card} ref={div}>
      <CardHeader {...header} ref={div} />
      <SectionV2 {...section} />
    </Card>
    <FoldableSectionRoot {...root} ref={div}>
      <FoldableSectionItem {...item} ref={div}>
        <FoldableSectionTrigger {...trigger} ref={button} />
        <FoldableSectionContent {...content} ref={div} />
      </FoldableSectionItem>
    </FoldableSectionRoot>
    <Separator ref={div} orientation="vertical" decorative={false} />
    <Skeleton count={3} width="70%" height="20px" borderRadius="4px" />
    <TableSkeleton rows={2} columns={3} />
    <PieChartSkeleton size={160} legendItems={2} appearance="semiCircular" variant="donut" />
    <DotMatrixLoader size={48} variant={variant} />
  </>
);
// @ts-expect-error No new styling API.
export const noSx = <Card sx={{ padding: 12 }} />;
// @ts-expect-error SectionV2 retains its existing string trigger.
export const noNewTrigger = <SectionV2 trigger={<span>New</span>} />;
