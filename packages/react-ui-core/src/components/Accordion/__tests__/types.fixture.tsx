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
import { createRef } from "react";
const root = createRef<HTMLDivElement>(),
  trigger = createRef<HTMLButtonElement>(),
  carousel = createRef<CarouselRef>();
const accordionProps: AccordionProps = {
  type: "multiple",
  defaultValue: ["a"],
  onValueChange: (values) => values.map((v) => v.toUpperCase()),
};
const item: AccordionItemProps = { value: "a", disabled: true };
const accordionTrigger: AccordionTriggerProps = { text: "Alpha" };
const accordionContent: AccordionContentProps = { forceMount: true };
const carouselProps: CarouselProps = {
  itemsToScroll: 2,
  noSnap: true,
  onScrollLeftEnabled: (enabled) => !enabled,
};
const steps: StepsProps = { children: "content" };
const step: StepsItemProps = { title: "Title", details: "Details", number: 0 };
const tabs: TabsProps = { value: "a", activationMode: "manual" };
const list: TabsListProps = { variant: "iconTitleSubtext" };
const tab: TabsTriggerProps = { value: "a", text: "Alpha", disabled: true };
const content: TabsContentProps = { value: "a", forceMount: true };
export const accepted = (
  <>
    <Accordion {...accordionProps} ref={root}>
      <AccordionItem {...item}>
        <AccordionTrigger {...accordionTrigger} ref={trigger} />
        <AccordionContent {...accordionContent} ref={root}>
          Details
        </AccordionContent>
      </AccordionItem>
    </Accordion>
    <Carousel {...carouselProps} ref={carousel}>
      <CarouselContent ref={root}>
        <CarouselItem ref={root}>Card</CarouselItem>
      </CarouselContent>
      <CarouselPrevious icon="previous" ref={trigger} />
      <CarouselNext icon="next" />
    </Carousel>
    <Steps {...steps} />
    <StepsItem {...step} />
    <Tabs {...tabs} ref={root}>
      <TabsList {...list} ref={root}>
        <TabsTrigger {...tab} ref={trigger} />
      </TabsList>
      <TabsContent {...content} ref={root} />
    </Tabs>
  </>
);
carousel.current?.scroll("left");
carousel.current?.scrollDivRef.current?.focus();
// @ts-expect-error No new styling API.
export const noSx = <Tabs sx={{ color: "red" }} />;
// @ts-expect-error Preserve the closed Steps props surface.
export const noStepsClassName = <Steps className="custom">Details</Steps>;
// @ts-expect-error Preserve required IconButton icon prop.
export const requiredArrowIcon = <CarouselNext />;
