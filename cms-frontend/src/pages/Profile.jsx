import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) {
    navigate("/login");
    return null;
  }
  const joined = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";
  const initials = (user.name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const fields = [
    { label: "Full Name", value: user.name || "-" },
    { label: "Email", value: user.email || "-" },
    {
      label: "Contact Number",
      value: user.phone || "Not Provided",
      muted: !user.phone,
    },
    { label: "Member since", value: joined },
  ];
  return (
    <main style={{ background: "#fafafa", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: "640px",
          margin: "0 auto",
          padding: "3rem 1.5rem 5rem",
        }}
      >
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
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.3rem", color: "#222" }}>
              {user.name}
            </div>
            <div
              style={{ fontSize: "0.85rem", color: "#717171", marginTop: 4 }}
            >
              {user.email}
            </div>
          </div>
        </div>

        <div
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

          {fields.map((field, i) => (
            <div
              key={field.label}
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 600,
                marginBottom: "0.4rem",
                borderBottom:
                  i < field.length - 1 ? "1px solid #ebebeb" : "none",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    color: "#a0a0a0",
                    marginBottom: "0.2rem",
                  }}
                >
                  {field.label}
                </div>

                <div
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    color: field.muted ? "#b0b0b0" : "#222",
                    marginBottom: "0.2rem",
                  }}
                >
                  {field.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "1px solid #ddd",
              borderRadius: "999px",
              padding: "0.75rem 1.5rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}
