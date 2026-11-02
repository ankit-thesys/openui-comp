"use client";

import clsx from "clsx";
import { memo } from "react";
import { styleRules } from "../../styles/css";
import { SourceFaviconImage } from "../SourceFaviconImage";
import { openSourceInNewTab, SourceWithFavicon } from "./SourceContext";
import { names, sourcesItemStyles } from "./sourcesItem.styles";

export interface SourcesItemComponentProps extends SourceWithFavicon {
  onClick?: () => void;
  sourceId: number;
}

export const ListedSourceItem = memo((props: SourcesItemComponentProps) => {
  const styles = sourcesItemStyles;
  const { title, sourceName, onClick, faviconUrl, url, sourceId } = props;
  const handleClick = () => {
    openSourceInNewTab(url);
    onClick?.();
  };
  const hasUrl = url && url.trim() !== "";
  const rootClass = clsx(styles.root, names.root, hasUrl && styles.linked);
  const headerClass = clsx(styles.header, names.header);
  const logoClass = clsx(styles.logo, names.logo);
  const nameClass = clsx(styles.name, names.name);
  const titleClass = clsx(styles.title, names.title);
  return (
    <>
      <div
        className={rootClass}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        data-source-id={sourceId}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClick();
          }
        }}
      >
        <div className={headerClass}>
          <div className={logoClass}>
            <SourceFaviconImage url={faviconUrl} alt={sourceName} width={20} height={20} />
          </div>
          {styleRules(logoClass)}
          <span className={nameClass}>{sourceName}</span>
          {styleRules(nameClass)}
        </div>
        {styleRules(headerClass)}
        <div className={titleClass}>{title}</div>
        {styleRules(titleClass)}
      </div>
      {styleRules(rootClass)}
    </>
  );
});

ListedSourceItem.displayName = "ListedSourceItem";
