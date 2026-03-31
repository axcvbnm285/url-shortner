const browserOrigin =
  typeof window !== "undefined" ? window.location.origin : "";

const normalizedApiBase = (
  import.meta.env.VITE_API_BASE_URL ||
  (browserOrigin.includes("localhost:3000")
    ? "http://localhost:5001/api"
    : `${browserOrigin}/api`)
).replace(/\/+$/, "");

export const API_BASE_URL = normalizedApiBase;

export const SHORTLINK_BASE_URL = (
  import.meta.env.VITE_SHORTLINK_BASE_URL ||
  normalizedApiBase.replace(/\/api$/, "")
).replace(/\/+$/, "");
