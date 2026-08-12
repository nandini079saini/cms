// Wraps fetch() so every admin API call automatically carries the JWT.
// Use this in place of the bare `fetch(...)` calls throughout the admin
// frontend (Users.jsx, AddAdmin.jsx, post editor, category manager, etc.)

export async function authFetch(url, options = {}) {
  const token = localStorage.getItem("cms_token");

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401) {
    // Token missing/expired/invalid — force back to login.
    localStorage.removeItem("cms_user");
    localStorage.removeItem("cms_token");
    window.location.href = "/login";
  }

  return res;
}
