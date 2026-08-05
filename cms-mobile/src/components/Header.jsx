import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

import { Colors } from "../../constants/theme";

export const Header = ({ showBack = false, title }) => {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBack ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={Colors.light.surface}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.brandRow}>
            <Text style={styles.brandTitle}>CMS Stories</Text>
          </View>
        )}
      </View>

      {title ? (
        <Text style={styles.centerTitle} numberOfLines={1}>
          {title}
        </Text>
      ) : null}

      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/(tabs)/explore")}
        >
          <Ionicons
            name="search-outline"
            size={22}
            color={Colors.light.surface}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push(user ? "/(tabs)/profile" : "/login")}
        >
          {user ? (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
          ) : (
            <Ionicons
              name="person-circle-outline"
              size={26}
              color={Colors.light.surface}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: Colors.light.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.light.primaryDark,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: Colors.light.surface,
    fontWeight: "800",
    fontSize: 18,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.surface,
    letterSpacing: -0.5,
  },
  centerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.surface,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileButton: {
    marginLeft: 4,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primaryDark,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: Colors.light.surface,
    fontWeight: "700",
    fontSize: 14,
  },
});
