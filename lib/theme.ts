import { useEffect, useRef } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";
import { useColorScheme as useNwColorScheme } from "nativewind";
import {
  usePreferencesStore,
  type ThemePreference,
} from "@/store/usePreferencesStore";

export type Scheme = "light" | "dark";

export type AppTheme = {
  scheme: Scheme;
  preference: ThemePreference;
  setPreference: (value: ThemePreference) => void;
  palette: Palette;
};

/**
 * Drives NativeWind's color scheme from the persisted preference plus the
 * OS setting. Call once near the root (see `ThemeBridge`) so the hook that
 * actually mutates NativeWind runs every render.
 */
export function useAppTheme(): AppTheme {
  const preference = usePreferencesStore((s) => s.themePreference);
  const setPreference = usePreferencesStore((s) => s.setThemePreference);
  const systemScheme = useSystemColorScheme();
  const { setColorScheme } = useNwColorScheme();

  const resolved: Scheme =
    preference === "system" ? (systemScheme ?? "light") : preference;

  const setRef = useRef(setColorScheme);
  setRef.current = setColorScheme;

  useEffect(() => {
    setRef.current(preference === "system" ? "system" : preference);
  }, [preference]);

  return {
    scheme: resolved,
    preference,
    setPreference,
    palette: PALETTES[resolved],
  };
}

/**
 * Color tokens consumed by JS (charts, native chrome, glass tint) that
 * can't be expressed with Tailwind `dark:` variants.
 */
export type Palette = {
  background: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentPressed: string;
  positive: string;
  negative: string;
  warning: string;
  chart: {
    axisLine: string;
    axisLabel: string;
    followers: string;
    following: string;
    unfollowers: string;
  };
  tabBarActive: string;
  tabBarInactive: string;
};

const PALETTES: Record<Scheme, Palette> = {
  light: {
    background: "#f8fafc",
    surface: "#ffffff",
    border: "rgba(15,23,42,0.08)",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    textMuted: "#94a3b8",
    accent: "#4f46e5",
    accentPressed: "#4338ca",
    positive: "#059669",
    negative: "#e11d48",
    warning: "#f59e0b",
    chart: {
      axisLine: "rgba(15,23,42,0.06)",
      axisLabel: "#94a3b8",
      followers: "#4f46e5",
      following: "#f59e0b",
      unfollowers: "#e11d48",
    },
    tabBarActive: "#4f46e5",
    tabBarInactive: "#64748b",
  },
  dark: {
    background: "#020617",
    surface: "#0f172a",
    border: "rgba(148,163,184,0.18)",
    textPrimary: "#f1f5f9",
    textSecondary: "#cbd5e1",
    textMuted: "#64748b",
    accent: "#818cf8",
    accentPressed: "#6366f1",
    positive: "#34d399",
    negative: "#fb7185",
    warning: "#fbbf24",
    chart: {
      axisLine: "rgba(148,163,184,0.14)",
      axisLabel: "#64748b",
      followers: "#818cf8",
      following: "#fbbf24",
      unfollowers: "#fb7185",
    },
    tabBarActive: "#a5b4fc",
    tabBarInactive: "#64748b",
  },
};
