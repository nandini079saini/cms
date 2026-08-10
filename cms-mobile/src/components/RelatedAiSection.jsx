import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getRelatedAi } from "../api/posts";

// Renders a row of LLM-picked related articles for a given post.
// Usage: <RelatedAiSection postId={post.id} /> — mirrors cms-frontend's RelatedAI.jsx.
export const RelatedAiSection = ({ postId, limit = 5 }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!postId) return;
    let cancelled = false;
    setLoading(true);
    setError(false);

    getRelatedAi(postId, limit)
      .then((data) => {
        if (!cancelled) setRelated(data?.related || []);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [postId, limit]);

  if (!postId) return null;
  if (!loading && (error || related.length === 0)) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={18} color="#8B5CF6" />
        <Text style={styles.headerTitle}>Related Content</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="small"
          color="#8B5CF6"
          style={{ marginVertical: 10 }}
        />
      ) : (
        <View style={styles.grid}>
          {related.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.card}
              activeOpacity={0.85}
              // NOTE: adjust this path to match your actual expo-router post
              // detail route (this mirrors the web version's `/post/${slug||id}`).
              onPress={() => router.push(`/post/${post.slug || post.id}`)}
            >
              {post.gif_url ? (
                <Image
                  source={{ uri: post.gif_url }}
                  style={styles.cardImage}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={150}
                />
              ) : null}
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {post.title}
                </Text>
                {post.category ? (
                  <Text style={styles.cardCategory}>{post.category}</Text>
                ) : null}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F3FF",
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6D28D9",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "47%",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E9E5FB",
  },
  cardImage: {
    width: "100%",
    height: 90,
    backgroundColor: "#EDE9FE",
  },
  cardBody: {
    padding: 8,
  },
  cardTitle: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#312E81",
    lineHeight: 17,
    marginBottom: 3,
  },
  cardCategory: {
    fontSize: 10.5,
    color: "#8B5CF6",
    fontWeight: "500",
  },
});
