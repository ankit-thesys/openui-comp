import { ThemeProvider, useTheme, type Theme, type ThemeMode } from "@openuidev/react-components";
import { useMemo, type FC, type ReactNode } from "react";
import { C1_CLASS_PREFIX } from "../../shared/classPrefix";
import { defaultDashboardDarkTheme, defaultDashboardLightTheme } from "./";
export interface DashboardThemeProviderProps {
  children: ReactNode;
  /** Overrides the mode read from the outer `<ThemeProvider>`. */
  mode?: ThemeMode;
  /** Shallow-merged over the default light Dashboard theme. */
  lightTheme?: Partial<Theme>;
  /** Shallow-merged over the default dark Dashboard theme. */
  darkTheme?: Partial<Theme>;
}

/**
 * Themes the Dashboard surface. Mirrors `ReportThemeProvider` — dashboards
 * render at one scale throughout, so a single `ThemeProvider` scoped to
 * `.${C1_CLASS_PREFIX}-dashboard-theme` is enough (no shell/canvas split like
 * Presentation needs).
 *
 * Two things live here:
 *
 *   1. The openui token overrides (`defaultThemes.ts`) — dashboard-scale
 *      typography, emitted onto the scope class by openui's `ThemeProvider`.
 *   2. Dashboard-private compound font tokens, below — combinations openui's
 *      shorthand scale cannot express, because its `-heavy` tier stops at
 *      weight 500 while dashboard cards need 600/700.
 *
 * NOTE on naming: openui's own vocabulary collides here — `--openui-font-weight-heavy`
 * is 700, but the `--openui-text-*-heavy` shorthands are 500. The tokens below are
 * therefore named by ROLE (metric, highlight, table-header) rather than by weight,
 * the same way Report names `--${C1_CLASS_PREFIX}-report-font-heading-extra-large`.
 *
 * NOTE on letter-spacing: unlike Report's private tokens these ship no
 * `-letter-spacing` sibling. Every dashboard letter-spacing token is `0` and the
 * longhand rules these replace set none, so pairing one in would newly force `0`
 * over an inherited `normal`. Emitting `font:` alone keeps the swap rendering-identical.
 */
export const DashboardThemeProvider: FC<DashboardThemeProviderProps> = ({
  children,
  mode: modeOverride,
  lightTheme,
  darkTheme,
}) => {
  const { mode: ambientMode } = useTheme();
  const mode: ThemeMode = modeOverride ?? ambientMode;

  const mergedLight = useMemo<Theme>(
    () => ({ ...defaultDashboardLightTheme, ...lightTheme }),
    [lightTheme],
  );

  const mergedDark = useMemo<Theme>(
    () => ({ ...defaultDashboardDarkTheme, ...darkTheme }),
    [darkTheme],
  );

  return (
    <div className={`${C1_CLASS_PREFIX}-dashboard-theme`} style={{ display: "contents" }}>
      <style>{`
        .${C1_CLASS_PREFIX}-dashboard-theme {
          /* 700 @ 14px, prose leading — highlight-text card copy. */
          --${C1_CLASS_PREFIX}-dashboard-font-highlight: 700 14px/1.5 var(--openui-font-body);
          /* 700 @ 14px, label leading — the primary metric value. */
          --${C1_CLASS_PREFIX}-dashboard-font-metric: 700 14px/1.25 var(--openui-font-body);
          /* 700 @ 20px — the oversized highlight metric. */
          --${C1_CLASS_PREFIX}-dashboard-font-metric-lg: 700 20px/1.25 var(--openui-font-body);
          /* 600 @ 13px — secondary metric chrome (previous value, trend). */
          --${C1_CLASS_PREFIX}-dashboard-font-metric-sm: 600 13px/1.25 var(--openui-font-body);
          /* 600 @ 13px on the label family — table column headers. */
          --${C1_CLASS_PREFIX}-dashboard-font-table-header: 600 13px/1.25 var(--openui-font-label);
        }
      `}</style>
      <ThemeProvider
        mode={mode}
        lightTheme={mergedLight}
        darkTheme={mergedDark}
        cssSelector={`.${C1_CLASS_PREFIX}-dashboard-theme`}
      >
        {children}
      </ThemeProvider>
    </div>
  );
};
