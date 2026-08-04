import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { Colors } from "../../constants/theme";

export const CommentSection = ({ postId }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([
    {
      id: 1,
      user_name: "Alex Johnson",
      comment: "Insightful read! Thanks for sharing.",
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      user_name: "Sarah Connor",
      comment: "Loved the key takeaways in this article.",
      created_at: new Date().toISOString(),
    },
  ]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const added = {
      id: Date.now(),
      user_name: user?.name || "Anonymous Reader",
      comment: newComment.trim(),
      created_at: new Date().toISOString(),
    };
    setComments([added, ...comments]);
    setNewComment("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comments ({comments.length})</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={user ? "Add a comment..." : "Log in to comment..."}
          placeholderTextColor={Colors.light.muted}
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, !newComment.trim() && styles.disabledSendBtn]}
          onPress={handleAddComment}
          disabled={!newComment.trim()}
        >
          <Ionicons name="send" size={18} color={Colors.light.surface} />
        </TouchableOpacity>
      </View>

      <View style={styles.commentsList}>
        {comments.map((item) => (
          <View key={item.id} style={styles.commentCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>
                {item.user_name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.commentBody}>
              <View style={styles.commentHeader}>
                <Text style={styles.authorName}>{item.user_name}</Text>
                <Text style={styles.commentTime}>Just now</Text>
              </View>
              <Text style={styles.commentText}>{item.comment}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.light.text,
    maxHeight: 80,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledSendBtn: {
    backgroundColor: Colors.light.muted,
  },
  commentsList: {
    gap: 16,
  },
  commentCard: {
    flexDirection: "row",
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.accentSoft2,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetter: {
    color: Colors.light.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  commentBody: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 12,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  authorName: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.text,
  },
  commentTime: {
    fontSize: 11,
    color: Colors.light.muted,
  },
  commentText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
});
