"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { defaultDarkTheme, defaultLightTheme, tokenNames, type Theme } from "./theme";

type ThemeMode = "light" | "dark";
type ThemeProps = {
  /** Active colour scheme. Defaults to the nearest dashboard ThemeProvider's mode, otherwise `"light"`. */
  mode?: ThemeMode;
  /** Partial overrides for light mode, merged onto the built-in light tokens. */
  lightTheme?: Theme;
  /** Partial overrides for dark mode. When omitted, `lightTheme` applies to both modes. */
  darkTheme?: Theme;
  children?: ReactNode;
};

export const ThemeContext = createContext<{
  mode: ThemeMode;
  theme: Required<Theme>;
  portalThemeClassName: string;
} | null>(null);

// ---------------------------------------------------------------------------
// Dev-mode warnings, as react-components' ThemeProvider gives them
// ---------------------------------------------------------------------------
// Bundlers replace process.env.NODE_ENV; the package doesn't depend on Node's types for it.
declare const process: { env?: Record<string, string | undefined> } | undefined;

const KNOWN_KEYS = new Set(Object.keys(defaultLightTheme));
const devWarned = new Set<string>();

function warnOnce(key: string, message: string) {
  if (devWarned.has(key)) return;
  devWarned.add(key);
  console.warn(message);
}

function validateTheme(theme: Theme, propName: string) {
  for (const [key, value] of Object.entries(theme)) {
    if (value !== undefined && typeof value !== "string") {
      warnOnce(
        `non-string:${propName}:${key}`,
        `[OpenUI dashboard] ${propName} key "${key}" has a non-string value (${typeof value}). All theme values should be strings.`,
      );
    }
    if (!KNOWN_KEYS.has(key)) {
      warnOnce(
        `unknown-key:${propName}:${key}`,
        `[OpenUI dashboard] ${propName} contains unknown key "${key}". It will be ignored.`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Scope ids
// ---------------------------------------------------------------------------
// useId is unique within one React root only: two roots on a page both start at the same id.
// The server and the first client render use it as is, so hydration matches. On the client each
// scope class is claimed by the first provider that writes it; a provider that finds its class
// taken by another root adds a suffix from this counter, before paint, and keeps it.
const claims = new Map<string, object>();
let collisions = 0;
const useClientLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function ThemeProvider({ mode: suppliedMode, lightTheme, darkTheme, children }: ThemeProps) {
  const parent = useContext(ThemeContext);
  const mode = suppliedMode ?? parent?.mode ?? "light";
  const [owner] = useState<object>(() => ({}));
  const [suffix, setSuffix] = useState("");
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "") + suffix;
  const scope = `openui-dashboard-theme-${id}`;
  const portalThemeClassName = `${scope}-portal`;

  if (typeof process !== "undefined" && process.env?.["NODE_ENV"] !== "production") {
    if (lightTheme) validateTheme(lightTheme, "lightTheme");
    if (darkTheme) validateTheme(darkTheme, "darkTheme");
  }

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
  // A string compares by value, so a new but equal theme object keeps the same style tag.
  const variables = useMemo(
    () =>
      Object.entries(theme)
        .map(([key, token]) => `--openui-dashboard-${tokenNames[key as keyof Theme]}: ${token};`)
        .join("\n"),
    [theme],
  );
  const value = useMemo(
    () => ({ mode, theme, portalThemeClassName }),
    [mode, theme, portalThemeClassName],
  );

  useInsertionEffect(() => {
    const holder = claims.get(scope);
    // Another root's provider owns this class: write nothing until the layout effect renames ours.
    if (holder && holder !== owner) return;
    claims.set(scope, owner);
    const style = document.createElement("style");
    const nonce = (window as Window & { __nonce__?: string }).__nonce__;
    if (nonce) style.nonce = nonce;
    style.dataset["openuiDashboardTheme"] = id;
    style.textContent = `.${scope}, .${portalThemeClassName} { ${variables} color-scheme: ${mode}; }`;
    document.head.appendChild(style);
    return () => {
      style.remove();
      if (claims.get(scope) === owner) claims.delete(scope);
    };
  }, [variables, scope, portalThemeClassName, id, mode, owner]);

  useClientLayoutEffect(() => {
    if (claims.get(scope) !== owner) setSuffix(`-${++collisions}`);
  }, [scope, owner]);

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
