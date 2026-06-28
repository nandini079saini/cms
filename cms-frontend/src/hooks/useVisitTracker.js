import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axiosInstance";

export default function useVisitTracker() {
  const location = useLocation();

  useEffect(() => {
    const customer = JSON.parse(localStorage.getItem("cms_user") || "null");
    if (!customer?.id) return; // not logged in, skip tracking

    api
      .post("/api/visit", {
        visitor_id: customer.id,
        page: location.pathname,
      })
      .catch(() => {});
  }, [location.pathname]);
}
