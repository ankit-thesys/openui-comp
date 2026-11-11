"use client";

import {
  createContext,
  useContext,
  useId,
  useInsertionEffect,
  useMemo,
  type ReactNode,
} from "react";
import { defaultDarkTheme, defaultLightTheme, tokenNames, type Theme } from "./theme";

type ThemeMode = "light" | "dark";
type ThemeProps = {
  mode?: ThemeMode;
  lightTheme?: Theme;
  darkTheme?: Theme;
  children?: ReactNode;
};

export const ThemeContext = createContext<{
  mode: ThemeMode;
  theme: Required<Theme>;
  portalThemeClassName: string;
} | null>(null);

export function ThemeProvider({ mode: suppliedMode, lightTheme, darkTheme, children }: ThemeProps) {
  const parent = useContext(ThemeContext);
  const mode = suppliedMode ?? parent?.mode ?? "light";
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const scope = `openui-dashboard-theme-${id}`;
  const portalThemeClassName = `${scope}-portal`;
  const theme = useMemo(() => {
    const defaults = mode === "light" ? defaultLightTheme : defaultDarkTheme;
    const overrides = mode === "light" ? lightTheme : (darkTheme ?? lightTheme);
    return Object.fromEntries(
      Object.entries(defaults).map(([key, value]) => [
        key,
        overrides?.[key as keyof Theme] ?? value,
      ]),
    ) as Required<Theme>;
  }, [mode, lightTheme, darkTheme]);
  const value = useMemo(
    () => ({ mode, theme, portalThemeClassName }),
    [mode, theme, portalThemeClassName],
  );
  useInsertionEffect(() => {
    const style = document.createElement("style");
    const nonce = (window as Window & { __nonce__?: string }).__nonce__;
    if (nonce) style.nonce = nonce;
    style.dataset["openuiDashboardTheme"] = id;
    const variables = Object.entries(theme)
      .map(([key, token]) => `--openui-dashboard-${tokenNames[key as keyof Theme]}: ${token};`)
      .join("\n");
    style.textContent = `.${scope}, .${portalThemeClassName} { ${variables} color-scheme: ${mode}; }`;
    document.head.appendChild(style);
    return () => style.remove();
  }, [theme, scope, portalThemeClassName, id, mode]);
  return (
    <ThemeContext.Provider value={value}>
      <div className={scope} data-dashboard-mode={mode} style={{ display: "contents" }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function DashboardTheme({ children }: { children: ReactNode }) {
  return useContext(ThemeContext) ? <>{children}</> : <ThemeProvider>{children}</ThemeProvider>;
}
