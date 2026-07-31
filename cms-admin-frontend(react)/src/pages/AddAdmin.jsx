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

const inputStyle = {
  width: "100%",
  background: "var(--surface2)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "10px 14px",
  fontSize: 13,
  color: "var(--text)",
  fontFamily: "Inter, sans-serif",
  outline: "none",
  boxSizing: "border-box",
};
const invalidInputStyle = {
  borderColor: "var(--danger)",
  boxShadow: "0 0 0 3px rgba(248,113,113,0.1)",
};
const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--muted)",
  marginBottom: 7,
  textTransform: "uppercase",
  letterSpacing: "0.7px",
};

export default function AddAdmin() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoadingUsers(true);
    setUsersError(false);
    try {
      const res = await fetch(API + "/users");
      const data = await res.json();
      if (data.success) setUsers(data.users);
      else setUsersError(true);
    } catch {
      setUsersError(true);
    } finally {
      setLoadingUsers(false);
    }
  }

  function validate() {
    const fn = firstName.trim();
    const em = email.trim();
    const errs = {
      firstName: !fn,
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em),
      password: password.length < 8,
    };
    setErrors(errs);
    return !errs.firstName && !errs.email && !errs.password;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch(API + "/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: (firstName.trim() + " " + lastName.trim()).trim(),
          email: email.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ message: "User added successfully", type: "success" });
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setErrors({});
        fetchUsers();
      } else {
        setToast({
          message: data.message || "Could not add admin",
          type: "warn",
        });
      }
    } catch (err) {
      setToast({
        message: err.message || "Could not connect to server",
        type: "warn",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteUser(id) {
    if (!confirm("Remove this user? They will no longer be able to log in."))
      return;
    try {
      const res = await fetch(API + "/users/" + id, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setToast({ message: "User removed", type: "success" });
        fetchUsers();
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
        <Topbar title="Add Admin" />

        <div style={{ padding: 28, flex: 1 }}>
          <div style={{ maxWidth: 560 }}>
            {/* form card */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: "28px 32px",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.9px",
                  color: "var(--muted)",
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  className="material-icons"
                  style={{ fontSize: 15, color: "var(--accent2)" }}
                >
                  person_add
                </span>
                New admin account
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 18,
                }}
              >
                <div>
                  <label style={labelStyle}>First name</label>
                  <input
                    type="text"
                    placeholder="Nandini"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={{
                      ...inputStyle,
                      ...(errors.firstName ? invalidInputStyle : {}),
                    }}
                  />
                  {errors.firstName && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--danger)",
                        marginTop: 5,
                      }}
                    >
                      First name is required.
                    </div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Last name</label>
                  <input
                    type="text"
                    placeholder="Saini"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Email address</label>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    ...inputStyle,
                    ...(errors.email ? invalidInputStyle : {}),
                  }}
                />
                {errors.email && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--danger)",
                      marginTop: 5,
                    }}
                  >
                    Enter a valid email address.
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Password must be 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      ...inputStyle,
                      paddingRight: 42,
                      ...(errors.password ? invalidInputStyle : {}),
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--muted)",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: 18 }}>
                      {showPw ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {errors.password && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--danger)",
                      marginTop: 5,
                    }}
                  >
                    Password must be at least 8 characters.
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 24,
                }}
              >
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  style={{
                    background: "var(--accent)",
                    border: "none",
                    borderRadius: 8,
                    padding: "9px 20px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#fff",
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.5 : 1,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  <span
                    className="material-icons"
                    style={{
                      fontSize: 16,
                      animation: submitting
                        ? "spin 0.8s linear infinite"
                        : "none",
                    }}
                  >
                    {submitting ? "sync" : "person_add"}
                  </span>
                  {submitting ? "Adding…" : "Add Admin"}
                </button>
                <a
                  href="/"
                  style={{
                    background: "none",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "9px 18px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--muted)",
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 16 }}>
                    close
                  </span>
                  Cancel
                </a>
              </div>
            </div>

            {/* existing users card */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                overflow: "hidden",
                marginTop: 28,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 24px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text)",
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
                  Existing admins
                </span>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>
                  {!loadingUsers &&
                    !usersError &&
                    `${users.length} user${users.length !== 1 ? "s" : ""}`}
                </span>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Name", "Email", ""].map((h) => (
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
                  {loadingUsers ? (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          textAlign: "center",
                          padding: 28,
                          color: "var(--muted)",
                          fontSize: 13,
                        }}
                      >
                        Loading admins…
                      </td>
                    </tr>
                  ) : usersError ? (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          textAlign: "center",
                          padding: 24,
                          color: "var(--muted)",
                          fontSize: 13,
                        }}
                      >
                        Could not reach server.
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          textAlign: "center",
                          padding: 28,
                          color: "var(--muted)",
                          fontSize: 13,
                        }}
                      >
                        No admins yet.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td
                          style={{
                            padding: "14px 20px",
                            borderBottom: "1px solid var(--border)",
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
                          }}
                        >
                          <button
                            onClick={() => deleteUser(u.id)}
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
