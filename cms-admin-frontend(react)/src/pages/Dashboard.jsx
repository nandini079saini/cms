import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const CAT_ICONS = {
  technology: "computer",
  politics: "account_balance",
  sports: "emoji_events",
  business: "trending_up",
  environment: "air",
  entertainment: "movie",
  health: "favorite",
};

const badge = {
  published: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 9px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    background: "rgba(52,211,153,0.12)",
    color: "var(--success)",
  },
  draft: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 9px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    background: "rgba(251,191,36,0.12)",
    color: "var(--warn)",
  },
  scheduled: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 9px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    background: "rgba(108,99,255,0.15)",
    color: "var(--accent2)",
  },
};

function getBadge(status) {
  return badge[status] || badge.draft;
}
function cap(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}
function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const API = "http://localhost:3000/api";

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [posts, setPosts] = useState([]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/stats`);
      const data = await res.json();
      setStats(data);
    } catch {}
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API}/posts`);
      const data = await res.json();
      if (data.success) setPosts(data.posts.slice(0, 5));
    } catch {}
  };

  const deletePost = async (id) => {
    if (!confirm("Delete this post?")) return;
    try {
      const res = await fetch(`${API}/posts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) fetchPosts();
    } catch {
      alert("Could not delete post.");
    }
  };

  useEffect(() => {
    fetchStats();
    fetchPosts();

    const interval = setInterval(fetchStats, 1000);
    return () => clearInterval(interval);
  }, []);
  const QS_ITEMS = [
    {
      icon: "check_circle",
      label: "Published Posts",
      value: stats.published,
      color: "var(--success)",
    },
    {
      icon: "edit_note",
      label: "Drafts",
      value: stats.drafts,
      color: "var(--warn)",
    },
    {
      icon: "schedule",
      label: "Scheduled",
      value: stats.scheduled,
      color: "var(--accent2)",
    },
    { icon: "image", label: "Media Files", value: "—", color: "var(--text)" },
    {
      icon: "mark_chat_unread",
      label: "Pending Comments",
      value: "—",
      color: "var(--danger)",
    },
  ];

  return (
    <>
      <Sidebar />
      <div
        style={{
          marginLeft: "var(--sidebar-w)",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Topbar title="Dashboard" />

        {/* Main content  */}
        <div style={{ padding: 28, flex: 1 }}>
          {/* Stat cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
              marginBottom: 28,
            }}
          >
            {[
              { label: "Total Posts", value: stats.total },
              { label: "Viewers", value: stats.viewers },
              { label: "Comments", value: "—" },
              { label: "Active Users", value: stats.users },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 20,
                  transition: "border-color 0.2s",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    fontWeight: 500,
                    marginBottom: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "var(--text)",
                  }}
                >
                  {value ?? "—"}
                </div>
              </div>
            ))}
          </div>

          {/* Two-column grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 340px",
              gap: "20px",
            }}
          >
            {/* Recent Posts table */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "18px 20px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--text)",
                  }}
                >
                  Recent Posts
                </span>
                <Link
                  to="/post"
                  style={{
                    fontSize: 12,
                    color: "var(--accent2)",
                    cursor: "pointer",
                    textDecoration: "none",
                  }}
                >
                  View all →
                </Link>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Title", "Status", "Author", "Date", ""].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.8px",
                          color: "var(--accent2)",
                          padding: "12px 20px",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {posts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          textAlign: "center",
                          padding: 30,
                          color: "var(--muted)",
                          fontSize: 13,
                        }}
                      >
                        No posts yet.{" "}
                        <Link
                          to="/new-post"
                          style={{ color: "var(--accent2)" }}
                        >
                          Create one →
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr key={post.id} style={{ cursor: "pointer" }}>
                        <td
                          style={{
                            padding: "14px 20px",
                            borderBottom: "1px solid var(--border)",
                            verticalAlign: "middle",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <span
                              className="material-icons"
                              style={{
                                fontSize: 16,
                                color: "#888",
                                flexShrink: 0,
                              }}
                            >
                              {CAT_ICONS[post.category] || "article"}
                            </span>
                            <div>
                              <div
                                style={{
                                  fontWeight: 500,
                                  fontSize: 13,
                                  color: "var(--text)",
                                  marginBottom: 2,
                                }}
                              >
                                {post.title}
                              </div>
                              <div
                                style={{ fontSize: 11, color: "var(--muted)" }}
                              >
                                {post.category || "Uncategorized"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "14px 20px",
                            borderBottom: "1px solid var(--border)",
                            verticalAlign: "middle",
                          }}
                        >
                          <span style={getBadge(post.status)}>
                            ● {cap(post.status)}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "14px 20px",
                            borderBottom: "1px solid var(--border)",
                            verticalAlign: "middle",
                            color: "var(--muted)",
                            fontSize: 13,
                          }}
                        >
                          {post.author || "—"}
                        </td>
                        <td
                          style={{
                            padding: "14px 20px",
                            borderBottom: "1px solid var(--border)",
                            verticalAlign: "middle",
                            color: "var(--muted)",
                            fontSize: 12,
                          }}
                        >
                          {formatDate(post.created_at)}
                        </td>
                        <td
                          style={{
                            padding: "14px 20px",
                            borderBottom: "1px solid var(--border)",
                            verticalAlign: "middle",
                          }}
                        >
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                padding: "4px 10px",
                                borderRadius: 6,
                                border: `1px solid var(--border)`,
                                background: "var(--surface2)",
                                color: "var(--muted)",
                                cursor: "pointer",
                                fontFamily: "Inter, sans-serif",
                              }}
                              onClick={() =>
                                (window.location.href = `/new-post?id=${post.id}`)
                              }
                            >
                              Edit
                            </button>
                            <button
                              style={{
                                background: "none",
                                border: `1px solid var(--border)`,
                                borderRadius: 6,
                                padding: "4px 10px",
                                fontSize: 11,
                                fontWeight: 600,
                                color: "var(--danger)",
                                cursor: "pointer",
                                fontFamily: "Inter, sans-serif",
                              }}
                              onClick={() => deletePost(post.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Right sidebar column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Content Overview */}
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "18px 20px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    Content Overview
                  </span>
                </div>

                {QS_ITEMS.map(({ icon, label, value, color }, i) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "11px 20px",
                      borderBottom:
                        i === QS_ITEMS.length - 1
                          ? "none"
                          : "1px solid var(--border)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        className="material-icons"
                        style={{ fontSize: 15, color: "#888" }}
                      >
                        {icon}
                      </span>
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: color || "var(--text)",
                      }}
                    >
                      {value ?? "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
