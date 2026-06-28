import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { customerLogin, customerSignup } from "../api/posts";

const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

export default function Login() {
  const [tab, setTab] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateFields = (fields) => {
    if (fields.email !== undefined && !isValidEmail(fields.email))
      return "Please enter a valid email address.";
    if (fields.password !== undefined && fields.password.length < 8)
      return "Password must be at least 8 characters.";
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const err = validateFields({ email, password });
    if (err) return setError(err);
    try {
      const res = await customerLogin(email, password);
      if (res.data.success) {
        login(res.data.customer);
        navigate("/");
      }
    } catch {
      setError("Invalid email or password");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    const err = validateFields({ email, password });
    if (err) return setError(err);
    try {
      const res = await customerSignup(name, email, phone, password);
      if (res.data.success) {
        setSuccess("Account created! Please log in.");
        setTab("login");
        setName("");
        setEmail("");
        setPhone("");
        setPassword("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "0.8rem 1rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "0.92rem",
    outline: "none",
    color: "#222",
    background: "#fff",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#222",
    marginBottom: "0.4rem",
  };

  return (
    <main
      style={{
        minHeight: "calc(100vh - 64px)",
        background: "#f7f7f7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #ebebeb",
          borderRadius: "16px",
          padding: "2.5rem",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <h1
            style={{
              fontWeight: 700,
              fontSize: "1.35rem",
              color: "#222",
              margin: "0 0 0.25rem",
            }}
          >
            {tab === "login" ? "Log in to CMSTesting" : "Create your account"}
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          <hr
            style={{ flex: 1, border: "none", borderTop: "1px solid #ebebeb" }}
          />
          <span style={{ fontSize: "0.78rem", color: "#717171" }}>
            or continue with email
          </span>
          <hr
            style={{ flex: 1, border: "none", borderTop: "1px solid #ebebeb" }}
          />
        </div>

        <div
          style={{
            display: "flex",
            background: "#f7f7f7",
            borderRadius: "8px",
            padding: "3px",
            marginBottom: "1.5rem",
          }}
        >
          {["login", "signup"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setError("");
                setSuccess("");
              }}
              style={{
                flex: 1,
                padding: "0.5rem",
                borderRadius: "6px",
                border: "none",
                background: tab === t ? "#fff" : "transparent",
                color: tab === t ? "#222" : "#717171",
                fontWeight: tab === t ? 600 : 400,
                fontSize: "0.85rem",
                cursor: "pointer",
                boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.15s",
                textTransform: "capitalize",
              }}
            >
              {t === "login" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>

        {error && (
          <div
            style={{
              background: "#fff0f2",
              color: "var(--accent)",
              border: "1px solid #ffd0d8",
              borderRadius: "8px",
              padding: "0.65rem 1rem",
              fontSize: "0.85rem",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            style={{
              background: "#f0fff8",
              color: "#00a86b",
              border: "1px solid #b3f0d9",
              borderRadius: "8px",
              padding: "0.65rem 1rem",
              fontSize: "0.85rem",
              marginBottom: "1rem",
            }}
          >
            {success}
          </div>
        )}

        {tab === "login" && (
          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label style={labelStyle}>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Min. 8 characters"
                required
                minLength={8}
                style={inputStyle}
              />
            </div>
            <button
              type="submit"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent), var(--accent-dark))",
                color: "#fff",
                border: "none",
                padding: "0.85rem",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.92rem",
                marginTop: "0.25rem",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Log in
            </button>
          </form>
        )}

        {tab === "signup" && (
          <form
            onSubmit={handleSignup}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Your name"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>
                Phone{" "}
                <span style={{ fontWeight: 400, color: "#717171" }}>
                  (optional)
                </span>
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                placeholder="+91 98765 43210"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Min. 8 characters"
                required
                minLength={8}
                style={inputStyle}
              />
            </div>
            <button
              type="submit"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent), var(--accent-dark))",
                color: "#fff",
                border: "none",
                padding: "0.85rem",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.92rem",
                marginTop: "0.25rem",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Create Account
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
