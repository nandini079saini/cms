import { useState } from "react";

export default function LikeComment() {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");
  const [name, setName] = useState("");

  const handleLike = () => {
    setLiked(!liked);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleComment = () => {
    if (!input.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: name.trim() || "Anonymous",
        text: input.trim(),
        time: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setInput("");
  };

  return (
    <div className="mt-12">
      <div className="flex align-centre gap-[1 rem] pb-[1.5 rem] border-b border-[#ebebeb] mb-8">
        <button
          onClick={handleLike}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            background: liked ? "#fff0f2" : "#f7f7f7",
            border: `1px solid ${liked ? "var(--accent)" : "#ddd"}`,
            color: liked ? "var(--accent)" : "#717171",
            padding: "0.5rem 1.1rem",
            borderRadius: "24px",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: 600,
            transition: "all 0.15s",
          }}
        >
          <span style={{ fontSize: "1rem" }}>{liked ? "❤️" : "🤍"}</span>
          {likes} {likes === 1 ? "like" : "likes"}
        </button>

        <span style={{ fontSize: "0.85rem", color: "#717171" }}>
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      <div>
        <h3
          style={{
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "#222",
            marginBottom: "1.25rem",
          }}
        >
          Comments
        </h3>

        <div
          style={{
            border: "1px solid #ebebeb",
            borderRadius: "12px",
            padding: "1rem",
            marginBottom: "1.75rem",
            background: "#fff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            style={{
              width: "100%",
              padding: "0.6rem 0.85rem",
              border: "1px solid #ebebeb",
              borderRadius: "8px",
              fontSize: "0.875rem",
              marginBottom: "0.65rem",
              outline: "none",
              color: "#222",
              background: "#fafafa",
              boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
              placeholder="Share your thoughts…"
              style={{
                flex: 1,
                padding: "0.6rem 0.85rem",
                border: "1px solid #ebebeb",
                borderRadius: "8px",
                fontSize: "0.875rem",
                outline: "none",
                color: "#222",
                background: "#fafafa",
              }}
            />
            <button
              onClick={handleComment}
              style={{
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                padding: "0.6rem 1.25rem",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.85rem",
                whiteSpace: "nowrap",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--accent-dark")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--accent)")
              }
            >
              Post
            </button>
          </div>
        </div>

        {comments.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "2.5rem",
              color: "#717171",
              fontSize: "0.9rem",
              border: "1px dashed #ebebeb",
              borderRadius: "12px",
            }}
          >
            No comments yet. Be the first to comment.
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {comments.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  gap: "0.85rem",
                  padding: "1rem",
                  border: "1px solid #ebebeb",
                  borderRadius: "12px",
                  background: "#fff",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {c.name.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.3rem",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        color: "#222",
                      }}
                    >
                      {c.name}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#b0b0b0" }}>
                      {c.time}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#444",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {c.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
