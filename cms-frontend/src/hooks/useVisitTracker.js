import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axiosInstance";

const TRACKED_PAGES = {
  "/profile": "Profile",
  "/new-post": "New Post",
  "/login": "Login",
};

export default function useVisitTracker() {
  const location = useLocation();

  useEffect(() => {
    const customer = JSON.parse(localStorage.getItem("cms_user") || "null");
    if (!customer?.id) return;

    const page = TRACKED_PAGES[location.pathname];
    if (!page) return;

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
