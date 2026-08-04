import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { getAllPosts } from "../../src/api/posts";
import { Header } from "../../src/components/Header";
import { PostCard } from "../../src/components/PostCard";
import { useAuth } from "../../src/context/AuthContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, bookmarks, likedPosts } = useAuth();
  const [activeTab, setActiveTab] = useState("bookmarks");

  const { data: postsData } = useQuery({
    queryKey: ["posts"],
    queryFn: getAllPosts,
  });

  const allPosts = postsData?.posts || [];
  const bookmarkedPostsList = allPosts.filter((p) => bookmarks.includes(p.id));
  const likedPostsList = allPosts.filter((p) => likedPosts.includes(p.id));

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
              <Text style={styles.avatarLetter}>
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>

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
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
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
});
