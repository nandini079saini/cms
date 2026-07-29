import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axiosInstance";

export default function useVisitTracker() {
  const location = useLocation();

  useEffect(() => {
    const customer = JSON.parse(localStorage.getItem("cms_user") || "null");
    if (!customer?.id) return;

    let page = null;

    switch (location.pathname) {
      case "/profile":
        page = "Profile";
        break;

      case "/new-post":
        page = "New Post";
        break;

      case "/login":
        page = "Login";
        break;

      default:
        return;
    }

    api
      .post("/api/visit", {
        visitor_id: customer.id,
        page,
        category: null,
        post_id: null,
      })
      .catch(() => {});
  }, [location.pathname]);
}
