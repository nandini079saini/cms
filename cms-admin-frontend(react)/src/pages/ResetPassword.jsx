import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API = `${import.meta.env.VITE_API_URL}/api`;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function doReset() {
    setError("");
    setSuccess("");
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(API + "/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Password reset successful. Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch {
      setError("Could not connect to server. Make sure it's running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          width: 420,
          background: "var(--surface)",
          border: `1px solid var(--border)`,
          borderRadius: 20,
          padding: "36px 36px 32px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 6,
          }}
        >
          <span
            className="material-icons"
            style={{ fontSize: 28, color: "var(--accent)" }}
          >
            edit_note
          </span>
          <h1
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            CMSTesting
          </h1>
        </div>

        <p
          style={{
            fontSize: 13,
            color: "var(--muted)",
            marginBottom: 28,
            paddingBottom: 24,
            borderBottom: `1px solid var(--border)`,
          }}
        >
          Reset your password
        </p>

        {error && (
          <div
            style={{
              background: "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.3)",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 12,
              color: "var(--danger)",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span className="material-icons" style={{ fontSize: 16 }}>
              error_outline
            </span>
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              background: "rgba(52,211,153,0.1)",
              border: "1px solid rgba(52,211,153,0.3)",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 12,
              color: "#34d399",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span className="material-icons" style={{ fontSize: 16 }}>
              check_circle_outline
            </span>
            {success}
          </div>
        )}

        {!token ? (
          <p style={{ color: "var(--danger)", fontSize: 13 }}>Invalid or missing token.</p>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  color: "var(--muted)",
                  marginBottom: 7,
                }}
              >
                New Password
              </label>

              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--muted)",
                    pointerEvents: "none",
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 17 }}>
                    lock_outline
                  </span>
                </span>

                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: "100%",
                    background: "var(--surface2)",
                    border: `1px solid var(--border)`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    paddingLeft: 40,
                    fontSize: 13,
                    color: "var(--text)",
                    fontFamily: "Inter, sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  color: "var(--muted)",
                  marginBottom: 7,
                }}
              >
                Confirm Password
              </label>

              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--muted)",
                    pointerEvents: "none",
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 17 }}>
                    lock_outline
                  </span>
                </span>

                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: "100%",
                    background: "var(--surface2)",
                    border: `1px solid var(--border)`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    paddingLeft: 40,
                    fontSize: 13,
                    color: "var(--text)",
                    fontFamily: "Inter, sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <button
              style={{
                width: "100%",
                justifyContent: "center",
                marginTop: 8,
                padding: 11,
                fontSize: 14,
                borderRadius: 9,
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                opacity: loading ? 0.7 : 1,
              }}
              onClick={doReset}
              disabled={loading}
            >
              <span className="material-icons" style={{ fontSize: 17 }}>
                lock_reset
              </span>
              {loading ? "Resetting…" : "Reset Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
