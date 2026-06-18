/**
 * src/utils/api.js
 * ────────────────
 * WHY THIS FILE IS NEEDED (NEW):
 *   Centralises the base URL and auth headers so every page doesn't
 *   hard-code "http://127.0.0.1:8000".  Change VITE_API_URL in .env
 *   and every call updates automatically.
 *
 *   The response interceptor catches 401s globally and redirects to
 *   /login so you never get a silent auth failure.
 */

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

// Global 401 → redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("admin");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;