
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// Global 401 handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      if (!window.location.pathname.startsWith("/login") &&
          !window.location.pathname.startsWith("/register")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

// ── AUTH  /api/v1/auth ────────────────────────────────────────
export const authAPI = {
  register : (data) => api.post("/auth/register", data),
  login    : (data) => api.post("/auth/login", data),
  getMe    : ()     => api.get("/auth/me"),
  updateMe : (data) => api.patch("/auth/me", data),
};

// ── INTERNSHIPS  /api/v1/internships ─────────────────────────
export const internshipsAPI = {
  // GET  /internships  — public, query: page,limit,search,location,type,skills,sort
  getAll    : (params = {})  => api.get("/internships", { params }),
  // GET  /internships/:id  — public
  getOne    : (id)           => api.get(`/internships/${id}`),
  // POST /internships  — employer/admin
  create    : (data)         => api.post("/internships", data),
  // PATCH /internships/:id  — owner/admin
  update    : (id, data)     => api.patch(`/internships/${id}`, data),
  // DELETE /internships/:id  — owner/admin
  remove    : (id)           => api.delete(`/internships/${id}`),
  // GET  /internships/employer/my-postings  — employer/admin
  // myPostings: ()             => api.get("/internships/employer/my-postings"),
  myPostings: (params = {}) => api.get("/internships/employer/my-postings", { params }),
  // GET  /internships/:id/applications  — employer/admin
  getApplicationsForPosting: (id) => api.get(`/internships/${id}/applications`),
};

// ── APPLICATIONS  /api/v1/applications ───────────────────────
export const applicationsAPI = {
  // POST /internships/:id/apply  — applicant
  apply        : (internshipId, data) => api.post(`/internships/${internshipId}/apply`, data),
  // GET  /applications/my-applications  — applicant
  getMy        : ()             => api.get("/applications/my-applications"),
  // PATCH /applications/:id/status  — employer/admin
  updateStatus : (appId, data)  => api.patch(`/applications/${appId}/status`, data),
};

// ── ADMIN  /api/v1/admin ──────────────────────────────────────
export const adminAPI = {
  getStats  : ()   => api.get("/admin/stats"),
  getUsers  : ()   => api.get("/admin/users"),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export default api;