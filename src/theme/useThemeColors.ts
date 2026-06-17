"use client";

import { useThemeMode } from "./ThemeContext";
import { frappe, latte } from "./colors";

export type ThemeColors = typeof frappe;

export function useThemeColors(): ThemeColors {
  const { mode } = useThemeMode();
  return mode === "light" ? latte : frappe;
}
