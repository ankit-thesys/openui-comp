import {
  IconTag,
  IconText,
  ImageText,
  ImageTextLarge,
  type IconTagProps,
  type IconTagSize,
  type IconTagVariant,
  type IconTextIconVariant,
  type IconTextLayout,
  type IconTextProps,
  type ImageTextLargeProps,
  type ImageTextLayout,
  type ImageTextProps,
} from "@openuidev/react-ui-core";
import { createElement, createRef } from "react";

const size: IconTagSize = "xl";
const variant: IconTagVariant = "inverted";
const iconVariant: IconTextIconVariant = "soft";
const layout: IconTextLayout & ImageTextLayout = "vertical";
const badge: IconTagProps = { icon: { name: "globe", category: "finance" }, size, variant };
const iconText: IconTextProps = {
  icon: badge.icon,
  title: "Title",
  subtitle: "Details",
  iconVariant,
  layout,
  bold: true,
  className: "consumer",
};
const imageText: ImageTextProps = {
  title: "Title",
  subtitle: "Details",
  src: "/photo.jpg",
  alt: "",
  layout,
  imageSize: 48,
  bold: true,
  className: "consumer",
};
const banner: ImageTextLargeProps = {
  title: "Title",
  subtitle: "Details",
  src: "/photo.jpg",
  alt: "Photo",
  className: "consumer",
};
export const examples = [
  createElement(IconTag, { ...badge, ref: createRef<HTMLDivElement>() }),
  createElement(IconText, { ...iconText, ref: createRef<HTMLDivElement>() }),
  createElement(ImageText, { ...imageText, ref: createRef<HTMLDivElement>() }),
  createElement(ImageTextLarge, { ...banner, ref: createRef<HTMLDivElement>() }),
];
