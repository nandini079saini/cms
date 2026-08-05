import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { Colors } from "../../constants/theme";

function PostCardComponent({ post }) {
  const router = useRouter();
  const { bookmarks, toggleBookmark, likedPosts, toggleLike } = useAuth();

  const isBookmarked = bookmarks.includes(post.id);
  const isLiked = likedPosts.includes(post.id);

  const formattedDate = post.created_at
    ? new Date(post.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/post/${post.id}`)}
      activeOpacity={0.9}
    >
      {post.gif_url ? (
        <Image
          source={{ uri: post.gif_url }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={150}
        />
      ) : null}

      <View style={styles.content}>
        {post.category ? (
          <View style={styles.badgeContainer}>
            <Text style={styles.categoryBadge}>
              {post.category.toUpperCase()}
            </Text>
          </View>
        ) : null}

        <Text style={styles.title} numberOfLines={2}>
          {post.title}
        </Text>

        {post.excerpt ? (
          <Text style={styles.excerpt} numberOfLines={2}>
            {post.excerpt}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.metaRow}>
            {post.author ? (
              <Text style={styles.metaText}>{post.author} • </Text>
            ) : null}
            <Text style={styles.metaText}>{formattedDate}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => toggleLike(post.id)}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={20}
                color={isLiked ? "#EF4444" : Colors.light.muted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => toggleBookmark(post.id)}
            >
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={20}
                color={isBookmarked ? Colors.light.primary : Colors.light.muted}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Skip re-rendering a card when unrelated parent state changes (search text,
// other cards' like/bookmark toggles, refetches that return the same post
// object by reference, etc). Only re-renders if this specific post's data
// actually changes.
export const PostCard = React.memo(PostCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.light.border,
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: 16,
  },
  badgeContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: Colors.light.accentSoft2,
    color: Colors.light.primary,
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 6,
  },
  excerpt: {
    fontSize: 14,
    color: Colors.light.muted,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
    color: Colors.light.muted,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionBtn: {
    padding: 4,
  },
});
