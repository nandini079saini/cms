import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllPosts } from "../api/posts";
import PostCard from "../components/PostCard";

const API = "http://localhost:3000/api";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [apiCategories, setApiCategories] = useState([]);

  useEffect(() => {
    fetch(API + "/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setApiCategories(d.categories);
      })
      .catch(() => {});
  }, []);

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

  const categories = ["All", ...apiCategories.map((c) => c.name.toLowerCase())];

  const filtered =
    activeCategory === "All"
      ? published
      : published.filter((p) => p.category?.toLowerCase() === activeCategory);

  const categoryGifs = {
    all: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWp1Mmd1am5hZzFjZXJtZjlleHBkd2ZubzFpNmZ4YW1icXlhbnczdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/j6ymVVEawon1Kuqchm/giphy.gif",

    ...apiCategories.reduce((acc, c) => {
      if (c.gif_url) acc[c.name.toLowerCase()] = c.gif_url;
      return acc;
    }, {}),
  };

  return (
    <main style={{ background: "#fff", minHeight: "100vh" }}>
      <div
        style={{
          background:
            "linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)",
          padding: "3.5rem 1.5rem 3rem",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <h1
          style={{
            fontWeight: 700,
            fontSize: "clamp(1.9rem, 5vw, 3rem)",
            lineHeight: 1.15,
            margin: "0 0 0.75rem",
            letterSpacing: "-0.02em",
          }}
        >
          Discover amazing stories
        </h1>
        <p
          style={{
            fontSize: "1rem",
            opacity: 0.88,
            maxWidth: "440px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          {published.length} published{" "}
          {published.length === 1 ? "article" : "articles"} — reporting, essays
          and ideas.
        </p>
      </div>

      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#fff",
          borderBottom: "1px solid #ebebeb",
          padding: "0.5rem 2rem",
          overflowX: "auto",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          scrollbarWidth: "none",
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.9rem 1.2rem",
              background: "none",
              border: "none",
              borderBottom:
                activeCategory === cat
                  ? "3px solid #222"
                  : "3px solid transparent",
              color: activeCategory === cat ? "#da1919" : "#717171",
              fontWeight: activeCategory === cat ? 700 : 500,
              fontSize: "1rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
              textTransform: "capitalize",
              transition: "color 0.15s",
              marginBottom: "-1px",
            }}
          >
            {categoryGifs[cat.toLowerCase()] && (
              <img
                src={categoryGifs[cat.toLowerCase()]}
                alt=""
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
            )}
            {cat}
          </button>
        ))}
      </div>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem 1.5rem 5rem",
        }}
      >
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
