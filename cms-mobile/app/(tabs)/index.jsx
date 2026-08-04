import React, { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useQuery } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { getAllPosts } from "../../src/api/posts";
import { getAllQuickBites } from "../../src/api/quickbites";
import { getAllSnaps } from "../../src/api/snaps";
import { CategoryTabs } from "../../src/components/CategoryTabs";
import { Header } from "../../src/components/Header";
import { PostCard } from "../../src/components/PostCard";
import { QuickBitesSection } from "../../src/components/QuickBitesSection";
import { SnapsBar } from "../../src/components/SnapsBar";

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const {
    data: postsData,
    isLoading: isPostsLoading,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: getAllPosts,
  });

  const { data: quickBitesData, refetch: refetchQuickBites } = useQuery({
    queryKey: ["quickbites"],
    queryFn: getAllQuickBites,
  });

  const { data: snapsData, refetch: refetchSnaps } = useQuery({
    queryKey: ["snaps"],
    queryFn: getAllSnaps,
  });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchPosts(), refetchQuickBites(), refetchSnaps()]);
    setRefreshing(false);
  };

  const allPosts = postsData?.posts || [];
  const publishedPosts = allPosts.filter((p) => p.status === "published");

  const categories = [
    ...new Set(publishedPosts.map((p) => p.category).filter(Boolean)),
  ];

  const filteredPosts =
    selectedCategory === "All"
      ? publishedPosts
      : publishedPosts.filter((p) => p.category === selectedCategory);

  const quickBites = quickBitesData?.quickBites || [];
  const snaps = snapsData?.snaps || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.light.primary]}
          />
        }
      >
        {/* Banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroTitle}>Discover Amazing Stories</Text>
          <Text style={styles.heroSubtitle}>
            {publishedPosts.length} article
            {publishedPosts.length === 1 ? "" : "s"} — reporting, essays, and
            ideas.
          </Text>
        </View>

        {/* Snaps Bar */}
        <SnapsBar snaps={snaps} onRefresh={refetchSnaps} />

        {/* Quick Bites */}
        <QuickBitesSection quickBites={quickBites} />

        {/* Category Tabs */}
        <CategoryTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Feed Title */}
        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>
            {selectedCategory === "All"
              ? "Latest Stories"
              : `${selectedCategory} Stories`}
          </Text>
          <Text style={styles.feedCount}>{filteredPosts.length} posts</Text>
        </View>

        {/* Posts Feed */}
        {isPostsLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Fetching stories...</Text>
          </View>
        ) : filteredPosts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No posts found</Text>
            <Text style={styles.emptySubtitle}>
              Check back later or try selecting another category.
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
  scrollContent: {
    paddingBottom: 40,
  },
  heroBanner: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.light.surface,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 20,
  },
  feedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginVertical: 14,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
  },
  feedCount: {
    fontSize: 13,
    color: Colors.light.muted,
    fontWeight: "500",
  },
  loadingBox: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: Colors.light.muted,
    fontSize: 14,
  },
  emptyBox: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.light.muted,
    textAlign: "center",
  },
});
