import { Platform } from "react-native";

export const Colors = {
  light: {
    background: "#FAF7F1",
    surface: "#FFFFFF",
    text: "#1C1A17",
    muted: "#8A8175",
    border: "#E6E0D4",

    primary: "#B3431F",
    primaryDark: "#8F3417",

    accentSoft: "rgba(179,67,31,0.08)",
    accentSoft2: "rgba(179,67,31,0.14)",

    icon: "#8A8175",
    tabIconDefault: "#8A8175",
    tabIconSelected: "#B3431F",
  },

  dark: {
    background: "#1C1A17",
    surface: "#2A2622",
    text: "#FAF7F1",
    muted: "#C8BFB2",
    border: "#4A433B",

    primary: "#B3431F",
    primaryDark: "#8F3417",

    accentSoft: "rgba(179,67,31,0.08)",
    accentSoft2: "rgba(179,67,31,0.14)",

    icon: "#C8BFB2",
    tabIconDefault: "#C8BFB2",
    tabIconSelected: "#B3431F",
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
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
