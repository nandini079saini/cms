import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { getAllPosts } from "../../src/api/posts";
import { PostCard } from "../../src/components/PostCard";
import { Colors } from "../../constants/theme";

const PAGE_SIZE = 5;

export default function CategoryScreen() {
  const { category } = useLocalSearchParams();
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { data, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: getAllPosts,
  });

  const publishedPosts = (data?.posts || []).filter(
    (p) => p.status === "published",
  );
  const categoryPosts = publishedPosts.filter(
    (p) => p.category?.toLowerCase() === category?.toLowerCase(),
  );

  // Reset pagination whenever the category param changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [category]);

  const visiblePosts = categoryPosts.slice(0, visibleCount);
  const hasMore = visibleCount < categoryPosts.length;

  const ListHeader = (
    <View style={styles.banner}>
      <Text style={styles.bannerCategory}>{category?.toUpperCase()}</Text>
      <Text style={styles.bannerSubtitle}>
        {categoryPosts.length} post{categoryPosts.length === 1 ? "" : "s"}{" "}
        available in this section
      </Text>
    </View>
  );

  const ListEmpty = isLoading ? (
    <ActivityIndicator
      size="large"
      color={Colors.light.primary}
      style={{ marginVertical: 30 }}
    />
  ) : (
    <View style={styles.emptyBox}>
      <Text style={styles.emptyText}>No articles in this category yet.</Text>
    </View>
  );

  const ListFooter =
    !isLoading && hasMore ? (
      <TouchableOpacity
        style={styles.loadMoreBtn}
        onPress={() => setVisibleCount((c) => c + PAGE_SIZE)}
        activeOpacity={0.8}
      >
        <Text style={styles.loadMoreText}>
          Load more ({categoryPosts.length - visibleCount} left)
        </Text>
      </TouchableOpacity>
    ) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category} Articles</Text>
      </View>

      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={visiblePosts}
        keyExtractor={(post) => String(post.id)}
        renderItem={({ item }) => <PostCard post={item} />}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        removeClippedSubviews
        updateCellsBatchingPeriod={50}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  headerRow: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.background,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
    marginLeft: 12,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    paddingBottom: 40,
  },
  banner: {
    backgroundColor: Colors.light.primary,
    padding: 20,
    marginBottom: 16,
  },
  bannerCategory: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.light.surface,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
  },
  emptyBox: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: Colors.light.muted,
    fontSize: 14,
  },
  loadMoreBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
    backgroundColor: Colors.light.surface,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.primary,
  },
});
