import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const API = `${import.meta.env.VITE_API_URL}/api`;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isForgotView, setIsForgotView] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function doLogin() {
    setError("");
    setSuccess("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        login(data.user, data.token);
        navigate("/");
      } else {
        setError(data.message || "Invalid email or password.");
      }
    } catch {
      setError("Could not connect to server. Make sure it's running.");
    } finally {
      setLoading(false);
    }
  }

  // Kept for when forgot-password is re-enabled — not currently reachable
  // from the UI since the "Forgot Password?" trigger below is commented out.
  async function doForgot() {
    setError("");
    setSuccess("");
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API + "/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message || "Reset link sent to your email.");
      } else {
        setError(data.message || "Failed to send reset link.");
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
          {isForgotView
            ? "Enter your email to reset your password"
            : "Sign in to your account"}
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
            Email
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
                mail_outline
              </span>
            </span>

            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (isForgotView ? doForgot() : doLogin())
              }
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

        {!isForgotView && (
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
              Password
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
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doLogin()}
                style={{
                  width: "100%",
                  background: "var(--surface2)",
                  border: `1px solid var(--border)`,
                  borderRadius: 8,
                  padding: "10px 14px",
                  paddingLeft: 40,
                  paddingRight: 42,
                  fontSize: 13,
                  color: "var(--text)",
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />

              <button
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
                onClick={() => setShowPw((s) => !s)}
              >
                <span className="material-icons" style={{ fontSize: 17 }}>
                  {showPw ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>
        )}

        {isForgotView ? (
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
            onClick={doForgot}
            disabled={loading}
          >
            <span className="material-icons" style={{ fontSize: 17 }}>
              send
            </span>
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
        ) : (
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
            onClick={doLogin}
            disabled={loading}
          >
            <span className="material-icons" style={{ fontSize: 17 }}>
              login
            </span>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        )}

        {/* Forgot-password entry point — disabled for now, not working yet.
        Uncomment when the flow is ready to ship.
        <div style={{ marginTop: 20, textAlign: "center" }}>
          {isForgotView ? (
            <button
              onClick={() => {
                setIsForgotView(false);
                setError("");
                setSuccess("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--accent)",
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Back to Sign In
            </button>
          ) : (
            <button
              onClick={() => {
                setIsForgotView(true);
                setError("");
                setSuccess("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--muted)",
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                textDecoration: "underline",
              }}
            >
              Forgot Password?
            </button>
          )}
        </div>
        */}
      </div>
    </div>
  );
}
