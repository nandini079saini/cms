import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

// Renders a row of LLM-picked related articles for a given post.
// Usage: <RelatedAI postId={post.id} /> — drop into PostDetail.jsx
// alongside your existing (collaborative-filtering) related posts section.
//
// Previously this used useEffect + useState to manage loading/error state,
// which triggered the react-hooks/set-state-in-effect lint rule (calling
// setState synchronously in an effect body). Since the project already
// depends on @tanstack/react-query, useQuery replaces that manual fetch +
// loading/error/cancel logic entirely — react-query handles loading state,
// error state, request cancellation, and caching for you.
export default function RelatedAI({ postId, limit = 5 }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["related-ai", postId, limit],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/api/posts/${postId}/related-ai?limit=${limit}`,
      );
      return res.data?.related || [];
    },
    enabled: !!postId,
  });

  const related = data || [];

  if (isLoading || isError || related.length === 0) return null;

  return (
    <section style={{ marginTop: "2.5rem" }}>
      <h3
        style={{
          fontSize: "1.1rem",
          fontWeight: 700,
          marginBottom: "1rem",
          color: "var(--text)",
        }}
      >
        Related Content
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1rem",
        }}
      >
        {related.map((post) => (
          <a
            key={post.id}
            href={`/post/${post.slug || post.id}`}
            style={{
              display: "block",
              textDecoration: "none",
              color: "inherit",
              border: "1px solid var(--border)",
              borderRadius: 10,
              overflow: "hidden",
              background: "var(--surface)",
            }}
          >
            {post.gif_url && (
              <img
                src={post.gif_url}
                alt={post.title}
                style={{ width: "100%", height: 120, objectFit: "cover" }}
              />
            )}
            <div style={{ padding: "0.75rem" }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text)",
                  marginBottom: 4,
                  lineHeight: 1.3,
                }}
              >
                {post.title}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                {post.category}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
