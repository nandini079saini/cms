import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { getAllSnaps, reactToSnap } from "../../src/api/snaps";
import { Header } from "../../src/components/Header";
import { useAuth } from "../../src/context/AuthContext";

const PAGE_SIZE = 5;

export default function SnapsScreen() {
  const { user } = useAuth();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["snaps"],
    queryFn: getAllSnaps,
  });

  const snaps = data?.snaps || [];
  const visibleSnaps = snaps.slice(0, visibleCount);
  const hasMore = visibleCount < snaps.length;

  const handleReact = async (snapId, reactionType) => {
    if (!user) return;
    try {
      await reactToSnap(snapId, user.id, reactionType);
      refetch();
    } catch (err) {
      console.error("Reaction failed:", err);
    }
  };

  const handleRefresh = async () => {
    setVisibleCount(PAGE_SIZE);
    await refetch();
  };

  const renderSnap = ({ item: snap }) => (
    <View style={styles.snapCard}>
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
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={150}
      />

      {snap.caption ? <Text style={styles.caption}>{snap.caption}</Text> : null}

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
  );

  const ListHeader = (
    <View style={styles.introHeader}>
      <Text style={styles.introTitle}>Snaps Feed</Text>
      <Text style={styles.introSubtitle}>
        Visual highlights shared by the community
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
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>No snaps shared yet.</Text>
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
          Load more ({snaps.length - visibleCount} left)
        </Text>
      </TouchableOpacity>
    ) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Community Snaps" />

      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={visibleSnaps}
        keyExtractor={(snap) => String(snap.id)}
        renderItem={renderSnap}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[Colors.light.primary]}
          />
        }
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={6}
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
