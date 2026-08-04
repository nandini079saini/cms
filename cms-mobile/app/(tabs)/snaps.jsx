import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { getAllSnaps, reactToSnap } from "../../src/api/snaps";
import { Header } from "../../src/components/Header";
import { useAuth } from "../../src/context/AuthContext";

export default function SnapsScreen() {
  const { user } = useAuth();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["snaps"],
    queryFn: getAllSnaps,
  });

  const snaps = data?.snaps || [];

  const handleReact = async (snapId, reactionType) => {
    if (!user) return;
    try {
      await reactToSnap(snapId, user.id, reactionType);
      refetch();
    } catch (err) {
      console.error("Reaction failed:", err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Community Snaps" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={[Colors.light.primary]}
          />
        }
      >
        <View style={styles.introHeader}>
          <Text style={styles.introTitle}>Snaps Feed</Text>
          <Text style={styles.introSubtitle}>
            Visual highlights shared by the community
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={Colors.light.primary}
            style={{ marginVertical: 30 }}
          />
        ) : snaps.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No snaps shared yet.</Text>
          </View>
        ) : (
          snaps.map((snap) => (
            <View key={snap.id} style={styles.snapCard}>
              <View style={styles.cardHeader}>
                <View style={styles.authorBadge}>
                  <Text style={styles.authorLetter}>
                    {snap.customer_name
                      ? snap.customer_name.charAt(0).toUpperCase()
                      : "U"}
                  </Text>
                </View>
                <View>
                  <Text style={styles.authorName}>
                    {snap.customer_name || "Community Member"}
                  </Text>
                  <Text style={styles.timeAgo}>
                    {snap.created_at
                      ? new Date(snap.created_at).toLocaleDateString()
                      : ""}
                  </Text>
                </View>
              </View>

              <Image
                source={{ uri: snap.image_url }}
                style={styles.snapImage}
                resizeMode="cover"
              />

              {snap.caption ? (
                <Text style={styles.caption}>{snap.caption}</Text>
              ) : null}

              <View style={styles.reactionsRow}>
                <TouchableOpacity
                  style={styles.reactionBtn}
                  onPress={() => handleReact(snap.id, "like")}
                >
                  <Text style={styles.emoji}>❤️</Text>
                  <Text style={styles.count}>{snap.likes || 0}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.reactionBtn}
                  onPress={() => handleReact(snap.id, "smile")}
                >
                  <Text style={styles.emoji}>😊</Text>
                  <Text style={styles.count}>{snap.smiles || 0}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.reactionBtn}
                  onPress={() => handleReact(snap.id, "tongue")}
                >
                  <Text style={styles.emoji}>😜</Text>
                  <Text style={styles.count}>{snap.tongues || 0}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
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
  introHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.light.text,
  },
  introSubtitle: {
    fontSize: 13,
    color: Colors.light.muted,
    marginTop: 2,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: Colors.light.muted,
    fontSize: 14,
  },
  snapCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },
  authorBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  authorLetter: {
    color: Colors.light.surface,
    fontWeight: "700",
    fontSize: 14,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.text,
  },
  timeAgo: {
    fontSize: 11,
    color: Colors.light.muted,
  },
  snapImage: {
    width: "100%",
    height: 300,
    backgroundColor: Colors.light.accentSoft,
  },
  caption: {
    padding: 12,
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  reactionsRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  reactionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.accentSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  emoji: {
    fontSize: 16,
  },
  count: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.text,
  },
});
