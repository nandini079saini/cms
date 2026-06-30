import { Link } from "react-router-dom";

export default function PostCard({ post }) {
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const media = post.gif_url || post.image_url || null;

  return (
    <Link
      to={`/post/${post.id}`}
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: "12px",
        overflow: "hidden",
        background: "#fff",
        textDecoration: "none",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.12)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "66.66%",
          background: "#f0f0f0",
          borderRadius: "14px",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {media ? (
          <img
            src={media}
            alt={post.title}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f7f7f7",
              color: "#ccc",
              fontSize: "2.5rem",
            }}
          >
            📄
          </div>
        )}

        {post.category && (
          <span
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              background: "rgba(255,255,255,0.92)",
              color: "#222",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              padding: "0.25rem 0.65rem",
              borderRadius: "20px",
              backdropFilter: "blur(4px)",
            }}
          >
            {post.category}
          </span>
        )}
      </div>

      <div
        style={{
          padding: "0.85rem 0.1rem 0.5rem",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "#222",
              fontFamily: "inherit",
            }}
          >
            {post.author || "Unknown"}
          </span>
          <span
            style={{
              fontSize: "0.78rem",
              color: "#717171",
            }}
          >
            {date}
          </span>
        </div>

        <h2
          style={{
            fontFamily: "inherit",
            fontWeight: 400,
            fontSize: "0.88rem",
            lineHeight: 1.4,
            color: "#717171",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            margin: 0,
          }}
        >
          {post.title}
        </h2>

        <p
          style={{
            marginTop: "auto",
            paddingTop: "0.3rem",
            fontSize: "0.82rem",
            color: "#222",
            fontWeight: 600,
            textDecoration: "underline",
            textUnderlineOffset: "3px",
          }}
        >
          Read article
        </p>
      </div>
    </Link>
  );
}
