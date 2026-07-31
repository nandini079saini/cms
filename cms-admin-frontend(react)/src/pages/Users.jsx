import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Toast from "../components/Toast";
import { useState, useEffect } from "react";

const API = `${import.meta.env.VITE_API_URL}/api`;
function initials(name) {
  return (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Users() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(API + "/customers");
      const data = await res.json();
      if (data.success) setCustomers(data.customers);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function deleteCustomer(id) {
    if (
      !confirm(
        "Remove this user? They will no longer be able to log in to the site.",
      )
    )
      return;
    try {
      const res = await fetch(API + "/customers/" + id, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setToast({ message: "User removed", type: "success" });
        setCustomers((c) => c.filter((x) => x.id !== id));
      } else {
        setToast({
          message: data.message || "Could not remove user",
          type: "warn",
        });
      }
    } catch {
      setToast({ message: "Could not connect to server", type: "warn" });
    }
  }

  const q = search.toLowerCase();
  const filtered = customers.filter(
    (c) =>
      !q ||
      (c.name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q),
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
          title="Users"
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search users…"
        />

        <div style={{ padding: 28, flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--muted)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                className="material-icons"
                style={{ fontSize: 16, color: "var(--accent2)" }}
              >
                group
              </span>
              Site users (cms-frontend)
            </div>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>
              {!loading &&
                !error &&
                `${filtered.length} user${filtered.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Name", "Email", "Phone", "Joined", ""].map((h) => (
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
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: 30,
                        color: "var(--muted)",
                      }}
                    >
                      Loading users…
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: 30,
                        color: "var(--muted)",
                      }}
                    >
                      Could not reach server.
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
                        group
                      </span>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr
                      key={u.id}
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
                          borderBottom: "1px solid var(--border)",
                          verticalAlign: "middle",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: "50%",
                              background: "var(--surface2)",
                              border: "1px solid var(--border)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 11,
                              fontWeight: 600,
                              color: "var(--text)",
                              flexShrink: 0,
                            }}
                          >
                            {initials(u.name)}
                          </div>
                          <div style={{ fontSize: 13, color: "var(--text)" }}>
                            {u.name}
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          borderBottom: "1px solid var(--border)",
                          color: "var(--muted)",
                          fontSize: 13,
                        }}
                      >
                        {u.email}
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          borderBottom: "1px solid var(--border)",
                          color: "var(--muted)",
                          fontSize: 13,
                        }}
                      >
                        {u.phone || "—"}
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          borderBottom: "1px solid var(--border)",
                          color: "var(--muted)",
                          fontSize: 12,
                        }}
                      >
                        {formatDate(u.created_at)}
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          borderBottom: "1px solid var(--border)",
                          verticalAlign: "middle",
                        }}
                      >
                        <button
                          onClick={() => deleteCustomer(u.id)}
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
                          Remove
                        </button>
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
