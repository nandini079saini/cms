import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { getAllPosts, getCategories } from "../../src/api/posts";
import { Header } from "../../src/components/Header";
import { PostCard } from "../../src/components/PostCard";

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState(null);

  const { data: postsData } = useQuery({
    queryKey: ["posts"],
    queryFn: getAllPosts,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const publishedPosts = (postsData?.posts || []).filter(
    (p) => p.status === "published",
  );

  const dbCategories = categoriesData?.categories || [];
  const postCategories = [
    ...new Set(publishedPosts.map((p) => p.category).filter(Boolean)),
  ];
  const allCategoryNames = Array.from(
    new Set([...dbCategories.map((c) => c.name), ...postCategories]),
  );

  const filteredPosts = publishedPosts.filter((post) => {
    const matchesCat = selectedCat ? post.category === selectedCat : true;
    const matchesSearch = searchQuery.trim()
      ? post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.excerpt &&
          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesCat && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Explore & Search" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={Colors.light.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search articles, topics, keywords..."
            placeholderTextColor={Colors.light.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={Colors.light.muted}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Topics & Categories</Text>
          {selectedCat ? (
            <TouchableOpacity onPress={() => setSelectedCat(null)}>
              <Text style={styles.clearFilter}>Clear filter</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.categoryGrid}>
          {allCategoryNames.map((cat) => {
            const isSelected = selectedCat === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryCard,
                  isSelected && styles.selectedCatCard,
                ]}
                onPress={() => setSelectedCat(isSelected ? null : cat)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="newspaper-outline"
                  size={20}
                  color={
                    isSelected ? Colors.light.surface : Colors.light.primary
                  }
                />
                <Text
                  style={[
                    styles.categoryCardText,
                    isSelected && styles.selectedCatText,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Results Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCat ? `${selectedCat} Articles` : "All Articles"}
          </Text>
          <Text style={styles.resultCount}>{filteredPosts.length} results</Text>
        </View>

        {filteredPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="search-outline"
              size={48}
              color={Colors.light.border}
            />
            <Text style={styles.emptyTitle}>No matching articles</Text>
            <Text style={styles.emptyText}>
              Try searching with another keyword or category.
            </Text>
          </View>
        ) : (
          filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    paddingBottom: 40,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    margin: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
  },
  clearFilter: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: "600",
  },
  resultCount: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 8,
  },
  selectedCatCard: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryCardText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
  },
  selectedCatText: {
    color: Colors.light.surface,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.light.muted,
    textAlign: "center",
  },
});
