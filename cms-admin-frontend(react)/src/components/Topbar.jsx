import { Link } from "react-router-dom";
import { useState } from "react";

export default function Topbar({
  title,
  showSearch = true,
  showNewPost = true,
  showIcons = false,
  backTo,
  actions,
}) {
  const [searchVal, setSearchVal] = useState("");

  return (
    <header
      style={{
        height: 60,
        background: "var(--surface)",
        borderBottom: `1px solid var(--border)`,
        display: "flex",
        alignItems: "center",
        padding: "0 28px",
        gap: 16,
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {backTo && (
        <Link
          to={backTo}
          style={{
            display: "flex",
            alignItems: "center",
            color: "var(--muted)",
            textDecoration: "none",
            marginRight: 4,
          }}
        >
          <span className="material-icons" style={{ fontSize: 20, top: 0 }}>
            arrow_back
          </span>
        </Link>
      )}

      <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>
        {title}
      </span>

      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {showSearch && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "7px 12px",
              width: "220px",
            }}
          >
            <span style={{ fontSize: 16, color: "var(--muted)" }}>
              <span className="material-icons">search</span>
            </span>
            <input
              type="text"
              placeholder="Search..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              style={{
                background: "none",
                border: "none",
                outline: "none",
                color: "var(--text)",
                fontSize: "13px",
                fontFamily: "sans-serif",
                width: "100%",
              }}
            />
          </div>
        )}
        {showIcons && (
          <>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "16px",
                transition: "background 0.15s",
              }}
            >
              <span
                className="material-icons"
                style={{ fontSize: 18, color: "#555" }}
              >
                notifications
              </span>
              <span
                style={{
                  position: "absolute",
                  top: 7,
                  right: 7,
                  width: 7,
                  height: 7,
                  background: "var(--accent)",
                  borderRadius: "50%",
                  border: `2px solid "var(--surface)"`,
                }}
              />
            </div>

            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "16px",
                transition: "background 0.15s",
              }}
            >
              <span
                className="material-icons"
                style={{ fontSize: 18, color: "#555" }}
              >
                dark_mode
              </span>
            </div>
          </>
        )}

        {actions}

        {showNewPost && (
          <Link
            to="/new-post"
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span className="material-icons" style={{ fontSize: 16 }}>
              add
            </span>
            New Post
          </Link>
        )}
      </div>
    </header>
  );
}
