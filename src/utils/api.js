import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== ""
    ? import.meta.env.VITE_API_URL
    : "http://localhost:8000";

console.log("Using API URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000, // 10s timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data) => api.post("/user/register", data),
  login: (data) => api.post("/user/login", data),
  logout: () => api.post("/user/logout"),
  linkPartner: (email) => api.post("/user/link-partner", { email }),
  unlinkPartner: () => api.post("/user/unlink-partner"),
  getProfile: () => api.get("/user/me"),
  sendNudge: (message) => api.post("/user/nudge", { message }),
  markNudgeSeen: () => api.post("/user/nudge/seen"),
};

// Task APIs
export const taskAPI = {
  getDashboard: (date) => api.get("/tasks/dashboard", { params: { date } }),
  createTask: (data) => api.post("/tasks", data),
  updateTask: (id, data) => api.patch(`/tasks/${id}`, data),
  updateTaskStatus: (id, isCompleted) =>
    api.patch(`/tasks/${id}/status`, { isCompleted }),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  addComment: (id, text) => api.post(`/tasks/${id}/comment`, { text }),
};

export default api;
