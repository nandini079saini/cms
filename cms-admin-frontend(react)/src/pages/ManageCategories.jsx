import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Toast from "../components/Toast";

import { useState, useEffect } from "react";

const API = "http://localhost:3000/api";

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [name, setName] = useState("");
  const [gifUrl, setGifUrl] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  function loadCategories() {
    setLoading(true);
    fetch(API + "/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategories(d.categories);
      })
      .catch(() =>
        setToast({ message: "Failed to load categories", type: "warn" }),
      )
      .finally(() => setLoading(false));
  }

  function resetForm() {
    setName("");
    setGifUrl("");
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setToast({ message: "Category name is required", type: "warn" });
      return;
    }

    const payload = { name: name.trim(), gif_url: gifUrl.trim() || null };

    try {
      const res = await fetch(
        editingId ? `${API}/categories/${editingId}` : `${API}/categories`,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (data.success) {
        setToast({
          message: editingId ? "Category updated" : "Category added",
          type: "success",
        });
        resetForm();
        loadCategories();
      } else {
        setToast({
          message: data.message || "Something went wrong",
          type: "warn",
        });
      }
    } catch {
      setToast({ message: "Request failed", type: "warn" });
    }
  }

  function startEdit(cat) {
    setEditingId(cat.id);
    setName(cat.name);
    setGifUrl(cat.gif_url || "");
  }

  async function deleteCategory(id) {
    if (
      !confirm(
        "Delete this category? Posts using it will keep the text but lose the gif.",
      )
    )
      return;
    try {
      const res = await fetch(`${API}/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setCategories((c) => c.filter((x) => x.id !== id));
        setToast({ message: "Category deleted", type: "success" });
        if (editingId === id) resetForm();
      }
    } catch {
      setToast({ message: "Could not delete category", type: "warn" });
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
        <div style={{ padding: 28, flex: 1 }}>
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
            <form
              onSubmit={handleSubmit}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 22,
                width: 320,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  marginBottom: 16,
                }}
              >
                {editingId ? "Edit category" : "Add new category"}
              </div>

              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Category name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. technology"
                style={{
                  width: "100%",
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--text)",
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                  padding: "9px 12px",
                  fontSize: 13,
                  marginBottom: 16,
                }}
              />

              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Giphy URL
              </label>
              <input
                type="text"
                value={gifUrl}
                onChange={(e) => setGifUrl(e.target.value)}
                placeholder="https://media.giphy.com/media/.../giphy.gif"
                style={{
                  width: "100%",
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--text)",
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                  padding: "9px 12px",
                  fontSize: 13,
                  marginBottom: 16,
                }}
              />

              {gifUrl && (
                <div style={{ marginBottom: 16 }}>
                  <img
                    src={gifUrl}
                    alt="preview"
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1px solid var(--border)",
                    }}
                  />
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: "var(--accent)",
                    border: "none",
                    color: "#fff",
                    borderRadius: 8,
                    padding: "9px 12px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {editingId ? "Save changes" : "Add category"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{
                      background: "var(--surface2)",
                      border: "1px solid var(--border)",
                      color: "var(--muted)",
                      borderRadius: 8,
                      padding: "9px 12px",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                flex: 1,
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Gif", "Name", ""].map((h, i) => (
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
                          borderBottom: "1px solid var(--border)",
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
                        colSpan={3}
                        style={{
                          textAlign: "center",
                          padding: 30,
                          color: "var(--muted)",
                        }}
                      >
                        Loading categories…
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        style={{
                          textAlign: "center",
                          padding: 50,
                          color: "var(--muted)",
                        }}
                      >
                        No categories yet. Add your first one.
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat.id}>
                        <td
                          style={{
                            padding: "12px 20px",
                            borderBottom: "1px solid var(--border)",
                            verticalAlign: "middle",
                          }}
                        >
                          {cat.gif_url ? (
                            <img
                              src={cat.gif_url}
                              alt=""
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background: "var(--surface2)",
                                border: "1px solid var(--border)",
                              }}
                            />
                          )}
                        </td>
                        <td
                          style={{
                            padding: "12px 20px",
                            borderBottom: "1px solid var(--border)",
                            verticalAlign: "middle",
                            fontSize: 13,
                            color: "var(--text)",
                            textTransform: "capitalize",
                          }}
                        >
                          {cat.name}
                        </td>
                        <td
                          style={{
                            padding: "12px 20px",
                            borderBottom: "1px solid var(--border)",
                            verticalAlign: "middle",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              justifyContent: "flex-end",
                            }}
                          >
                            <button
                              onClick={() => startEdit(cat)}
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                padding: "4px 10px",
                                borderRadius: 6,
                                border: "1px solid var(--border)",
                                background: "var(--surface2)",
                                color: "var(--muted)",
                                cursor: "pointer",
                                fontFamily: "Inter, sans-serif",
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteCategory(cat.id)}
                              style={{
                                background: "none",
                                border: "1px solid var(--border)",
                                borderRadius: 6,
                                padding: "4px 10px",
                                fontSize: 11,
                                fontWeight: 600,
                                color: "var(--danger)",
                                cursor: "pointer",
                                fontFamily: "Inter, sans-serif",
                              }}
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
