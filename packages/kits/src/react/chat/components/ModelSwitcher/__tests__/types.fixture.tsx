import {
  FollowUpBlock,
  FollowUpItem,
  ModelSwitcher,
  type FollowUpBlockProps,
  type FollowUpItemProps,
  type ModelLogo,
  type ModelOption,
  type ModelSwitcherProps,
} from "@openuidev/kits/react/chat";
import { createRef } from "react";

const logo: ModelLogo = { light: <span>Light</span>, dark: <span>Dark</span> };
const models: ModelOption[] = [{ id: "fast", name: "Fast", logo, recommended: true }];
const modelProps: ModelSwitcherProps = { models, value: "fast", onValueChange: (id: string) => id };
const itemProps: FollowUpItemProps = {
  text: "Explain",
  icon: <span>→</span>,
  disabled: false,
  className: "consumer-item",
  style: { margin: 8 },
  onClick: (event) => event.currentTarget.focus(),
};
const blockProps: FollowUpBlockProps = {
  children: <FollowUpItem {...itemProps} ref={createRef<HTMLButtonElement>()} />,
  style: { maxWidth: 320 },
};

export const components = [
  <ModelSwitcher key="models" {...modelProps} />,
  <FollowUpBlock key="queries" {...blockProps} ref={createRef<HTMLDivElement>()} />,
];

// @ts-expect-error ModelSwitcher has no style customization prop in the existing API.
export const noNewStyleProp = <ModelSwitcher {...modelProps} style={{ color: "red" }} />;
// @ts-expect-error FollowUpItem still requires text.
export const textRequired = <FollowUpItem />;
