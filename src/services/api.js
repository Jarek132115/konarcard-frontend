// frontend/src/services/api.js
import axios from "axios";

/**
 * Canonical backend base URL:
 * - MUST be the ROOT domain (no trailing /api)
 * - Example: https://your-backend.com
 */
const ENV_BASE = (import.meta.env.VITE_API_URL || "").trim();

// fallback if VITE_API_URL is not set
const FALLBACK_BASE =
  "https://konarcard-backend-331608269918.europe-west1.run.app";

function normalizeBase(url) {
  if (!url) return "";
  let u = url.trim();

  // remove trailing slashes
  u = u.replace(/\/+$/, "");

  // if someone set VITE_API_URL="https://x.com/api" remove "/api"
  if (u.endsWith("/api")) u = u.slice(0, -4);

  // remove trailing slashes again
  u = u.replace(/\/+$/, "");

  return u;
}

const BASE_URL = normalizeBase(ENV_BASE) || normalizeBase(FALLBACK_BASE);

const api = axios.create({
  baseURL: BASE_URL,
  // We use Bearer tokens (localStorage), not cookie auth
  withCredentials: false,
});

/**
 * Request interceptor:
 * - attaches Authorization header unless x-no-auth is set
 * - adds cache-buster to sensitive reads
 */
api.interceptors.request.use((config) => {
  const headers = config.headers || {};

  // ✅ If this request is marked as "no auth", do NOT attach Authorization
  const noAuth =
    headers["x-no-auth"] === "1" ||
    headers["X-No-Auth"] === "1" ||
    headers["x-no-auth"] === 1 ||
    headers["X-No-Auth"] === 1;

  if (!noAuth) {
    try {
      const token = localStorage.getItem("token");
      if (token) headers.Authorization = `Bearer ${token}`;
      else delete headers.Authorization;
    } catch {
      delete headers.Authorization;
    }
  } else {
    delete headers.Authorization;
  }

  config.headers = headers;

  // cache-buster only on sensitive reads
  if (typeof config.url === "string") {
    const u = config.url;
    if (u.includes("/profile") || u.includes("/me/orders") || u.includes("/subscription-status")) {
      const sep = u.includes("?") ? "&" : "?";
      config.url = `${u}${sep}ts=${Date.now()}`;
    }
  }

  return config;
});

export default api;
export { BASE_URL };
