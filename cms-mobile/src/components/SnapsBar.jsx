import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/theme";
import { reactToSnap } from "../api/snaps";
import { useAuth } from "../context/AuthContext";

export const SnapsBar = ({ snaps, onRefresh }) => {
  const { user } = useAuth();
  const [activeSnap, setActiveSnap] = useState(null);

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community Snaps</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {snaps.map((snap) => (
          <TouchableOpacity
            key={snap.id}
            style={styles.avatarContainer}
            onPress={() => setActiveSnap(snap)}
            activeOpacity={0.7}
          >
            <View style={styles.gradientRing}>
              <Image
                source={{ uri: snap.image_url }}
                style={styles.avatarImage}
              />
            </View>
            <Text style={styles.customerName} numberOfLines={1}>
              {snap.customer_name || "User"}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Snap Viewer Modal */}
      <Modal
        visible={!!activeSnap}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setActiveSnap(null)}
      >
        {activeSnap ? (
          <View style={styles.snapViewer}>
            <TouchableOpacity
              style={styles.closeViewer}
              onPress={() => setActiveSnap(null)}
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <Image
              source={{ uri: activeSnap.image_url }}
              style={styles.fullSnapImage}
              resizeMode="contain"
            />

            <View style={styles.viewerFooter}>
              <Text style={styles.viewerAuthor}>
                {activeSnap.customer_name}
              </Text>
              {activeSnap.caption ? (
                <Text style={styles.viewerCaption}>{activeSnap.caption}</Text>
              ) : null}

              <View style={styles.reactionsRow}>
                <TouchableOpacity
                  style={styles.reactionBtn}
                  onPress={() => handleReact("like")}
                >
                  <Text style={styles.reactionEmoji}>❤️</Text>
                  <Text style={styles.reactionCount}>
                    {activeSnap.likes || 0}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.reactionBtn}
                  onPress={() => handleReact("smile")}
                >
                  <Text style={styles.reactionEmoji}>😊</Text>
                  <Text style={styles.reactionCount}>
                    {activeSnap.smiles || 0}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.reactionBtn}
                  onPress={() => handleReact("tongue")}
                >
                  <Text style={styles.reactionEmoji}>😜</Text>
                  <Text style={styles.reactionCount}>
                    {activeSnap.tongues || 0}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 14,
  },
  avatarContainer: {
    alignItems: "center",
    width: 68,
  },
  gradientRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    padding: 2,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.light.surface,
  },
  customerName: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.light.text,
    marginTop: 4,
    textAlign: "center",
  },
  snapViewer: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
  },
  closeViewer: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 20,
    padding: 8,
  },
  fullSnapImage: {
    width: "100%",
    height: "70%",
  },
  viewerFooter: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
  },
  viewerAuthor: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  viewerCaption: {
    color: "#E5E7EB",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  reactionsRow: {
    flexDirection: "row",
    gap: 20,
  },
  reactionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  reactionEmoji: {
    fontSize: 18,
  },
  reactionCount: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});
