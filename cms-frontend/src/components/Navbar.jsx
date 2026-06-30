import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav
      style={{
        background: "#fff",
        borderBottom: "1px solid #ebebeb",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1.5rem",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            textDecoration: "none",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: "1.2rem",
              color: "var(--accent)",
              letterSpacing: "-0.01em",
            }}
          >
            CMSTesting{" "}
          </span>{" "}
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {user ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <button
                onClick={() => navigate("/profile")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "24px",
                  padding: "0.35rem 0.75rem",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {(user.name || "U")
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>

                <span
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#222",
                  }}
                >
                  Profile
                </span>
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                style={{
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "24px",
                  padding: "0.55rem 1rem",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#222",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{}} onClick={() => navigate("/login")}></div>
          )}
        </div>
      </div>
    </nav>
  );
}
