// frontend/src/services/api.js
import axios from "axios";

const ENV_BASE = (import.meta.env.VITE_API_URL || "").trim();

const FALLBACK_BASE =
  "https://konarcard-backend-331608269918.europe-west1.run.app";

function normalizeBase(url) {
  if (!url) return "";
  let u = url.trim();
  u = u.replace(/\/+$/, "");
  if (u.endsWith("/api")) u = u.slice(0, -4);
  u = u.replace(/\/+$/, "");
  return u;
}

const BASE_URL = normalizeBase(ENV_BASE) || normalizeBase(FALLBACK_BASE);

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,

  /**
   * ✅ CRITICAL:
   * Do NOT throw on 4xx (especially 401), because the app expects:
   *   res.data.resend === true
   * and then it shows the "Verify email" step.
   *
   * We still throw on 5xx so real server crashes are visible.
   */
  validateStatus: (status) => status >= 200 && status < 500,
});

api.interceptors.request.use((config) => {
  const H = axios.AxiosHeaders
    ? axios.AxiosHeaders.from(config.headers || {})
    : (config.headers || {});

  // ✅ If sending FormData, NEVER allow JSON content-type
  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;

  if (isFormData) {
    // Let browser/axios set boundary. Remove any forced content-type.
    try {
      if (typeof H.delete === "function") {
        H.delete("Content-Type");
        H.delete("content-type");
      } else {
        delete H["Content-Type"];
        delete H["content-type"];
      }
    } catch {
      // ignore
    }
  }

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

    // ✅ match "/profiles" not "/profile"
    if (
      u.includes("/profiles") ||
      u.includes("/me/orders") ||
      u.includes("/subscription-status") ||
      u.includes("/billing/summary") ||
      u.includes("/billing/invoices") ||
      u.includes("/billing/payments")
    ) {
      const sep = u.includes("?") ? "&" : "?";
      config.url = `${u}${sep}ts=${Date.now()}`;
    }
  }

  return config;
});

export default api;
export { BASE_URL };
