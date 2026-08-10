import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        marginTop: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2.5rem 1.5rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "var(--accent)",
            letterSpacing: "-0.01em",
          }}
        >
          WordsOfNADS
        </Link>

        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--muted)",
            margin: 0,
          }}
        >
          © {new Date().getFullYear()} WordsOfNADS.
        </p>
      </div>
    </footer>
  );
}
