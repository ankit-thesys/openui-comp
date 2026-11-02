"use client";

import clsx from "clsx";
import React, { Fragment, useCallback, useMemo, useState } from "react";
import { styleRules } from "../../styles/css";
import { Button } from "../Button";
import { GalleryModal } from "./GalleryModal";
import { imageGalleryStyles, names } from "./imageGallery.styles";

export interface ImageItem {
  src: string;
  alt?: string;
  details?: string;
}

export interface OpenUIGalleryProps {
  images: ImageItem[];
}

const MAX_GRID_IMAGES = 5;
const getLayout = (imageCount: number) => {
  switch (imageCount) {
    case 1:
      return "single";
    case 2:
      return "double";
    case 3:
      return "triple";
    case 4:
      return "quad";
    default:
      return "default";
  }
};

export const ImageGallery: React.FC<OpenUIGalleryProps> = ({ images }) => {
  const styles = imageGalleryStyles;
  const [showAll, setShowAll] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Memoize layout class to prevent recalculation
  const layoutClass = useMemo(() => getLayout(images.length), [images.length]);

  // Memoize whether to show button
  const shouldShowButton = useMemo(() => images.length > MAX_GRID_IMAGES, [images.length]);

  // Memoize visible images
  const visibleImages = useMemo(() => images.slice(0, MAX_GRID_IMAGES), [images]);

  // Memoize callbacks
  const toggleShowAll = useCallback(() => {
    setShowAll((prev) => !prev);
  }, []);

  const handleImageClick = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setShowAll(true);
  }, []);

  const setSelectedImageIndexMemoized = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  const rootClass = clsx(styles.root, names.root);
  const gridClass = clsx(styles.grid, names.grid);
  return (
    <>
      <div className={rootClass} data-layout={layoutClass}>
        <div className={gridClass}>
          {visibleImages.map((image, index) => {
            const imageClass = clsx(styles.image, names.image);
            const imgClass = clsx(styles.img, names.img);
            return (
              <Fragment key={index}>
                <div
                  className={imageClass}
                  data-position={index + 1}
                  onClick={() => handleImageClick(index)}
                >
                  <img
                    className={imgClass}
                    src={image.src}
                    alt={image.alt || `Gallery image ${index + 1}`}
                  />
                  {styleRules(imgClass)}
                </div>
                {styleRules(imageClass)}
              </Fragment>
            );
          })}
          {shouldShowButton && (
            <>
              <div className={clsx(styles.showAll, names.showAll)}>
                <Button variant="primary" size="small" onClick={toggleShowAll}>
                  Show All
                </Button>
              </div>
              {styleRules(clsx(styles.showAll, names.showAll))}
            </>
          )}
        </div>
        {styleRules(gridClass)}

        {showAll && (
          <GalleryModal
            images={images}
            selectedImageIndex={selectedImageIndex}
            setSelectedImageIndex={setSelectedImageIndexMemoized}
            onClose={toggleShowAll}
          />
        )}
      </div>
      {styleRules(rootClass)}
    </>
  );
};
