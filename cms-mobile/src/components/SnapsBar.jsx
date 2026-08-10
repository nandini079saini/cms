import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import Swiper from "react-native-swiper";
import { reactToSnap } from "../api/snaps";
import { useAuth } from "../context/AuthContext";

// Sizes matched to the web Snaps.jsx card (320 x 430), capped to the
// screen width so it doesn't overflow on narrow devices.
const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = Math.min(320, SCREEN_WIDTH - 40);
const CARD_HEIGHT = CARD_WIDTH * (430 / 320);

export const SnapsBar = ({ snaps, onRefresh }) => {
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeSnapId, setActiveSnapId] = useState(null);

  // Re-derive from the latest `snaps` prop by id (not a frozen snapshot),
  // so counts refresh right after a refetch.
  const activeSnap = snaps ? snaps.find((s) => s.id === activeSnapId) : null;

  if (!snaps || snaps.length === 0) return null;

  const handleReact = async (reactionType) => {
    if (!activeSnap || !user) return;
    try {
      await reactToSnap(activeSnap.id, user.id, reactionType);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed reaction", err);
    }
  };

  const current = snaps[activeIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>COMMUNITY SNAPS</Text>
      </View>

      <View style={styles.swiperWrap}>
        <Swiper
          style={styles.swiper}
          loop
          showsPagination={false}
          onIndexChanged={setActiveIndex}
        >
          {snaps.map((snap) => (
            <TouchableOpacity
              key={snap.id}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => setActiveSnapId(snap.id)}
            >
              <Image
                source={{ uri: snap.image_url }}
                style={styles.cardImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={150}
              />
            </TouchableOpacity>
          ))}
        </Swiper>
      </View>

      {current ? (
        <>
          <Text style={styles.caption} numberOfLines={1}>
            {current.customer_name || "User"}
          </Text>
          {current.caption ? (
            <Text style={styles.excerpt} numberOfLines={2}>
              {current.caption}
            </Text>
          ) : null}
        </>
      ) : null}

      {/* Snap Viewer Modal */}
      <Modal
        visible={!!activeSnap}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setActiveSnapId(null)}
      >
        {activeSnap ? (
          <TouchableOpacity
            style={styles.snapViewer}
            activeOpacity={1}
            onPress={() => setActiveSnapId(null)}
          >
            <TouchableOpacity
              style={styles.viewerCard}
              activeOpacity={1}
              onPress={() => {}}
            >
              <TouchableOpacity
                style={styles.closeViewer}
                onPress={() => setActiveSnapId(null)}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <Text style={styles.viewerAuthor}>
                {activeSnap.customer_name}
              </Text>

              <Image
                source={{ uri: activeSnap.image_url }}
                style={styles.fullSnapImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={150}
              />

              {activeSnap.caption ? (
                <Text style={styles.viewerCaption}>{activeSnap.caption}</Text>
              ) : null}

              <View style={styles.reactionsRow}>
                <TouchableOpacity
                  style={styles.reactionBtn}
                  onPress={() => handleReact("like")}
                >
                  <Text style={styles.reactionEmoji}>👍</Text>
                  <Text style={styles.reactionCount}>
                    {activeSnap.likes || 0}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.reactionBtn}
                  onPress={() => handleReact("smile")}
                >
                  <Text style={styles.reactionEmoji}>😄</Text>
                  <Text style={styles.reactionCount}>
                    {activeSnap.smiles || 0}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.reactionBtn}
                  onPress={() => handleReact("tongue")}
                >
                  <Text style={styles.reactionEmoji}>😛</Text>
                  <Text style={styles.reactionCount}>
                    {activeSnap.tongues || 0}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        ) : null}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    paddingBottom: 8,
    alignItems: "center",
  },
  header: {
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222222",
    textTransform: "uppercase",
  },
  swiperWrap: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  swiper: {
    height: CARD_HEIGHT,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 8,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  caption: {
    marginTop: 11,
    marginBottom: 3,
    fontWeight: "700",
    fontSize: 14,
    color: "#222222",
    textAlign: "center",
  },
  excerpt: {
    fontSize: 13,
    color: "#717171",
    textAlign: "center",
    paddingHorizontal: 24,
    lineHeight: 18,
  },
  snapViewer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  viewerCard: {
    width: "90%",
    maxWidth: 420,
  },
  closeViewer: {
    position: "absolute",
    top: -40,
    right: 0,
    zIndex: 20,
    padding: 4,
  },
  viewerAuthor: {
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 8,
  },
  fullSnapImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
  },
  viewerCaption: {
    color: "#EEEEEE",
    fontSize: 14,
    marginTop: 8,
  },
  reactionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 20,
  },
  reactionBtn: {
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
  },
  reactionEmoji: {
    fontSize: 26,
  },
  reactionCount: {
    color: "#CCCCCC",
    fontSize: 12,
  },
});
