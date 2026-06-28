import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPostById } from "../api/posts";
import LikeComment from "../components/LikeComment";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPostById(id),
  });

  if (isLoading)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "6rem",
          color: "#717171",
          fontSize: "0.9rem",
        }}
      >
        Loading…
      </div>
    );

  if (error)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "6rem",
          color: "var(--accent)",
          fontSize: "0.9rem",
        }}
      >
        404 — Post not found
      </div>
    );

  const post = data?.data?.post;

  const date = post?.published_at
    ? new Date(post.published_at.replace(" ", "T")).toLocaleDateString(
        "en-IN",
        { day: "numeric", month: "long", year: "numeric" },
      )
    : "Not published yet";

  const media = post?.gif_url || post?.image_url || null;

  return (
    <main style={{ background: "#fff", minHeight: "100vh" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          minHeight: "100vh",
        }}
      >
        {/* Left column*/}
        {media && (
          <div
            style={{
              flex: "1 1 480px",
              minWidth: "320px",
              maxWidth: "50%",
              position: "sticky",
              top: 0,
              height: "100vh",
              background: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <img
              src={media}
              alt={post?.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        )}

        {/* Right column*/}
        <div
          style={{
            flex: media ? "1 1 480px" : "1 1 100%",
            minWidth: "320px",
            width: "100%",
            padding: "5.5rem 3rem 5rem",
          }}
        >
          <div
            style={{
              maxWidth: media ? "none" : "760px",
              margin: media ? "0" : "0 auto",
            }}
          >
            <button
              onClick={() => navigate(-1)}
              style={{
                background: "#f5f5f5",
                border: "1px solid #ebebeb",
                color: "#222",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.55rem 1.1rem",
                borderRadius: "999px",
                marginBottom: "1.75rem",
                transition: "background 0.15s ease, transform 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#ebebeb";
                e.currentTarget.style.transform = "translateX(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f5f5f5";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              ← Back to feed
            </button>

            {/* Category */}
            {post?.category && (
              <div
                style={{
                  display: "inline-block",
                  background: "#fff0f2",
                  color: "var(--accent)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "0.3rem 0.75rem",
                  borderRadius: "20px",
                  marginBottom: "1rem",
                }}
              >
                {post.category}
              </div>
            )}

            <h1
              style={{
                fontWeight: 700,
                fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
                color: "#222",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                margin: "0 0 1rem",
              }}
            >
              {post?.title}
            </h1>

            {post?.excerpt && (
              <p
                style={{
                  fontSize: "1.05rem",
                  color: "#717171",
                  lineHeight: 1.7,
                  marginBottom: "1.5rem",
                }}
              >
                {post.excerpt}
              </p>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.85rem",
                paddingTop: "1.25rem",
                paddingBottom: "1.25rem",
                borderTop: "1px solid #ebebeb",
                borderBottom: "1px solid #ebebeb",
                marginBottom: "2.25rem",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1rem",
                  flexShrink: 0,
                }}
              >
                {(post?.author || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "0.92rem",
                    color: "#222",
                  }}
                >
                  {post?.author || "Unknown"}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#717171" }}>
                  {date}
                </div>
              </div>
            </div>

            <div
              style={{
                color: "#222",
                fontSize: "1.05rem",
                lineHeight: 1.9,
              }}
              dangerouslySetInnerHTML={{
                __html:
                  post?.content ||
                  '<p style="color:#717171">No content available.</p>',
              }}
            />

            <LikeComment postId={id} />
          </div>
        </div>
      </div>
    </main>
  );
}
