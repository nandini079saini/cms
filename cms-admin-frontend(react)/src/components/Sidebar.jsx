import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = (name = "") =>
    name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const navItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "9px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    color: "var(--muted)",
    fontWeight: "500",
    textDecoration: "none",
    marginBottom: "2px",
  };

  return (
    <div
      style={{
        width: "var(--sidebar-w)",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "22px 20px 18px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span className="material-icons">edit_note</span>

        <span
          style={{
            fontFamily: '"Lora", serif',
            fontSize: "20px",
            color: "var(--text)",
            letterSpacing: "-0.3px",
          }}
        >
          CMSTesting
        </span>
      </div>

      {/* Links */}
      <div
        style={{
          padding: "20px 12px 6px",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "1.2px",
            color: "var(--muted)",
            padding: "0 8px",
            marginBottom: "6px",
          }}
        >
          Main
        </div>

        <NavLink to="/" style={navItemStyle}>
          <span className="material-icons">dashboard</span>
          Dashboard
        </NavLink>

        <NavLink to="/posts" style={navItemStyle}>
          <span className="material-icons">article</span>
          Posts
        </NavLink>
        <NavLink to="/quick-bites" style={navItemStyle}>
          <span className="material-icons">article</span>
          Quick Bites
        </NavLink>

        <NavLink to="/drafts" style={navItemStyle}>
          <span className="material-icons">edit_note</span>
          Drafts
        </NavLink>

        <NavLink to="/categories" style={navItemStyle}>
          <span className="material-icons">folder</span>
          Categories
        </NavLink>
      </div>

      {/* Manage */}
      <div
        style={{
          padding: "20px 12px 6px",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "1.2px",
            color: "var(--muted)",
            padding: "0 8px",
            marginBottom: "6px",
          }}
        >
          Manage
        </div>

        <NavLink to="/add-admin" style={navItemStyle}>
          <span className="material-icons">group</span>
          Add Admin
        </NavLink>

        <NavLink to="/manage-categories" style={navItemStyle}>
          <span className="material-icons">perm_media</span>
          Add Categories
        </NavLink>

        <NavLink to="/" style={navItemStyle}>
          <span className="material-icons">comment</span>
          Comments
        </NavLink>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "auto",
          padding: "14px 12px",
          borderTop: "1px solid var(--border)",
          fontSize: "13px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 8px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6c63ff, #a78bfa)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "700",
              fontSize: "13px",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {user ? initials(user.name) : "--"}
          </div>

          <div style={{ flex: 1, overflow: "hidden" }}>
            <div
              style={{
                fontWeight: "600",
                fontSize: "13px",
                color: "var(--text)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.name || "Loading..."}
            </div>
            <div style={{ fontSize: "11px", color: "var(--muted)" }}>
              {user?.role
                ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                : "User"}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          style={{
            width: "100%",
            background: "var(--surface2)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "9px 0",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "var(--text)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span className="material-icons" style={{ fontSize: 16 }}>
            logout
          </span>
          Sign Out
        </button>
      </div>
    </div>
  );
}
