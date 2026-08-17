import api from "./axiosInstance";

export const getAllSnaps = async () => {
  const response = await api.get("/api/snaps");
  return response.data;
};

export const uploadSnap = async (formData) => {
  const response = await api.post("/api/snaps", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// customerId is no longer sent — the backend now trusts req.user.id from
// the JWT for both /api/snaps and /api/snaps/:id/react, so a client-
// supplied customer_id would just be ignored server-side. Kept as a
// parameter (unused) so any existing call sites don't need updating.
export const reactToSnap = async (snapId, _customerId, reactionType) => {
  const response = await api.post(`/api/snaps/${snapId}/react`, {
    reaction_type: reactionType,
  });
  return response.data;
};
