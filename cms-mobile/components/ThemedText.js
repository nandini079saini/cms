import { StyleSheet, Text } from "react-native";
import { useThemeColor } from "../hooks/use-theme-color";
export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}) {
  const color = useThemeColor(
    {
      light: lightColor,
      dark: darkColor,
    },
    "text",
  );

  return (
    <Text
      style={[
        { color },

        type === "default" && styles.default,

        type === "title" && styles.title,

        type === "defaultSemiBold" && styles.defaultSemiBold,

        type === "subtitle" && styles.subtitle,

        type === "link" && styles.link,

        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },

  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },

  title: {
    fontSize: 32,
    lineHeight: 32,
    fontWeight: "bold",
    fontFamily: "Fraunces_700Bold",
  },

  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Fraunces_700Bold",
  },

  link: {
    fontSize: 16,
    lineHeight: 30,
    color: "#B3431F",
  },
});
