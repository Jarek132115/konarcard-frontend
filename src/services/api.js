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
  withCredentials: false,
});

/**
 * Request interceptor:
 * - attaches Authorization header unless x-no-auth is set
 * - adds cache-buster to sensitive reads
 *
 * IMPORTANT:
 * Axios v1 uses AxiosHeaders internally. Mutating config.headers like a plain object
 * can silently fail (especially on multipart/form-data POSTs).
 * We normalize headers using axios.AxiosHeaders.from(...).
 */
api.interceptors.request.use((config) => {
  const H = axios.AxiosHeaders
    ? axios.AxiosHeaders.from(config.headers || {})
    : (config.headers || {});

  const xNoAuth =
    (typeof H.get === "function" && (H.get("x-no-auth") || H.get("X-No-Auth"))) ||
    H["x-no-auth"] ||
    H["X-No-Auth"];

  const noAuth =
    xNoAuth === "1" ||
    xNoAuth === 1 ||
    String(xNoAuth || "").toLowerCase() === "true";

  if (!noAuth) {
    let token = "";
    try {
      token = localStorage.getItem("token") || "";
    } catch {
      token = "";
    }

    if (token) {
      if (typeof H.set === "function") H.set("Authorization", `Bearer ${token}`);
      else H.Authorization = `Bearer ${token}`;
    } else {
      if (typeof H.delete === "function") H.delete("Authorization");
      else delete H.Authorization;
    }
  } else {
    if (typeof H.delete === "function") H.delete("Authorization");
    else delete H.Authorization;
  }

  config.headers = H;

  // cache-buster only on sensitive reads
  if (typeof config.url === "string") {
    const u = config.url;
    if (
      u.includes("/profile") ||
      u.includes("/me/orders") ||
      u.includes("/subscription-status")
    ) {
      const sep = u.includes("?") ? "&" : "?";
      config.url = `${u}${sep}ts=${Date.now()}`;
    }
  }

  return config;
});

export default api;
export { BASE_URL };
