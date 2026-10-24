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

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Steps,
  StepsItem,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type AccordionContentProps,
  type AccordionItemProps,
  type AccordionProps,
  type AccordionTriggerProps,
  type CarouselProps,
  type CarouselRef,
  type StepsItemProps,
  type StepsProps,
  type TabsContentProps,
  type TabsListProps,
  type TabsProps,
  type TabsTriggerProps,
} from "@openuidev/react-ui-core";
const accordion: AccordionProps = {
  type: "single",
  value: "a",
  collapsible: true,
  variant: "card",
  onValueChange: (value) => value.toUpperCase(),
};
const accordionItem: AccordionItemProps = { value: "a", disabled: false };
const accordionTrigger: AccordionTriggerProps = { text: "Details" };
const accordionContent: AccordionContentProps = { children: "Body", forceMount: true };
const carousel: CarouselProps = {
  itemsToScroll: 2,
  noSnap: true,
  showButtons: true,
  variant: "sunk",
  onScrollLeftEnabled: (enabled) => enabled.valueOf(),
};
const carouselRef = createRef<CarouselRef>();
const stepsItem: StepsItemProps = { title: "Step", details: "Details", number: 3 };
const steps: StepsProps = { children: <StepsItem {...stepsItem} /> };
const tabs: TabsProps = {
  defaultValue: "a",
  variant: "clear",
  orientation: "horizontal",
  onValueChange: (value) => value.toUpperCase(),
};
const list: TabsListProps = { variant: "iconTitleSubtext" };
const tab: TabsTriggerProps = { value: "a", text: "First", subtext: "Details", icon: <svg /> };
const tabContent: TabsContentProps = { value: "a", children: "Panel" };
export const interactions = (
  <>
    <Accordion {...accordion} ref={div}>
      <AccordionItem {...accordionItem} ref={div}>
        <AccordionTrigger {...accordionTrigger} ref={button} />
        <AccordionContent {...accordionContent} ref={div} />
      </AccordionItem>
    </Accordion>
    <Carousel {...carousel} ref={carouselRef}>
      <CarouselContent ref={div}>
        <CarouselItem ref={div}>Item</CarouselItem>
      </CarouselContent>
      <CarouselPrevious icon={<svg />} ref={button} />
      <CarouselNext icon={<svg />} ref={button} />
    </Carousel>
    <Steps {...steps} />
    <Tabs {...tabs} ref={div}>
      <TabsList {...list} ref={div}>
        <TabsTrigger {...tab} ref={button} />
      </TabsList>
      <TabsContent {...tabContent} ref={div} />
    </Tabs>
  </>
);
