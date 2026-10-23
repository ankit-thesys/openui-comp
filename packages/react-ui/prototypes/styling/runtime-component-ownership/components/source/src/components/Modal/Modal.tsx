"use client";
import {OwnedElement as __OwnedElement} from "../../../../runtime/adapter";
import {styles as __styles0} from "../../../../runtime/styles/Modal";
import clsx from "clsx";
import { X } from "lucide-react";
import React, { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../ThemeProvider";
export interface ModalProps {
    title: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    size?: "sm" | "md" | "lg";
    children?: React.ReactNode;
}
const sizeClass: Record<string, string> = {
    sm: "openui-modal-sm",
    md: "openui-modal-md",
    lg: "openui-modal-lg",
};
export const Modal: React.FC<ModalProps> = ({ title, open, onOpenChange, size = "md", children, }) => {
    const { portalThemeClassName } = useTheme();
    const contentRef = useRef<HTMLDivElement>(null);
    const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);
    // Escape key
    useEffect(() => {
        if (!open)
            return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape")
                handleClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, handleClose]);
    // Focus trap — focus the content on open
    useEffect(() => {
        if (open && contentRef.current) {
            contentRef.current.focus();
        }
    }, [open]);
    if (!open)
        return null;
    return createPortal(<__OwnedElement $element="div" $styles={[__styles0]} className={clsx("openui-modal-root", portalThemeClassName)}>
      <__OwnedElement $element="div" $styles={[__styles0]} className="openui-modal-overlay" onClick={handleClose}/>
      <__OwnedElement $element="div" $styles={[__styles0]} ref={contentRef} className={clsx("openui-modal-content", sizeClass[size])} role="dialog" aria-modal="true" aria-labelledby="openui-modal-title" tabIndex={-1}>
        <__OwnedElement $element="div" $styles={[__styles0]} className="openui-modal-header">
          <__OwnedElement $element="h2" $styles={[__styles0]} id="openui-modal-title" className="openui-modal-title">
            {title}
          </__OwnedElement>
          <__OwnedElement $element="button" $styles={[__styles0]} className="openui-modal-close" aria-label="Close" onClick={handleClose}>
            <X size={18}/>
          </__OwnedElement>
        </__OwnedElement>
        <__OwnedElement $element="div" $styles={[__styles0]} className="openui-modal-body">{children}</__OwnedElement>
      </__OwnedElement>
    </__OwnedElement>, document.body);
};
