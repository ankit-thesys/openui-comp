import {
  Modal,
  TooltipWrapper,
  type ModalProps,
  type TooltipWrapperProps,
} from "@openuidev/react-ui-core";
const modal: ModalProps = {
  title: "Review",
  open: true,
  onOpenChange: (open) => !open,
  size: "lg",
  children: "Details",
};
const tooltip: TooltipWrapperProps = {
  tooltipHeading: "Heading",
  tooltipContent: "Content",
  side: "left",
  align: "end",
  sideOffset: 10,
  alignOffset: 4,
  delayDuration: 30,
  showOnlyWhenTruncated: true,
  headingSelector: ".heading",
  contentSelector: ".content",
  className: "custom",
};
export const accepted = (
  <>
    <Modal {...modal} />
    <TooltipWrapper {...tooltip}>
      <button type="button">Details</button>
    </TooltipWrapper>
  </>
);
// @ts-expect-error Preserve required controlled open/callback props.
export const noImplicitOpen = <Modal title="Missing controlled state" />;
// @ts-expect-error Preserve the existing string title API.
export const noNodeTitle = <Modal {...modal} title={<strong>Title</strong>} />;
// @ts-expect-error No new Modal styling API.
export const noModalClass = <Modal {...modal} className="custom" />;
export const noTooltipStyle: TooltipWrapperProps = {
  // @ts-expect-error No new TooltipWrapper style prop.
  style: { color: "red" },
};
export const noSx: TooltipWrapperProps = {
  // @ts-expect-error No new styling API.
  sx: { color: "red" },
};
