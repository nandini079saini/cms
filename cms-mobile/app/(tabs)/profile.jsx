import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { getAllPosts } from "../../src/api/posts";
import { getAllSnaps, uploadSnap } from "../../src/api/snaps";
import { Header } from "../../src/components/Header";
import { PostCard } from "../../src/components/PostCard";
import { useAuth } from "../../src/context/AuthContext";

const STORY_DURATION = 4000;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout, bookmarks, likedPosts } = useAuth();
  const [activeTab, setActiveTab] = useState("bookmarks");

  const { data: postsData } = useQuery({
    queryKey: ["posts"],
    queryFn: getAllPosts,
  });

  const allPosts = postsData?.posts || [];
  const bookmarkedPostsList = allPosts.filter((p) => bookmarks.includes(p.id));
  const likedPostsList = allPosts.filter((p) => likedPosts.includes(p.id));

  // ---- Snaps ----
  const { data: snapsData } = useQuery({
    queryKey: ["snaps"],
    queryFn: getAllSnaps,
    enabled: !!user,
  });
  const mySnaps = (snapsData?.snaps || []).filter(
    (s) => s.customer_id === user?.id,
  );

  const [snapPreview, setSnapPreview] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const uploadMutation = useMutation({
    mutationFn: uploadSnap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["snaps"] });
    },
    onError: (err) => {
      console.error("Snap upload failed:", err);
      setUploadError("Couldn't upload snap. Try again.");
    },
    onSettled: () => {
      setSnapPreview(null);
    },
  });

  const submitSnap = (asset) => {
    if (!asset || !user) return;
    setUploadError(null);
    setSnapPreview(asset.uri);

    const formData = new FormData();
    const filename = asset.uri.split("/").pop() || "snap.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("snap", {
      uri: asset.uri,
      name: filename,
      type,
    });
    formData.append("customer_id", user.id);

    uploadMutation.mutate(formData);
  };

  const takeSnap = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      setUploadError("Camera permission is required to take a snap.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      submitSnap(result.assets[0]);
    }
  };

  const chooseFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setUploadError("Gallery access is required to choose a snap.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      submitSnap(result.assets[0]);
    }
  };

  // ---- Story viewer ----
  const [viewedIds, setViewedIds] = useState(() => new Set());
  const [storyOpen, setStoryOpen] = useState(false);
  const [storyIdx, setStoryIdx] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

  const openStory = (idx) => {
    setStoryIdx(idx);
    setStoryOpen(true);
    setViewedIds((prev) => new Set(prev).add(mySnaps[idx]?.id));
  };

  const goNext = () => {
    if (storyIdx < mySnaps.length - 1) {
      const next = storyIdx + 1;
      setStoryIdx(next);
      setViewedIds((prev) => new Set(prev).add(mySnaps[next]?.id));
    } else {
      setStoryOpen(false);
    }
  };

  const goPrev = () => {
    if (storyIdx > 0) setStoryIdx(storyIdx - 1);
  };

  useEffect(() => {
    if (!storyOpen || mySnaps.length === 0) return undefined;

    progress.setValue(0);
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (finished) goNext();
    });

    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyOpen, storyIdx, mySnaps.length]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="My Profile" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* User Card */}
        {user ? (
          <View style={styles.profileCard}>
            <View style={styles.avatarLarge}>
              {snapPreview ? (
                <Image
                  source={{ uri: snapPreview }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarLetter}>
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </Text>
              )}
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>

            {/* Snap actions */}
            <View style={styles.snapActionsRow}>
              <TouchableOpacity
                style={styles.snapBtn}
                onPress={takeSnap}
                disabled={uploadMutation.isPending}
              >
                <Ionicons
                  name="camera-outline"
                  size={16}
                  color={Colors.light.primary}
                />
                <Text style={styles.snapBtnText}>Take a Snap</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.snapBtn}
                onPress={chooseFromGallery}
                disabled={uploadMutation.isPending}
              >
                <Ionicons
                  name="images-outline"
                  size={16}
                  color={Colors.light.primary}
                />
                <Text style={styles.snapBtnText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>

            {uploadMutation.isPending && (
              <View style={styles.uploadingRow}>
                <ActivityIndicator size="small" color={Colors.light.primary} />
                <Text style={styles.uploadingText}>Uploading…</Text>
              </View>
            )}
            {uploadError && (
              <Text style={styles.uploadErrorText}>{uploadError}</Text>
            )}

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color="#EF4444" />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.guestCard}>
            <Ionicons
              name="person-circle"
              size={64}
              color={Colors.light.muted}
            />
            <Text style={styles.guestTitle}>Join CMS Mobile</Text>
            <Text style={styles.guestText}>
              Log in or sign up to bookmark articles, save liked posts, and join
              the conversation.
            </Text>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.loginBtnText}>Log In or Sign Up</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* My Snaps */}
        {user && mySnaps.length > 0 && (
          <View style={styles.snapsSection}>
            <Text style={styles.snapsSectionTitle}>My Snaps</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.snapsRow}
            >
              {mySnaps.map((snap, i) => (
                <TouchableOpacity
                  key={snap.id ?? i}
                  style={styles.snapRingWrap}
                  onPress={() => openStory(i)}
                >
                  <View
                    style={[
                      styles.snapRing,
                      viewedIds.has(snap.id) && styles.snapRingViewed,
                    ]}
                  >
                    <View style={styles.snapRingInner}>
                      <Image
                        source={{ uri: snap.image_url }}
                        style={styles.snapThumb}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Tab Selection */}
        <View style={styles.tabHeader}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === "bookmarks" && styles.activeTabBtn,
            ]}
            onPress={() => setActiveTab("bookmarks")}
          >
            <Ionicons
              name="bookmark"
              size={18}
              color={
                activeTab === "bookmarks"
                  ? Colors.light.primary
                  : Colors.light.muted
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "bookmarks" && styles.activeTabText,
              ]}
            >
              Saved ({bookmarkedPostsList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === "likes" && styles.activeTabBtn,
            ]}
            onPress={() => setActiveTab("likes")}
          >
            <Ionicons
              name="heart"
              size={18}
              color={activeTab === "likes" ? "#EF4444" : Colors.light.muted}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "likes" && styles.activeTabText,
              ]}
            >
              Liked ({likedPostsList.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Saved / Liked Feed */}
        {activeTab === "bookmarks" ? (
          bookmarkedPostsList.length === 0 ? (
            <View style={styles.emptyFeed}>
              <Text style={styles.emptyFeedText}>No saved articles yet.</Text>
            </View>
          ) : (
            bookmarkedPostsList.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )
        ) : likedPostsList.length === 0 ? (
          <View style={styles.emptyFeed}>
            <Text style={styles.emptyFeedText}>No liked posts yet.</Text>
          </View>
        ) : (
          likedPostsList.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </ScrollView>

      {/* Story viewer modal */}
      <Modal
        visible={storyOpen && mySnaps.length > 0}
        transparent
        animationType="fade"
        onRequestClose={() => setStoryOpen(false)}
      >
        <View style={styles.storyBackdrop}>
          {/* Progress bars */}
          <View style={styles.storyProgressRow}>
            {mySnaps.map((snap, i) => (
              <View key={snap.id ?? i} style={styles.storyProgressTrack}>
                <Animated.View
                  style={[
                    styles.storyProgressFill,
                    {
                      width:
                        i < storyIdx
                          ? "100%"
                          : i === storyIdx
                            ? progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: ["0%", "100%"],
                              })
                            : "0%",
                    },
                  ]}
                />
              </View>
            ))}
          </View>

          {/* Header */}
          <View style={styles.storyHeader}>
            <View style={styles.storyHeaderUser}>
              <View style={styles.storyAvatar}>
                <Text style={styles.storyAvatarText}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </Text>
              </View>
              <Text style={styles.storyUserName}>{user?.name}</Text>
            </View>
            <TouchableOpacity onPress={() => setStoryOpen(false)}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Image */}
          <View style={styles.storyImageWrap}>
            {mySnaps[storyIdx]?.image_url && (
              <Image
                source={{ uri: mySnaps[storyIdx].image_url }}
                style={styles.storyImage}
                resizeMode="contain"
              />
            )}
          </View>

          {/* Caption */}
          {mySnaps[storyIdx]?.caption ? (
            <View style={styles.storyCaptionWrap} pointerEvents="none">
              <Text style={styles.storyCaptionText}>
                {mySnaps[storyIdx].caption}
              </Text>
            </View>
          ) : null}

          {/* Tap zones */}
          <Pressable style={styles.storyTapLeft} onPress={goPrev} />
          <Pressable style={styles.storyTapRight} onPress={goNext} />
        </View>
      </Modal>
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
  profileCard: {
    backgroundColor: Colors.light.surface,
    margin: 16,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarLetter: {
    color: Colors.light.surface,
    fontWeight: "800",
    fontSize: 28,
  },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.light.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.light.muted,
    marginBottom: 16,
  },
  snapActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
  },
  snapBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  snapBtnText: {
    color: Colors.light.primary,
    fontWeight: "600",
    fontSize: 12,
  },
  uploadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  uploadingText: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  uploadErrorText: {
    fontSize: 12,
    color: "#EF4444",
    marginBottom: 8,
    textAlign: "center",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginTop: 4,
  },
  logoutText: {
    color: "#EF4444",
    fontWeight: "600",
    fontSize: 13,
  },
  guestCard: {
    backgroundColor: Colors.light.surface,
    margin: 16,
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.light.text,
    marginTop: 8,
    marginBottom: 6,
  },
  guestText: {
    fontSize: 13,
    color: Colors.light.muted,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  loginBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loginBtnText: {
    color: Colors.light.surface,
    fontWeight: "700",
    fontSize: 14,
  },
  snapsSection: {
    backgroundColor: Colors.light.surface,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  snapsSectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: Colors.light.muted,
    marginBottom: 10,
  },
  snapsRow: {
    gap: 14,
  },
  snapRingWrap: {
    alignItems: "center",
  },
  snapRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 3,
    backgroundColor: Colors.light.primary,
  },
  snapRingViewed: {
    backgroundColor: Colors.light.border,
  },
  snapRingInner: {
    flex: 1,
    borderRadius: 30,
    padding: 2,
    backgroundColor: Colors.light.surface,
  },
  snapThumb: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
  },
  tabHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginVertical: 12,
    gap: 12,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 6,
  },
  activeTabBtn: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.accentSoft,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.muted,
  },
  activeTabText: {
    color: Colors.light.primary,
  },
  emptyFeed: {
    padding: 30,
    alignItems: "center",
  },
  emptyFeedText: {
    color: Colors.light.muted,
    fontSize: 14,
  },
  // Story modal
  storyBackdrop: {
    flex: 1,
    backgroundColor: "#000",
  },
  storyProgressRow: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    gap: 4,
    zIndex: 5,
  },
  storyProgressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.35)",
    overflow: "hidden",
  },
  storyProgressFill: {
    height: "100%",
    backgroundColor: "#fff",
  },
  storyHeader: {
    position: "absolute",
    top: 28,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 5,
  },
  storyHeaderUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  storyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  storyAvatarText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  storyUserName: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  storyImageWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  storyImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
  storyCaptionWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 24,
  },
  storyCaptionText: {
    color: "#fff",
    fontSize: 13,
  },
  storyTapLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "35%",
    height: "100%",
  },
  storyTapRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "65%",
    height: "100%",
  },
});
