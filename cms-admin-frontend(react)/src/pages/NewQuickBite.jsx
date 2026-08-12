import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Toast from "../components/Toast";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { authFetch } from "../api/authFetch";

const API = `${import.meta.env.VITE_API_URL}/api`;
export default function NewQuickBite() {
  const [params] = useSearchParams();
  const biteId = params.get("id");

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [gifUrl, setGifUrl] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (biteId) loadBite(biteId);
  }, [biteId]);

  async function loadBite(id) {
    try {
      // GET /api/quickbites/:id is public, plain fetch is fine here.
      const res = await fetch(API + "/quickbites/" + id);
      const data = await res.json();
      if (!data.success) return;
      const bite = data.quickBite;
      setTitle(bite.title || "");
      setExcerpt(bite.excerpt || "");
      setGifUrl(bite.gif_url || "");
    } catch {}
  }

  function getFormData() {
    return {
      title: title.trim(),
      excerpt: excerpt.trim(),
      gif_url: gifUrl.trim() || null,
    };
  }

  async function submitBite() {
    const data = getFormData();
    if (!data.title) {
      setToast({ message: "Please add a title first.", type: "warn" });
      return;
    }
    if (!data.gif_url) {
      setToast({ message: "Please add a GIF URL first.", type: "warn" });
      return;
    }
    try {
      const url = biteId ? API + "/quickbites/" + biteId : API + "/quickbites";
      const method = biteId ? "PUT" : "POST";
      // POST/PUT /api/quickbites is admin-only now — use authFetch so the
      // JWT goes along, otherwise this 401s.
      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setToast({
          message: biteId ? "Quick bite updated!" : "Quick bite created!",
          type: "success",
        });
      } else {
        setToast({
          message: result.message || "Something went wrong.",
          type: "warn",
        });
      }
    } catch {
      setToast({ message: "Could not connect to server.", type: "warn" });
    }
  }

  const topbarActions = (
    <button
      style={{
        background: "var(--accent)",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "8px 16px",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "Inter, sans-serif",
      }}
      onClick={submitBite}
    >
      <span className="material-icons" style={{ fontSize: 16 }}>
        save
      </span>{" "}
      {biteId ? "Update" : "Publish"}
    </button>
  );

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
          title={biteId ? "Edit Quick Bite" : "New Quick Bite"}
          backTo="/quick-bites"
          showNewPost={false}
          showNewQuickBite={false}
          actions={topbarActions}
        />
        <div style={{ padding: 28 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 320px",
              gap: 24,
              alignItems: "start",
              maxWidth: 900,
            }}
          >
            {/* left: title + excerpt */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}
                >
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Enter a quick bite title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    padding: "14px",
                    background: "var(--surface2)",
                    border: `1px solid var(--border)`,
                    borderRadius: 8,
                    fontSize: 20,
                    fontWeight: 700,
                    color: "var(--text)",
                    width: "100%",
                    outline: "none",
                    fontFamily: "Inter, sans-serif",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  Excerpt{" "}
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--muted)",
                      fontWeight: "normal",
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    Short caption shown under the card
                  </span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Write a brief caption for this quick bite…"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  style={{
                    width: "100%",
                    background: "var(--surface2)",
                    border: `1px solid var(--border)`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "var(--text)",
                    fontFamily: "Inter, sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 15 }}>
                    gif
                  </span>
                  GIF URL
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--muted)",
                      fontWeight: "normal",
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    Paste a Giphy or image link
                  </span>
                </label>
                <input
                  type="url"
                  placeholder="https://media.giphy.com/media/.../giphy.gif"
                  value={gifUrl}
                  onChange={(e) => setGifUrl(e.target.value)}
                  style={{
                    width: "100%",
                    background: "var(--surface2)",
                    border: `1px solid var(--border)`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "var(--text)",
                    fontFamily: "Inter, sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* right: live preview, styled like the QuickBites card */}
            <div
              style={{
                background: "var(--surface)",
                border: `1px solid var(--border)`,
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  marginBottom: 14,
                }}
              >
                Preview
              </div>
              <div
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "var(--surface2)",
                  aspectRatio: "3 / 4",
                  position: "relative",
                }}
              >
                {gifUrl.trim() ? (
                  <img
                    src={gifUrl.trim()}
                    alt="GIF preview"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextSibling.style.display = "flex";
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : null}
                <div
                  style={{
                    display: gifUrl.trim() ? "none" : "flex",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    color: "var(--muted)",
                    fontSize: 13,
                    flexDirection: "column",
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 28 }}>
                    broken_image
                  </span>
                  {gifUrl.trim() ? "Could not load image" : "No GIF yet"}
                </div>
              </div>
              <p
                style={{
                  margin: "0.7rem 0 0.2rem",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "var(--text)",
                  textAlign: "center",
                }}
              >
                {title || "Untitled"}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.78rem",
                  color: "var(--muted)",
                  textAlign: "center",
                  lineHeight: 1.4,
                }}
              >
                {excerpt}
              </p>
            </div>
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
