"use client";

import clsx from "clsx";
import { forwardRef } from "react";
import { useStyles } from "../../styles/useStyles";
import { TextBlockView } from "../TextBlock";
import { imageTextStyles, names } from "./imageText.styles";

export type ImageTextLayout = "horizontal" | "vertical";

export interface ImageTextProps {
  title: string;
  subtitle?: string;
  src: string;
  alt?: string;
  bold?: boolean;
  layout?: ImageTextLayout;
  /** Square image size in px. Defaults to 40 for horizontal layout. */
  imageSize?: number;
  className?: string;
}

/** A small square image beside (or above) a title with an optional subtitle. */
export const ImageText = forwardRef<HTMLDivElement, ImageTextProps>(
  (
    { title, subtitle, src, alt, bold = false, layout = "horizontal", imageSize, className },
    ref,
  ) => {
    const styles = useStyles(imageTextStyles);
    const altText = alt ?? title;
    const size = imageSize ?? (layout === "horizontal" ? 40 : undefined);

    return (
      <div
        ref={ref}
        className={clsx(
          styles.root,
          names.root,
          styles.layout[layout],
          names.layout[layout],
          bold && names.bold.true,
          className,
        )}
      >
        <div
          className={clsx(styles.imageContainer, names.imageContainer)}
          style={
            size ? ({ "--_openui-image-text-size": `${size}px` } as React.CSSProperties) : undefined
          }
        >
          <img className={clsx(styles.image, names.image)} src={src} alt={altText} />
        </div>
        <div className={clsx(styles.content, names.content)}>
          <TextBlockView
            variant={bold ? "highlight-text-number-subtext" : "text-subtext"}
            primary={title}
            secondary={subtitle}
            type="text"
            size={layout === "horizontal" ? "xs" : "sm"}
            align="left"
          />
        </div>
      </div>
    );
  },
);

ImageText.displayName = "ImageText";
