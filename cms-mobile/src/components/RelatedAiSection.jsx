import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getRelatedAi } from "../api/posts";

export const RelatedAiSection = ({ topic, title }) => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!topic && !title) return;
      setLoading(true);
      try {
        const res = await getRelatedAi({ topic, title });
        if (res && res.recommendations) {
          setRecommendations(res.recommendations);
        } else if (Array.isArray(res)) {
          setRecommendations(res);
        } else {
          setRecommendations([
            "Deep dive into key concepts and methodology",
            "Industry standards and best practice blueprints",
            "Future trends & upcoming innovations in this field",
          ]);
        }
      } catch (err) {
        // Fallback default recommendations
        setRecommendations([
          "Deep dive into key concepts and methodology",
          "Industry standards and best practice blueprints",
          "Future trends & upcoming innovations in this field",
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [topic, title]);

  if (!topic && !title) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={18} color="#8B5CF6" />
        <Text style={styles.headerTitle}>AI Insights & Related Topics</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="small"
          color="#8B5CF6"
          style={{ marginVertical: 10 }}
        />
      ) : (
        <View style={styles.list}>
          {recommendations.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.bullet} />
              <Text style={styles.itemText}>{item}</Text>
            </View>
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
  list: {
    gap: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#8B5CF6",
  },
  itemText: {
    fontSize: 14,
    color: "#4C1D95",
    flex: 1,
    lineHeight: 20,
  },
});
