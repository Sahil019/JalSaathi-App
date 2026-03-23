/**
 * JalSaathi Premium Theme - Modern Vibrant Palette
 * Shifting from monotone blue to a high-fidelity Indigo-Cyan-Purple spectrum.
 */

import { Platform } from "react-native";

const tintColorLight = "#6366F1"; // Vibrant Indigo
const tintColorDark = "#818CF8";  // Soft Indigo

export const Colors = {
  light: {
    text: "#0F172A",
    background: "#F8FAFC",
    tint: tintColorLight,
    icon: "#64748B",
    tabIconDefault: "#94A3B8",
    tabIconSelected: tintColorLight,
    primary: "#6366F1",         // Indigo
    secondary: "#06B6D4",       // Cyan
    accent: "#8B5CF6",          // Purple
    card: "rgba(255, 255, 255, 0.85)",
    border: "#E2E8F0",
    error: "#EF4444",
    success: "#10B981",
    warning: "#F59E0B",
    primaryGlow: "rgba(99, 102, 241, 0.2)",
    gradient: ["#6366F1", "#06B6D4"], // Indigo to Cyan
    vibrantGradient: ["#8B5CF6", "#6366F1"], // Purple to Indigo
    glass: "rgba(255, 255, 255, 0.7)",
    softBlue: "#EEF2FF",
    softPurple: "#F5F3FF",
  },
  dark: {
    text: "#F8FAFC",
    background: "#020617",
    tint: tintColorDark,
    icon: "#94A3B8",
    tabIconDefault: "#475569",
    tabIconSelected: tintColorDark,
    primary: "#818CF8",
    secondary: "#22D3EE",
    accent: "#A78BFA",
    card: "rgba(15, 23, 42, 0.75)",
    border: "#1E293B",
    error: "#F87171",
    success: "#34D399",
    warning: "#FBBF24",
    primaryGlow: "rgba(129, 140, 248, 0.3)",
    gradient: ["#0F172A", "#1E293B"],
    vibrantGradient: ["#A78BFA", "#818CF8"],
    glass: "rgba(15, 23, 42, 0.6)",
    softBlue: "#1E1B4B",
    softPurple: "#2E1065",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
