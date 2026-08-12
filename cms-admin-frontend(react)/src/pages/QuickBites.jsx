import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useState, useEffect } from "react";
import { authFetch } from "../api/authFetch";

const API = `${import.meta.env.VITE_API_URL}/api`;
function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function QuickBitesAdmin() {
  const [allBites, setAllBites] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API + "/quickbites")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setAllBites(d.quickBites);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = allBites.filter((b) => {
    const q = search.toLowerCase();
    return (
      !q ||
      b.title.toLowerCase().includes(q) ||
      (b.excerpt || "").toLowerCase().includes(q)
    );
  });

  async function deleteBite(id) {
    if (!confirm("Are you sure you want to delete this quick bite?")) return;
    // DELETE /api/quickbites/:id is admin-only now — needs the JWT.
    const res = await authFetch(API + "/quickbites/" + id, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) setAllBites((b) => b.filter((x) => x.id !== id));
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
        <Topbar
          title="Quick Bites"
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search quick bites…"
        />
        {/* main content */}
        <div style={{ padding: 28, flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: 13, color: "var(--muted)" }}>
              {filtered.length} quick bite{filtered.length !== 1 ? "s" : ""}
            </span>
            <a
              href="/new-quick-bite"
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
              <span className="material-icons" style={{ fontSize: 16 }}>
                add
              </span>
              New Quick Bite
            </a>
          </div>

          <div
            style={{
              background: "var(--surface)",
              border: `1px solid var(--border)`,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["GIF", "Title", "Excerpt", "Date", ""].map((h) => (
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
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: 30,
                        color: "var(--muted)",
                      }}
                    >
                      Loading quick bites…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
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
                        movie
                      </span>
                      <p style={{ marginBottom: 16 }}>No quick bites found.</p>
                      <a
                        href="/new-quick-bite"
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
                        </span>
                        Create your first quick bite
                      </a>
                    </td>
                  </tr>
                ) : (
                  filtered.map((bite) => (
                    <tr
                      key={bite.id}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--surface2)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td
                        style={{
                          padding: "10px 20px",
                          borderBottom: `1px solid var(--border)`,
                          verticalAlign: "middle",
                        }}
                      >
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 8,
                            overflow: "hidden",
                            background: "var(--surface2)",
                          }}
                        >
                          {bite.gif_url && (
                            <img
                              src={bite.gif_url}
                              alt={bite.title}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          )}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          borderBottom: `1px solid var(--border)`,
                          verticalAlign: "middle",
                          fontWeight: 500,
                          fontSize: 13,
                          color: "var(--text)",
                        }}
                      >
                        {bite.title}
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          borderBottom: `1px solid var(--border)`,
                          verticalAlign: "middle",
                          color: "var(--muted)",
                          fontSize: 13,
                          maxWidth: 320,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {bite.excerpt || "—"}
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
                        {formatDate(bite.created_at)}
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          borderBottom: `1px solid var(--border)`,
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
                              (window.location.href = `/new-quick-bite?id=${bite.id}`)
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
                            onClick={() => deleteBite(bite.id)}
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
    </div>
  );
}
