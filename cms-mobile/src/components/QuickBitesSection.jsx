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

export const QuickBitesSection = ({ quickBites }) => {
  const [selectedBite, setSelectedBite] = useState(null);

  if (!quickBites || quickBites.length === 0) return null;

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Quick Bites</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {quickBites.map((bite) => (
          <TouchableOpacity
            key={bite.id}
            style={styles.card}
            onPress={() => setSelectedBite(bite)}
            activeOpacity={0.8}
          >
            {bite.gif_url ? (
              <Image source={{ uri: bite.gif_url }} style={styles.cardImage} />
            ) : null}
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {bite.title}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal for reading full Quick Bite */}
      <Modal
        visible={!!selectedBite}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedBite(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelectedBite(null)}
            >
              <Ionicons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>

            {selectedBite?.gif_url ? (
              <Image
                source={{ uri: selectedBite.gif_url }}
                style={styles.modalImage}
                resizeMode="cover"
              />
            ) : null}

            <Text style={styles.modalTitle}>{selectedBite?.title}</Text>
            {selectedBite?.excerpt ? (
              <Text style={styles.modalExcerpt}>{selectedBite.excerpt}</Text>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 140,
    height: 170,
    borderRadius: 14,
    backgroundColor: Colors.light.text,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.75,
  },
  cardContent: {
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  cardTitle: {
    color: Colors.light.surface,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 17,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    padding: 20,
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
    padding: 6,
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 8,
  },
  modalExcerpt: {
    fontSize: 15,
    color: Colors.light.muted,
    lineHeight: 22,
  },
});
