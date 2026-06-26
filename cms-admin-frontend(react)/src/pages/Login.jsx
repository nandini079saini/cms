import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function doLogin() {
    setError("");
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
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {
        setError("Invalid email or password.");
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
      {/* card */}
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
          Sign in to your account
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
              onKeyDown={(e) => e.key === "Enter" && doLogin()}
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
      </div>
    </div>
  );
}
