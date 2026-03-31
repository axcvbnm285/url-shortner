import axios from "axios";
import { API_BASE_URL } from "../config";

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);

export const shortenUrl = (data) => api.post("/shorten", data);
export const bulkShortenUrls = (urls) => api.post("/bulk-shorten", { urls });
export const fetchUrls = (params) => api.get("/urls", { params });
export const fetchStats = (id) => api.get(`/urls/${id}/stats`);
export const deleteUrl = (id) => api.delete(`/urls/${id}`);
export const verifyLinkPassword = (id, password) => api.post(`/urls/${id}/verify-password`, { password });
