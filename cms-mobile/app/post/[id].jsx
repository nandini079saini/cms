import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { getPostById } from "../../src/api/posts";
import { useAuth } from "../../src/context/AuthContext";
import { RelatedAiSection } from "../../src/components/RelatedAiSection";
import { CommentSection } from "../../src/components/CommentSection";
import { Colors } from "../../constants/theme";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { bookmarks, toggleBookmark, likedPosts, toggleLike } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPostById(id),
    enabled: !!id,
  });

  const post = data?.post;
  const postIdNumber = post ? post.id : Number(id);

  const isBookmarked = bookmarks.includes(postIdNumber);
  const isLiked = likedPosts.includes(postIdNumber);

  const handleShare = async () => {
    if (!post) return;
    try {
      await Share.share({
        title: post.title,
        message: `${post.title} - Read more on CMS Stories`,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const formattedDate = post?.created_at
    ? new Date(post.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Detail Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.light.text} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
            <Ionicons
              name="share-outline"
              size={22}
              color={Colors.light.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => post && toggleBookmark(post.id)}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={22}
              color={isBookmarked ? Colors.light.primary : Colors.light.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : error || !post ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>Article not found.</Text>
          <TouchableOpacity
            style={styles.backHomeBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backHomeText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
        >
          {post.gif_url ? (
            <Image
              source={{ uri: post.gif_url }}
              style={styles.featuredImage}
              resizeMode="cover"
            />
          ) : null}

          <View style={styles.mainPadding}>
            {post.category ? (
              <View style={styles.categoryBadgeContainer}>
                <Text style={styles.categoryBadge}>
                  {post.category.toUpperCase()}
                </Text>
              </View>
            ) : null}

            <Text style={styles.title}>{post.title}</Text>

            <View style={styles.authorRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {post.author ? post.author.charAt(0).toUpperCase() : "A"}
                </Text>
              </View>
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>
                  {post.author || "Editorial Team"}
                </Text>
                <Text style={styles.dateText}>{formattedDate}</Text>
              </View>
            </View>

            {post.excerpt ? (
              <Text style={styles.excerpt}>{post.excerpt}</Text>
            ) : null}

            <View style={styles.divider} />

            {/* Content Body */}
            <Text style={styles.bodyContent}>
              {post.content || post.excerpt || "Full story content goes here."}
            </Text>

            {/* Like & Reaction bar */}
            <View style={styles.actionBar}>
              <TouchableOpacity
                style={[styles.likeBtn, isLiked && styles.likedBtn]}
                onPress={() => toggleLike(post.id)}
              >
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={20}
                  color={isLiked ? "#EF4444" : Colors.light.muted}
                />
                <Text style={[styles.likeText, isLiked && styles.likedText]}>
                  {isLiked ? "Liked" : "Like article"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Related AI */}
            <RelatedAiSection topic={post.category} title={post.title} />

            {/* Comment Section */}
            <CommentSection postId={post.id} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  headerBar: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.light.background,
    justifyContent: "center",
    alignItems: "center",
  },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 12,
  },
  backHomeBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backHomeText: {
    color: Colors.light.surface,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  content: {
    paddingBottom: 40,
  },
  featuredImage: {
    width: "100%",
    height: 240,
    backgroundColor: Colors.light.background,
  },
  mainPadding: {
    padding: 20,
  },
  categoryBadgeContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: Colors.light.accentSoft2,
    color: Colors.light.primary,
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.light.text,
    lineHeight: 32,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: Colors.light.surface,
    fontWeight: "700",
    fontSize: 16,
  },
  authorInfo: {
    justifyContent: "center",
  },
  authorName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.text,
  },
  dateText: {
    fontSize: 12,
    color: Colors.light.muted,
    marginTop: 2,
  },
  excerpt: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.muted,
    lineHeight: 24,
    fontStyle: "italic",
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 16,
  },
  bodyContent: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 26,
    marginBottom: 20,
  },
  actionBar: {
    marginVertical: 12,
  },
  likeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  likedBtn: {
    backgroundColor: "#FEE2E2",
  },
  likeText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.muted,
  },
  likedText: {
    color: "#EF4444",
  },
});
