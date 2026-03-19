import { useMemo } from "react";
import { XAxisTickVariant } from "../../types";
import { useCanvasContextForLabelSize } from "../core/useCanvasContextForLabelSize";

const MIN_HEIGHT = 30;
const X_AXIS_LABEL_PADDING = 13;
// Must match -webkit-line-clamp value in chartBase.scss (.openui-d3-*-x-tick-multi-line)
const MAX_LABEL_LINES = 3;

/**
 * Parses line-height from a CSS font shorthand string.
 * Handles both px values ("400 12px/15px Inter") and unitless multipliers ("400 12px/1.25 Inter").
 */
function parseLineHeight(fontShorthand: string): number {
  const sizeMatch = fontShorthand.match(/(\d+(?:\.\d+)?)px/);
  const fontSize = sizeMatch ? parseFloat(sizeMatch[1]!) : 12;

  const lhMatch = fontShorthand.match(/\/(\d+(?:\.\d+)?)(px)?/);
  if (!lhMatch) return Math.ceil(fontSize * 1.2); // browser default

  const lhValue = parseFloat(lhMatch[1]!);
  const hasPxUnit = !!lhMatch[2];
  return hasPxUnit ? lhValue : Math.ceil(fontSize * lhValue);
}

/**
 * Simulates CSS word-wrap to count how many lines a label will occupy.
 * Uses canvas measureText for per-character width measurement.
 * Matches CSS `word-break: break-word` behavior: words exceeding maxWidth break mid-word.
 *
 * Note: canvas measureText does not account for letter-spacing from the theme.
 * This is a pre-existing limitation shared with useYAxisWidth and useMaxLabelWidth.
 */
function countWrappedLines(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): number {
  if (maxWidth <= 0) return 1;

  const words = text.split(/\s+/);
  let lines = 1;
  let currentLineWidth = 0;
  const spaceWidth = context.measureText(" ").width;

  for (const word of words) {
    const wordWidth = context.measureText(word).width;

    if (wordWidth > maxWidth) {
      // Word exceeds line — break character by character (matches CSS break-word)
      for (const char of word) {
        const charWidth = context.measureText(char).width;
        if (currentLineWidth + charWidth > maxWidth && currentLineWidth > 0) {
          lines++;
          currentLineWidth = charWidth;
        } else {
          currentLineWidth += charWidth;
        }
      }
    } else if (currentLineWidth + wordWidth > maxWidth) {
      // Word doesn't fit on current line — wrap
      lines++;
      currentLineWidth = wordWidth;
    } else {
      // Add space between words on same line
      const gap = currentLineWidth > 0 ? spaceWidth : 0;
      currentLineWidth += gap + wordWidth;
    }
  }

  return lines;
}

export const useXAxisHeight = (
  data: Record<string, string | number>[],
  categoryKey: string,
  tickVariant: XAxisTickVariant,
  widthOfGroup = 70,
) => {
  const context = useCanvasContextForLabelSize();

  return useMemo(() => {
    const lineHeight = parseLineHeight(context.font);
    // Single-line: 1 line of text + padding, floored at MIN_HEIGHT.
    // This is font-aware — if the theme uses a large font, the height adapts.
    const singleLineHeight = Math.max(lineHeight + X_AXIS_LABEL_PADDING, MIN_HEIGHT);

    if (tickVariant !== "multiLine") return singleLineHeight;
    if (!data || data.length === 0) return singleLineHeight;
    if (widthOfGroup <= 0) return singleLineHeight;

    let maxLines = 1;
    for (const item of data) {
      const label = String(item[categoryKey]);
      const lines = countWrappedLines(context, label, widthOfGroup);
      maxLines = Math.max(maxLines, Math.min(lines, MAX_LABEL_LINES));
    }

    const labelHeight = maxLines * lineHeight;
    return Math.max(labelHeight + X_AXIS_LABEL_PADDING, MIN_HEIGHT);
  }, [data, categoryKey, tickVariant, widthOfGroup, context]);
};
