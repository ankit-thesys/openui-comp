"use client";

import { CheckBoxItem } from "@openuidev/react-components";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { C1_CLASS_PREFIX } from "../../shared/classPrefix";
import { filterSelectClass, multiSelectClass, singleSelectClass } from "./filterSelect.styles";

export interface FilterOption {
  value: string;
  label: string;
}

function useClickOutside(ref: RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [ref, onClose]);
}

export interface FilterSelectProps {
  /** Groups the radio inputs. */
  name: string;
  label?: string;
  options: FilterOption[];
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  onValueChange: (value: string) => void;
}

export function FilterSelect({
  name,
  label,
  options,
  value = "",
  placeholder,
  disabled,
  onValueChange,
}: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedItem = options.find((item) => item.value === value);
  const summary = selectedItem?.label ?? placeholder ?? "Select...";

  const closeDropdown = useCallback(() => setIsOpen(false), []);
  useClickOutside(dropdownRef, closeDropdown);

  return (
    <div className={clsx(filterSelectClass, `${C1_CLASS_PREFIX}-filter-select`)}>
      {label && <label className={`${C1_CLASS_PREFIX}-filter-select__label`}>{label}</label>}
      <div
        className={clsx(singleSelectClass, `${C1_CLASS_PREFIX}-filter-single-select`)}
        ref={dropdownRef}
      >
        <button
          type="button"
          className={clsx(
            `${C1_CLASS_PREFIX}-filter-single-select__trigger`,
            !selectedItem && `${C1_CLASS_PREFIX}-filter-single-select__trigger--empty`,
          )}
          disabled={disabled}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((c) => !c)}
        >
          <span className={`${C1_CLASS_PREFIX}-filter-single-select__value`}>{summary}</span>
          <ChevronDown
            className={clsx(
              `${C1_CLASS_PREFIX}-filter-single-select__chevron`,
              isOpen && `${C1_CLASS_PREFIX}-filter-single-select__chevron--open`,
            )}
            size={14}
          />
        </button>
        {isOpen ? (
          <div className={`${C1_CLASS_PREFIX}-filter-single-select__content`} role="radiogroup">
            {options.map((item) => (
              <label
                key={item.value}
                className={`${C1_CLASS_PREFIX}-filter-single-select__radio-option`}
              >
                <input
                  className={`${C1_CLASS_PREFIX}-filter-single-select__radio-input`}
                  type="radio"
                  name={name}
                  value={item.value}
                  checked={value === item.value}
                  disabled={disabled}
                  onChange={() => {
                    onValueChange(item.value);
                    setIsOpen(false);
                  }}
                />
                <span className={`${C1_CLASS_PREFIX}-filter-single-select__radio-control`} />
                <span className={`${C1_CLASS_PREFIX}-filter-single-select__radio-label`}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export interface FilterMultiSelectProps {
  label?: string;
  options: FilterOption[];
  values?: string[];
  placeholder?: string;
  disabled?: boolean;
  onValuesChange: (values: string[]) => void;
}

export function FilterMultiSelect({
  label,
  options,
  values = [],
  placeholder,
  disabled,
  onValuesChange,
}: FilterMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeDropdown = useCallback(() => setIsOpen(false), []);
  useClickOutside(dropdownRef, closeDropdown);

  const summary = values.length
    ? values.map((val) => options.find((o) => o.value === val)?.label ?? val).join(", ")
    : null;

  const toggleValue = (value: string) =>
    onValuesChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);

  return (
    <div
      className={clsx(
        filterSelectClass,
        `${C1_CLASS_PREFIX}-filter-select`,
        `${C1_CLASS_PREFIX}-filter-select--multi`,
      )}
    >
      {label && <label className={`${C1_CLASS_PREFIX}-filter-select__label`}>{label}</label>}
      <div
        className={clsx(multiSelectClass, `${C1_CLASS_PREFIX}-filter-multi-select`)}
        ref={dropdownRef}
      >
        <button
          type="button"
          className={clsx(
            `${C1_CLASS_PREFIX}-filter-multi-select__trigger`,
            !values.length && `${C1_CLASS_PREFIX}-filter-multi-select__trigger--empty`,
          )}
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          aria-expanded={isOpen}
        >
          {summary ? (
            <span className={`${C1_CLASS_PREFIX}-filter-multi-select__summary`}>
              <span className={`${C1_CLASS_PREFIX}-filter-multi-select__summary-text`}>
                {summary}
              </span>
              <span className={`${C1_CLASS_PREFIX}-filter-multi-select__count`}>
                {values.length}
              </span>
            </span>
          ) : (
            <span className={`${C1_CLASS_PREFIX}-filter-multi-select__placeholder`}>
              {placeholder ?? "Select..."}
            </span>
          )}
          <ChevronDown
            className={clsx(
              `${C1_CLASS_PREFIX}-filter-multi-select__chevron`,
              isOpen && `${C1_CLASS_PREFIX}-filter-multi-select__chevron--open`,
            )}
            size={14}
          />
        </button>
        {isOpen && (
          <div className={`${C1_CLASS_PREFIX}-filter-multi-select__dropdown`}>
            <div className={`${C1_CLASS_PREFIX}-filter-multi-select__options`}>
              {options.map((option) => (
                <div
                  key={option.value}
                  className={clsx(
                    `${C1_CLASS_PREFIX}-filter-multi-select__option`,
                    values.includes(option.value) &&
                      `${C1_CLASS_PREFIX}-filter-multi-select__option--selected`,
                  )}
                >
                  <CheckBoxItem
                    name={option.value}
                    label={option.label}
                    checked={values.includes(option.value)}
                    onChange={() => toggleValue(option.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
