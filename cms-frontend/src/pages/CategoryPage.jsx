import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllPosts } from "../api/posts";
import PostCard from "../components/PostCard";
import CategoryTabs from "../components/CategoryTabs";

export default function CategoryPage() {
  const { categoryName } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["posts"],
    queryFn: getAllPosts,
    staleTime: 0,
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
        Failed to load posts.
      </div>
    );

  const published = (data?.data?.posts || []).filter(
    (p) => p.status === "published",
  );
  const filtered = published.filter(
    (p) => p.category?.toLowerCase() === categoryName?.toLowerCase(),
  );

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <CategoryTabs activeCategory={categoryName || "All"} />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem 1.5rem 5rem",
        }}
      >
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.85rem",
            color: "#717171",
            marginBottom: "1rem",
          }}
        >
          <Link to="/" style={{ color: "#717171" }}>
            Home
          </Link>
          <span>/</span>
          <span
            style={{
              color: "#222",
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {categoryName}
          </span>
        </nav>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.8rem",
            fontWeight: 700,
            textTransform: "capitalize",
            margin: "0 0 1.5rem",
          }}
        >
          {categoryName}
        </h1>

        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "5rem",
              color: "#717171",
              fontSize: "0.95rem",
            }}
          >
            No posts in this category yet.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "2rem 1.5rem",
            }}
          >
            {filtered.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
