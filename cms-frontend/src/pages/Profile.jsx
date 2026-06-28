import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const API = "http://localhost:3000/api";

export default function Profile() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");

  // const [currentPassword, setCurrentPassword] = useState("");
  // const [newPassword, setNewPassword] = useState("");
  // const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }

  if (!user) {
    navigate("/login");
    return null;
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage(null);

    // if (newPassword && newPassword !== confirmPassword) {
    //   setMessage({ type: "error", text: "New passwords don't match." });
    //   return;
    // }
    // if (newPassword && !currentPassword) {
    //   setMessage({
    //     type: "error",
    //     text: "Enter your current password to set a new one.",
    //   });
    //   return;
    // }

    setSaving(true);
    try {
      const res = await fetch(`${API}/customers/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          // ...(newPassword ? { currentPassword, newPassword } : {}),
        }),
      });
      const data = await res.json();

      if (data.success) {
        login(data.customer); // keeps context + localStorage + navbar in sync
        setMessage({ type: "success", text: "Profile updated." });
        // setCurrentPassword("");
        // setNewPassword("");
        // setConfirmPassword("");
      } else {
        setMessage({ type: "error", text: data.message || "Update failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{ background: "#fafafa", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: "640px",
          margin: "0 auto",
          padding: "3rem 1.5rem 5rem",
        }}
      >
        {/* Header card */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #ebebeb",
            borderRadius: "16px",
            padding: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "1.25rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "1.6rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {(user.name || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.3rem", color: "#222" }}>
              {user.name}
            </div>
            {/* <div
              style={{ fontSize: "0.85rem", color: "#717171", marginTop: 4 }}
            >
              {user.email}
            </div> */}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              marginBottom: "1.25rem",
              fontSize: "0.85rem",
              fontWeight: 500,
              background: message.type === "success" ? "#eafaf0" : "#fff0f2",
              color: message.type === "success" ? "#1b8a4c" : "var(--accent)",
            }}
          >
            {message.text}
          </div>
        )}

        <form
          onSubmit={handleSave}
          style={{
            background: "#fff",
            border: "1px solid #ebebeb",
            borderRadius: "16px",
            padding: "2rem",
          }}
        >
          <div
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "#a0a0a0",
              marginBottom: "1.25rem",
            }}
          >
            Account details
          </div>

          <Field label="Full name" value={name} onChange={setName} />
          <Field label="Email" type="email" value={email} onChange={setEmail} />
          <Field
            label="Phone"
            value={phone}
            onChange={setPhone}
            placeholder="Optional"
          />

          {/* <div
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "#a0a0a0",
              margin: "2rem 0 1.25rem",
              borderTop: "1px solid #ebebeb",
              paddingTop: "1.75rem",
            }}
          >
            Change password
          </div> */}

          {/* <Field
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="Leave blank if not changing password"
          />
          <Field
            label="New password"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
          />
          <Field
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
          /> */}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                borderRadius: "999px",
                padding: "0.75rem 1.5rem",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: saving ? "default" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              style={{
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "999px",
                padding: "0.75rem 1.5rem",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#222",
                cursor: "pointer",
              }}
            >
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <label
        style={{
          display: "block",
          fontSize: "0.8rem",
          fontWeight: 600,
          color: "#222",
          marginBottom: "0.4rem",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "0.65rem 0.85rem",
          fontSize: "0.9rem",
          border: "1px solid #ddd",
          borderRadius: "8px",
          outline: "none",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}
