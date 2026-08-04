import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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

export default function CategoryScreen() {
  const { category } = useLocalSearchParams();
  const router = useRouter();

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category} Articles</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerCategory}>{category?.toUpperCase()}</Text>
          <Text style={styles.bannerSubtitle}>
            {categoryPosts.length} post{categoryPosts.length === 1 ? "" : "s"}{" "}
            available in this section
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={Colors.light.primary}
            style={{ marginVertical: 30 }}
          />
        ) : categoryPosts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              No articles in this category yet.
            </Text>
          </View>
        ) : (
          categoryPosts.map((post) => <PostCard key={post.id} post={post} />)
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
});
