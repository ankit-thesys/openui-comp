"use client";

import { Button, Card } from "@openuidev/react-components";
import clsx from "clsx";
import { Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { C1_CLASS_PREFIX } from "../../shared/classPrefix";
import { shellCardClass } from "./shellCard.styles";

export type ShellCardSize = "small" | "medium" | "large";

export interface ShellCardProps {
  size: ShellCardSize;
  /** Clip the body to a preview height and offer an Expand control when it overflows. */
  collapsed?: boolean;
  streaming?: boolean;
  /** Accessible name of the expanded dialog. */
  modalTitle?: string;
  children?: ReactNode;
}

/** The card frame Medium and Large cards render into, with its expand modal. */
export function ShellCard({
  size,
  collapsed = false,
  streaming = false,
  modalTitle = "Card details",
  children,
}: ShellCardProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const showCollapseControl = collapsed && isOverflowing;

  useEffect(() => {
    if (!collapsed) {
      setIsModalOpen(false);
      setIsOverflowing(false);
      return;
    }

    const contentElement = contentRef.current;
    if (!contentElement) {
      return;
    }

    const wrapElement = contentElement.parentElement;

    const updateOverflowState = () => {
      if (!wrapElement) return;
      setIsOverflowing(
        wrapElement.clientHeight > 0 && contentElement.scrollHeight > wrapElement.clientHeight + 1,
      );
    };

    updateOverflowState();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const resizeObserver = new ResizeObserver(updateOverflowState);
    resizeObserver.observe(contentElement);

    return () => resizeObserver.disconnect();
  }, [collapsed]);

  useEffect(() => {
    if (!showCollapseControl) {
      setIsModalOpen(false);
    }
  }, [showCollapseControl]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  return (
    <Card
      width="full"
      variant="card"
      className={clsx(
        shellCardClass,
        `${C1_CLASS_PREFIX}-shell-card`,
        `${C1_CLASS_PREFIX}-shell-card--${size}`,
        streaming && `${C1_CLASS_PREFIX}-shell-card--streaming`,
        collapsed && `${C1_CLASS_PREFIX}-shell-card--collapse-requested`,
        collapsed && `${C1_CLASS_PREFIX}-shell-card--collapsed`,
      )}
    >
      <div className={`${C1_CLASS_PREFIX}-shell-card__content-wrap`}>
        <div ref={contentRef} className={`${C1_CLASS_PREFIX}-shell-card__content`}>
          {children}
        </div>
        {showCollapseControl && (
          <div className={`${C1_CLASS_PREFIX}-shell-card__collapse-fade`} aria-hidden="true" />
        )}
      </div>
      {showCollapseControl && (
        <div className={`${C1_CLASS_PREFIX}-shell-card__collapse-control`}>
          <Button
            variant="secondary"
            size="small"
            buttonType="normal"
            iconLeft={<Maximize2 size={14} />}
            onClick={() => setIsModalOpen(true)}
          >
            Expand
          </Button>
        </div>
      )}
      {isModalOpen && (
        <div
          className={`${C1_CLASS_PREFIX}-shell-card-modal`}
          role="dialog"
          aria-modal="true"
          aria-label={modalTitle}
        >
          <button
            type="button"
            className={`${C1_CLASS_PREFIX}-shell-card-modal__overlay`}
            aria-label="Minimize expanded card"
            onClick={() => setIsModalOpen(false)}
          />
          <div className={`${C1_CLASS_PREFIX}-shell-card-modal__frame`}>
            <div className={`${C1_CLASS_PREFIX}-shell-card-modal__minimize`}>
              <Button
                variant="secondary"
                size="small"
                buttonType="normal"
                iconLeft={<Minimize2 size={14} />}
                onClick={() => setIsModalOpen(false)}
              >
                Minimize
              </Button>
            </div>
            <div className={`${C1_CLASS_PREFIX}-shell-card-modal__content`}>
              <div className={`${C1_CLASS_PREFIX}-shell-card-modal__body`}>
                <div className={`${C1_CLASS_PREFIX}-shell-card__content`}>{children}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
