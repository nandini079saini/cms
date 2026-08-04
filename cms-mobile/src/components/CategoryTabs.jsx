import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from "react-native";
import { Colors } from "../../constants/theme";

export const CategoryTabs = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const allCategories = ["All", ...categories.filter((c) => c !== "All")];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {allCategories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.pill, isSelected && styles.selectedPill]}
              onPress={() => onSelectCategory(cat)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.pillText, isSelected && styles.selectedPillText]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    paddingVertical: 10,
  },
  container: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginRight: 6,
  },
  selectedPill: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.muted,
  },
  selectedPillText: {
    color: Colors.light.surface,
  },
});
