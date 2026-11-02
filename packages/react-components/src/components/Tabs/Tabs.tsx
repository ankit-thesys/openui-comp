"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { styleRules } from "../../styles/css";
import { IconButton } from "../IconButton";
import { names as tabsNames, tabsStyles } from "./tabs.styles";
import { names as contentNames, tabsContentStyles } from "./tabsContent.styles";
import { names as listNames, tabsListStyles } from "./tabsList.styles";
import { tabsTriggerStyles, names as triggerNames } from "./tabsTrigger.styles";

type TabsVariant = "clear";

export interface TabsProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  className?: string;
  style?: React.CSSProperties;
  variant?: TabsVariant;
}

export const Tabs = forwardRef<React.ComponentRef<typeof TabsPrimitive.Root>, TabsProps>(
  ({ className, style, variant = "clear", ...props }, ref) => {
    const styles = tabsStyles;
    const rootClass = clsx(styles.root, tabsNames.root, tabsNames.variant[variant], className);
    return (
      <>
        <TabsPrimitive.Root ref={ref} className={rootClass} style={style} {...props} />
        {styleRules(rootClass)}
      </>
    );
  },
);

Tabs.displayName = "Tabs";

type TabsListVariant =
  "title" | "iconTitle" | "iconTitleSubtext" | "imageTitle" | "imageTitleSubtext";

export interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  className?: string;
  style?: React.CSSProperties;
  variant?: TabsListVariant;
}

export const TabsList = forwardRef<React.ComponentRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ className, style, variant = "title", ...props }, ref) => {
    const styles = tabsListStyles;
    const listRef = useRef<HTMLDivElement>(null);
    const indicatorRef = useRef<HTMLDivElement>(null);
    const [showLeftButton, setShowLeftButton] = useState(false);
    const [showRightButton, setShowRightButton] = useState(false);

    const updateIndicator = useCallback((animated: boolean) => {
      const list = listRef.current;
      const indicator = indicatorRef.current;
      if (!list || !indicator) return;

      const activeTab = list.querySelector('[role="tab"][data-state="active"]') as HTMLElement;
      if (!activeTab) return;

      const left = activeTab.offsetLeft - list.scrollLeft;
      const width = activeTab.offsetWidth;

      indicator.style.transition = animated
        ? "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
        : "none";
      indicator.style.width = `${width}px`;
      indicator.style.transform = `translateX(${left}px)`;
      indicator.style.opacity = "1";
    }, []);

    // Check scroll state and keep indicator in sync while scrolling
    useEffect(() => {
      const checkScroll = () => {
        if (listRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = listRef.current;
          setShowLeftButton(scrollLeft > 0);
          setShowRightButton(scrollLeft < scrollWidth - clientWidth - 1);
        }
      };

      const handleScroll = () => {
        checkScroll();
        updateIndicator(false);
      };

      checkScroll();
      updateIndicator(false);

      const currentRef = listRef.current;
      if (currentRef) {
        currentRef.addEventListener("scroll", handleScroll);

        const resizeObserver = new ResizeObserver(() => {
          checkScroll();
          updateIndicator(false);
        });
        resizeObserver.observe(currentRef);

        return () => {
          currentRef.removeEventListener("scroll", handleScroll);
          resizeObserver.disconnect();
        };
      }
      return () => {};
    }, [updateIndicator]);

    // Watch for active tab changes and animate indicator
    useEffect(() => {
      const list = listRef.current;
      if (!list) return;

      const observer = new MutationObserver(() => updateIndicator(true));
      observer.observe(list, {
        attributes: true,
        subtree: true,
        attributeFilter: ["data-state"],
      });

      return () => observer.disconnect();
    }, [updateIndicator]);

    // Center the clicked trigger in the list
    useEffect(() => {
      const list = listRef.current;
      if (!list) return;

      const handleClick = (e: MouseEvent) => {
        const trigger = (e.target as HTMLElement).closest('[role="tab"]') as HTMLElement;
        if (!trigger) return;

        const listWidth = list.clientWidth;
        const triggerLeft = trigger.offsetLeft;
        const triggerWidth = trigger.offsetWidth;
        const scrollTo = triggerLeft - listWidth / 2 + triggerWidth / 2;

        list.scrollTo({ left: scrollTo, behavior: "smooth" });
      };

      list.addEventListener("click", handleClick);
      return () => list.removeEventListener("click", handleClick);
    }, []);

    const scrollLeft = () => {
      if (listRef.current) {
        listRef.current.scrollBy({ left: -120, behavior: "smooth" });
      }
    };

    const scrollRight = () => {
      if (listRef.current) {
        listRef.current.scrollBy({ left: 120, behavior: "smooth" });
      }
    };

    const containerClass = clsx(styles.container, listNames.container);
    const rootClass = clsx(
      styles.root,
      styles.variant[variant],
      listNames.root,
      listNames.variant[variant],
      className,
    );
    const indicatorClass = clsx(styles.indicator, listNames.indicator);
    return (
      <>
        <div className={containerClass}>
          {showLeftButton && (
            <>
              <div
                className={clsx(
                  styles.scrollButtonContainerLeft,
                  listNames.scrollButtonContainerLeft,
                )}
              >
                <IconButton
                  className={clsx(listNames.scrollButton, listNames.scrollLeft)}
                  onClick={scrollLeft}
                  aria-label="Scroll tabs left"
                  icon={<ChevronLeft />}
                  variant="secondary"
                  size="small"
                />
              </div>
              {styleRules(
                clsx(styles.scrollButtonContainerLeft, listNames.scrollButtonContainerLeft),
              )}
            </>
          )}

          <TabsPrimitive.List
            ref={(node) => {
              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              listRef.current = node;
            }}
            className={rootClass}
            style={style}
            {...props}
          />
          {styleRules(rootClass)}

          <div className={indicatorClass} ref={indicatorRef} />
          {styleRules(indicatorClass)}

          {showRightButton && (
            <>
              <div
                className={clsx(
                  styles.scrollButtonContainerRight,
                  listNames.scrollButtonContainerRight,
                )}
              >
                <IconButton
                  className={clsx(listNames.scrollButton, listNames.scrollRight)}
                  onClick={scrollRight}
                  aria-label="Scroll tabs right"
                  icon={<ChevronRight />}
                  variant="secondary"
                  size="small"
                />
              </div>
              {styleRules(
                clsx(styles.scrollButtonContainerRight, listNames.scrollButtonContainerRight),
              )}
            </>
          )}
        </div>
        {styleRules(containerClass)}
      </>
    );
  },
);

TabsList.displayName = "TabsList";

export interface TabsTriggerProps extends React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Trigger
> {
  className?: string;
  style?: React.CSSProperties;
  value: string;
  icon?: React.ReactNode;
  text: React.ReactNode;
  subtext?: React.ReactNode;
  image?: string;
}

export const TabsTrigger = forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, style, icon, text, subtext, image, value, ...props }, ref) => {
  const styles = tabsTriggerStyles;
  const rootClass = clsx(styles.root, triggerNames.root, className);
  const contentClass = clsx(styles.content, triggerNames.content);
  return (
    <>
      <TabsPrimitive.Trigger ref={ref} className={rootClass} style={style} value={value} {...props}>
        {image && (
          <>
            <span className={clsx(styles.image, triggerNames.image)}>
              <img className={clsx(styles.img, triggerNames.img)} src={image} alt="" />
              {styleRules(clsx(styles.img, triggerNames.img))}
            </span>
            {styleRules(clsx(styles.image, triggerNames.image))}
          </>
        )}
        {icon && (
          <>
            <span className={clsx(styles.icon, triggerNames.icon)}>{icon}</span>
            {styleRules(clsx(styles.icon, triggerNames.icon))}
          </>
        )}
        <span className={contentClass}>
          {text && (
            <>
              <span className={clsx(styles.text, triggerNames.text)}>{text}</span>
              {styleRules(clsx(styles.text, triggerNames.text))}
            </>
          )}
          {subtext && (
            <>
              <span className={clsx(styles.subtext, triggerNames.subtext)}>{subtext}</span>
              {styleRules(clsx(styles.subtext, triggerNames.subtext))}
            </>
          )}
        </span>
        {styleRules(contentClass)}
      </TabsPrimitive.Trigger>
      {styleRules(rootClass)}
    </>
  );
});

TabsTrigger.displayName = "TabsTrigger";

export interface TabsContentProps extends React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Content
> {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const TabsContent = forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, style, children, ...props }, ref) => {
  const styles = tabsContentStyles;
  const rootClass = clsx(styles.root, contentNames.root, className);
  const innerClass = clsx(styles.inner, contentNames.inner);
  return (
    <>
      <TabsPrimitive.Content ref={ref} className={rootClass} style={style} {...props}>
        <div className={innerClass}>{children}</div>
        {styleRules(innerClass)}
      </TabsPrimitive.Content>
      {styleRules(rootClass)}
    </>
  );
});

TabsContent.displayName = "TabsContent";
