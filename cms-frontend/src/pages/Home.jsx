import { useQuery } from "@tanstack/react-query";
import { getAllPosts } from "../api/posts";
import QuickBites from "../components/QuickBites";
import Snaps from "../components/Snaps";
import CategoryTabs from "../components/CategoryTabs";
import PostRow from "../components/PostRow";

export default function Home() {
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

  const categoryNames = [
    ...new Set(published.map((p) => p.category).filter(Boolean)),
  ];

  return (
    <>
      <style>{`
        .quick-layout {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  padding: 2.5rem 1.5rem;
  max-width: 1100px;
  margin: 0 auto;
}

.quick-block {
  flex: 1;
  display: flex;
  justify-content: center; /* horizontal center */
  align-items: center;     /* vertical center */
  min-width: 0;
}



        @media (max-width: 768px) {
          .quick-layout {
            flex-direction: column;
            align-items: center;
            padding: 1.5rem 1rem;
          }
          
        }
      `}</style>

      <main style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <div
          style={{
            background:
              "linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)",
            padding: "3.5rem 1.5rem 3rem",
            textAlign: "center",
            color: "#fff",
            overflowX: "hidden",
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
            {published.length === 1 ? "article" : "articles"} — reporting,
            essays and ideas.
          </p>
        </div>

        <div className="quick-layout">
          <div className="quick-block">
            <Snaps />
          </div>
          <div className="quick-block">
            <QuickBites />
          </div>
        </div>

        <CategoryTabs activeCategory="All" />

        <div style={{ padding: "1.5rem 0 5rem" }}>
          <PostRow title="All Posts" posts={published} />

          {categoryNames.map((cat) => (
            <PostRow
              key={cat}
              title={cat}
              posts={published.filter((p) => p.category === cat)}
            />
          ))}
        </div>
      </main>
    </>
  );
}
