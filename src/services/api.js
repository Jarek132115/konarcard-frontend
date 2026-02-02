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
 * Helpers to work with both plain header objects and AxiosHeaders
 */
const headerGet = (headers, key) => {
  if (!headers) return undefined;
  if (typeof headers.get === "function") return headers.get(key);
  return headers[key] ?? headers[key.toLowerCase()] ?? headers[key.toUpperCase()];
};

const headerSet = (headers, key, value) => {
  if (!headers) return;
  if (typeof headers.set === "function") headers.set(key, value);
  else headers[key] = value;
};

const headerDel = (headers, key) => {
  if (!headers) return;
  if (typeof headers.delete === "function") headers.delete(key);
  else delete headers[key];
};

const getToken = () => {
  try {
    // ✅ check multiple keys (your project likely uses one of these)
    const candidates = [
      localStorage.getItem("token"),
      localStorage.getItem("authToken"),
      localStorage.getItem("konar_token"),
      localStorage.getItem("jwt"),
    ].filter(Boolean);

    const raw = candidates[0] || "";

    // support storing "Bearer xxx" or just "xxx"
    if (!raw) return "";
    return raw.startsWith("Bearer ") ? raw.slice(7) : raw;
  } catch {
    return "";
  }
};

/**
 * Request interceptor:
 * - attaches Authorization header unless x-no-auth is set
 * - adds cache-buster to sensitive GET reads
 */
api.interceptors.request.use((config) => {
  config.headers = config.headers || {};

  // ✅ Respect no-auth flag
  const noAuthVal =
    headerGet(config.headers, "x-no-auth") ??
    headerGet(config.headers, "X-No-Auth");

  const noAuth =
    noAuthVal === "1" || noAuthVal === 1 || (typeof noAuthVal === "string" && noAuthVal.trim() === "1");

  if (noAuth) {
    headerDel(config.headers, "Authorization");
  } else {
    const token = getToken();
    if (token) headerSet(config.headers, "Authorization", `Bearer ${token}`);
    else headerDel(config.headers, "Authorization");
  }

  // ✅ Only cache-bust GET requests (never POST/PATCH)
  const method = (config.method || "get").toLowerCase();
  if (method === "get" && typeof config.url === "string") {
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
