import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

const API = "http://localhost:3000/api";

export default function CategoryTabs({ activeCategory = "All" }) {
  const navigate = useNavigate();
  const [apiCategories, setApiCategories] = useState([]);

  useEffect(() => {
    fetch(API + "/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setApiCategories(d.categories);
      })
      .catch(() => {});
  }, []);

  const categories = ["All", ...apiCategories.map((c) => c.name.toLowerCase())];

  const categoryGifs = {
    all: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWp1Mmd1am5hZzFjZXJtZjlleHBkd2ZubzFpNmZ4YW1icXlhbnczdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/j6ymVVEawon1Kuqchm/giphy.gif",
    ...apiCategories.reduce((acc, c) => {
      if (c.gif_url) acc[c.name.toLowerCase()] = c.gif_url;
      return acc;
    }, {}),
  };

  const handleCategoryClick = (cat) => {
    const customer = JSON.parse(localStorage.getItem("cms_user") || "null");
    if (customer?.id) {
      api
        .post("/api/visit", {
          visitor_id: customer.id,
          page: "Home",
          category: cat,
          post_id: null,
        })
        .catch(() => {});
    }
    navigate(cat === "All" ? "/" : `/category/${encodeURIComponent(cat)}`);
  };

  return (
    <div
      style={{
        position: "sticky",
        top: "64px",
        zIndex: 50,
        background: "#fff",
        borderBottom: "1px solid #ebebeb",
        padding: "0.5rem 2rem",
        overflowX: "auto",
        display: "flex",
        gap: "1rem",
        alignItems: "center",
        scrollbarWidth: "none",
      }}
    >
      {categories.map((cat) => {
        const isActive = cat.toLowerCase() === activeCategory.toLowerCase();
        return (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            style={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.9rem 1.2rem",
              background: "none",
              border: "none",
              borderBottom: isActive
                ? "3px solid #222"
                : "3px solid transparent",
              color: isActive ? "#da1919" : "#717171",
              fontWeight: isActive ? 700 : 500,
              fontSize: "1rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
              textTransform: "capitalize",
              transition: "color 0.15s",
              marginBottom: "-1px",
            }}
          >
            {categoryGifs[cat.toLowerCase()] && (
              <img
                src={categoryGifs[cat.toLowerCase()]}
                alt=""
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
            )}
            {cat}
          </button>
        );
      })}
    </div>
  );
}
