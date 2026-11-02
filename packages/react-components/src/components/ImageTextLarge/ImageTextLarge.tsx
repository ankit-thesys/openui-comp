"use client";

import clsx from "clsx";
import { forwardRef } from "react";
import { styleRules } from "../../styles/css";
import { TextBlockView } from "../TextBlock";
import { imageTextLargeStyles, names } from "./imageTextLarge.styles";

export interface ImageTextLargeProps {
  title: string;
  subtitle?: string;
  src: string;
  alt?: string;
  className?: string;
}

/** A full-width banner image above a bold title with an optional subtitle. */
export const ImageTextLarge = forwardRef<HTMLDivElement, ImageTextLargeProps>(
  ({ title, subtitle, src, alt, className }, ref) => {
    const styles = imageTextLargeStyles;
    const altText = alt ?? title;

    const rootClass = clsx(styles.root, names.root, className);
    const imageWrapClass = clsx(styles.imageWrap, names.imageWrap);
    const imageClass = clsx(styles.image, names.image);
    return (
      <>
        <div ref={ref} className={rootClass}>
          <div className={imageWrapClass}>
            <img className={imageClass} src={src} alt={altText} />
            {styleRules(imageClass)}
          </div>
          {styleRules(imageWrapClass)}
          <div className={names.content}>
            <TextBlockView
              variant="highlight-text"
              primary={title}
              secondary={subtitle}
              type="text"
              size="sm"
              align="left"
            />
          </div>
        </div>
        {styleRules(rootClass)}
      </>
    );
  },
);

ImageTextLarge.displayName = "ImageTextLarge";
