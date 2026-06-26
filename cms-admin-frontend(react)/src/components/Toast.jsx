import { useEffect } from "react";

const toastStyle = (type) => {
  const map = {
    success: "#16a34a",
    error: "#dc2626",
    warn: "#b45309",
    draft: "#374151",
    schedule: "#2563eb",
  };

  return {
    position: "fixed",
    top: 24,
    right: 24,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 18px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 500,
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    zIndex: 9999,
    color: "#fff",
    background: map[type] || "#374151",
    animation: "slideIn 0.3s ease",
  };
};

const ICONS = {
  success: "check_circle",
  error: "error",
  warn: "warning",
  draft: "save",
  schedule: "schedule",
};

export default function Toast({ message, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={toastStyle(type)}>
      <span className="material-icons" style={{ fontSize: 18 }}>
        {ICONS[type] || "info"}
      </span>
      <span>{message}</span>
    </div>
  );
}
