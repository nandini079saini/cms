import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Toast from "../components/Toast";

import { useState, useEffect, useRef } from "react";

const API = "http://localhost:3000/api";

function cap(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}
function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Categories() {
  const [filter, setFilter] = useState("all");
  const [allPosts, setAllPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [toast, setToast] = useState(null);
  const dragSrc = useRef(null);

  useEffect(() => {
    fetch(API + "/posts")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setAllPosts(d.posts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = allPosts.filter((p) => {
    const matchFilter = filter === "all" || p.category === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  useEffect(() => {
    fetch(API + "/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategories(d.categories.map((c) => c.name));
      })
      .catch(() => {});
  }, []);

  async function deletePost(id) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    const res = await fetch(API + "/posts/" + id, { method: "DELETE" });
    const data = await res.json();
    if (data.success) setAllPosts((p) => p.filter((x) => x.id !== id));
  }

  function handleDragStart(e, idx) {
    dragSrc.current = idx;
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDrop(e, idx) {
    e.preventDefault();
    if (dragSrc.current === null || dragSrc.current === idx) return;
    const arr = [...allPosts];
    const [moved] = arr.splice(dragSrc.current, 1);
    arr.splice(idx, 0, moved);
    setAllPosts(arr);
    dragSrc.current = null;
    saveOrder(arr);
  }

  async function saveOrder(posts) {
    try {
      const res = await fetch(API + "/posts/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: posts.map((p) => p.id) }),
      });
      const data = await res.json();
      if (data.success)
        setToast({ message: "Priority updated", type: "success" });
    } catch {
      setToast({ message: "Could not save priority", type: "warn" });
    }
  }

  return (
    <div style={{ display: "flex" }}>
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
        <Topbar title="Categories" />
        {/* main content */}
        <div style={{ padding: 28, flex: 1 }}>
          {/* header- filters */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            {/* individual filter bar */}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {categories.map((f) => (
                <button
                  key={f}
                  style={{
                    background:
                      filter === f
                        ? "rgba(108,99,255,0.15)"
                        : "var(--surface2)",
                    border: `1px solid ${
                      filter === f ? "var(--accent)" : "var(--border)"
                    }`,
                    color: filter === f ? "var(--accent2)" : "var(--muted)",
                    padding: "6px 14px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                  }}
                  onClick={() => setFilter(f)}
                >
                  {cap(f === "all" ? "All" : f)}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>
              {filtered.length} post{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <input
              type="text"
              placeholder="Search posts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: "var(--surface2)",
                border: `1px solid var(--border)`,
                borderRadius: 8,
                color: "var(--text)",
                fontFamily: "Inter, sans-serif",
                outline: "none",
                boxSizing: "border-box",
                width: 220,
                padding: "6px 12px",
                fontSize: 12,
              }}
            />
            <span
              style={{
                fontSize: 12,
                color: "var(--muted)",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span className="material-icons" style={{ fontSize: 14 }}>
                drag_indicator
              </span>
              Drag rows to set priority
            </span>
          </div>

          <div
            style={{
              background: "var(--surface)",
              border: `1px solid var(--border)`,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* table */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "",
                    "#",
                    "Title",
                    "Category",
                    "Status",
                    "Author",
                    "Date",
                    "",
                  ].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        color: "var(--muted)",
                        padding: "12px 20px",
                        borderBottom: `1px solid var(--border)`,
                        ...(i < 2 ? { width: 32 } : {}),
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        textAlign: "center",
                        padding: 30,
                        color: "var(--muted)",
                      }}
                    >
                      Loading posts…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        padding: 60,
                        color: "var(--muted)",
                      }}
                    >
                      <span
                        className="material-icons"
                        style={{
                          fontSize: 48,
                          display: "block",
                          marginBottom: 12,
                        }}
                      >
                        folder_open
                      </span>
                      <p style={{ marginBottom: 16 }}>
                        No posts in this category yet.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((post, idx) => (
                    <tr
                      key={post.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, idx)}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--surface2)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                      style={{
                        transition: "background 0.12s",
                        cursor: "default",
                      }}
                    >
                      <td
                        style={{
                          padding: "14px 20px",
                          borderBottom: `1px solid var(--border)`,
                          verticalAlign: "middle",
                        }}
                      >
                        <span
                          style={{
                            cursor: "grab",
                            color: "var(--border)",
                            padding: "0 4px",
                            userSelect: "none",
                          }}
                          title="Drag to reorder"
                        >
                          <span
                            className="material-icons"
                            style={{ fontSize: 20, top: 0 }}
                          >
                            drag_indicator
                          </span>
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          borderBottom: `1px solid var(--border)`,
                          verticalAlign: "middle",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: "var(--surface2)",
                            border: `1px solid var(--border)`,
                            fontSize: 11,
                            fontWeight: 700,
                            color: "var(--muted)",
                          }}
                        >
                          {idx + 1}
                        </span>
                      </td>

                      <td
                        style={{
                          padding: "14px 20px",
                          borderBottom: `1px solid var(--border)`,
                          verticalAlign: "middle",
                        }}
                      >
                        {/* post title cell */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <span
                            className="material-icons"
                            style={{ fontSize: 16, color: "#888" }}
                          >
                            article
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
                              /{post.slug || ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          borderBottom: `1px solid var(--border)`,
                          verticalAlign: "middle",
                          color: "var(--muted)",
                          fontSize: 13,
                        }}
                      >
                        {post.category || "—"}
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          borderBottom: `1px solid var(--border)`,
                          verticalAlign: "middle",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "3px 9px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 600,
                            background:
                              post.status === "published"
                                ? "rgba(52,211,153,0.12)"
                                : post.status === "draft"
                                  ? "rgba(251,191,36,0.12)"
                                  : post.status === "scheduled"
                                    ? "rgba(108,99,255,0.15)"
                                    : "var(--surface2)",
                            color:
                              post.status === "published"
                                ? "var(--success)"
                                : post.status === "draft"
                                  ? "var(--warn)"
                                  : post.status === "scheduled"
                                    ? "var(--accent2)"
                                    : "var(--muted)",
                          }}
                        >
                          ● {cap(post.status)}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          borderBottom: `1px solid var(--border)`,
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
                          borderBottom: `1px solid var(--border)`,
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
                          borderBottom: `1px solid var(--border)`,
                          verticalAlign: "middle",
                        }}
                      >
                        {/* row actions */}
                        <div style={{ display: "flex", gap: 8 }}>
                          {/* row button */}
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
        </div>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  );
}
