import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Toast from "../components/Toast";

const API = "http://localhost:3000/api";

function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cap(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}
function timeAgo(dateStr) {
  if (!dateStr) return "—";

  // mysql2 sometimes returns a Date object, convert to string first
  const str = dateStr instanceof Date ? dateStr.toISOString() : String(dateStr);

  const utcStr =
    str.includes("Z") || str.includes("+") ? str : str.replace(" ", "T") + "Z";

  const date = new Date(utcStr);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
export default function Drafts() {
  const [allDrafts, setAllDrafts] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API + "/posts")
      .then((r) => r.json())
      .then((d) => {
        if (d.success)
          setAllDrafts(d.posts.filter((p) => p.status === "draft"));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function getSorted(drafts) {
    const arr = [...drafts];
    if (sort === "newest")
      arr.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    if (sort === "oldest")
      arr.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
    if (sort === "title") arr.sort((a, b) => a.title.localeCompare(b.title));
    return arr;
  }

  const filtered = getSorted(
    allDrafts.filter((p) => {
      const q = search.toLowerCase();
      return (
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
      );
    }),
  );

  async function publishDraft(id) {
    if (!confirm("Publish this draft now?")) return;
    const res = await fetch(API + "/posts/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" }),
    });
    const data = await res.json();
    if (data.success) {
      setAllDrafts((d) => d.filter((p) => p.id !== id));
      setToast({ message: "Post published successfully!", type: "success" });
    }
  }

  async function deleteDraft(id) {
    if (!confirm("Delete this draft permanently?")) return;
    const res = await fetch(API + "/posts/" + id, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setAllDrafts((d) => d.filter((p) => p.id !== id));
      setToast({ message: "Draft deleted.", type: "draft" });
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
        <Topbar title="Drafts" />

        <div style={{ padding: 28, flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>
                {filtered.length} draft{filtered.length !== 1 ? "s" : ""}
              </span>
              <input
                type="text"
                placeholder="Search drafts…"
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
                  width: 180,
                  padding: "6px 12px",
                  fontSize: 12,
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>
                Sort by
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{
                  background: "var(--surface2)",
                  border: `1px solid var(--border)`,
                  color: "var(--text)",
                  padding: "5px 10px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="title">Title A–Z</option>
              </select>
            </div>
          </div>

          <div
            style={{
              background: "var(--surface)",
              border: `1px solid var(--border)`,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* Info bar */}
            <div
              style={{
                fontSize: 13,
                color: "var(--muted)",
                padding: "10px 20px",
                borderBottom: `1px solid var(--border)`,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                className="material-icons"
                style={{ fontSize: 15, color: "var(--warn)" }}
              >
                info
              </span>
              Drafts are only visible to you — they are not published to the
              site yet.
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "Title",
                    "Category",
                    "Words",
                    "Author",
                    "Last Edited",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        color: "var(--muted)",
                        padding: "12px 20px",
                        borderBottom: `1px solid var(--border)`,
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
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        padding: 30,
                        color: "var(--muted)",
                      }}
                    >
                      Loading drafts…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div
                        style={{
                          textAlign: "center",
                          padding: "70px 20px",
                          color: "var(--muted)",
                        }}
                      >
                        <span
                          className="material-icons"
                          style={{
                            fontSize: 52,
                            display: "block",
                            marginBottom: 14,
                            color: "var(--border)",
                          }}
                        >
                          edit_note
                        </span>
                        <h3
                          style={{
                            fontSize: 16,
                            color: "var(--text)",
                            marginBottom: 8,
                          }}
                        >
                          No drafts found
                        </h3>
                        <p style={{ fontSize: 13, marginBottom: 20 }}>
                          Posts you save as drafts will appear here.
                        </p>
                        <a
                          href="/new-post"
                          style={{
                            background: "var(--accent)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 16px",
                            textDecoration: "none",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "Inter, sans-serif",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span
                            className="material-icons"
                            style={{ fontSize: 16 }}
                          >
                            add
                          </span>{" "}
                          Start a new post
                        </a>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((post) => {
                    const excerpt = stripHtml(
                      post.excerpt || post.content || "",
                    ).substring(0, 80);
                    return (
                      <tr
                        key={post.id}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "var(--surface2)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <td
                          style={{
                            padding: "14px 20px",
                            borderBottom: `1px solid var(--border)`,
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
                              style={{ fontSize: 16, color: "#888" }}
                            >
                              draft
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
                                style={{
                                  fontSize: 11,
                                  color: "var(--muted)",
                                  marginTop: 3,
                                  maxWidth: 340,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {excerpt ? excerpt + "…" : "No content yet"}
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
                          {timeAgo(post.updated_at || post.created_at)}
                        </td>
                        <td
                          style={{
                            padding: "14px 20px",
                            borderBottom: `1px solid var(--border)`,
                            verticalAlign: "middle",
                          }}
                        >
                          <div style={{ display: "flex", opacity: 1, gap: 6 }}>
                            <a
                              href={`/new-post?id=${post.id}`}
                              style={{
                                background: "var(--surface2)",
                                border: `1px solid var(--border)`,
                                borderRadius: 6,
                                padding: "4px 10px",
                                fontSize: 11,
                                fontWeight: 600,
                                color: "var(--muted)",
                                cursor: "pointer",
                                fontFamily: "Inter, sans-serif",
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <span
                                className="material-icons"
                                style={{ fontSize: 13 }}
                              >
                                edit
                              </span>{" "}
                              Continue
                            </a>
                            <button
                              style={{
                                background: "rgba(52, 211, 153, 0.1)",
                                border: "1px solid var(--success)",
                                borderRadius: 6,
                                padding: "4px 10px",
                                fontSize: 11,
                                fontWeight: 600,
                                color: "var(--success)",
                                cursor: "pointer",
                                fontFamily: "Inter, sans-serif",
                              }}
                              onClick={() => publishDraft(post.id)}
                            >
                              Publish
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
                              onClick={() => deleteDraft(post.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
