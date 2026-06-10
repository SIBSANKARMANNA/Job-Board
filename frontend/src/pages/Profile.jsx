


import { useState } from "react";
import { authAPI } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name:        user?.name        || "",
    companyName: user?.companyName || "",
    bio:         user?.bio         || "",
    skills:      (user?.skills || []).join(", "),
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name: form.name, bio: form.bio };
      if (user.role === "employer") payload.companyName = form.companyName;
      if (user.role === "applicant") {
        payload.skills = form.skills.split(",").map((s) => s.trim()).filter(Boolean);
      }
      const res = await authAPI.updateMe(payload);
      const updated = res.data?.data?.user ?? res.data?.data ?? {};
      updateUser(updated);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <h2>Edit Profile</h2>
        <p className="auth-sub">Update your account information</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input value={user?.email} disabled style={{ opacity: 0.55 }} />
          </div>
          {user?.role === "employer" && (
            <div className="form-group">
              <label>Company Name</label>
              <input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
            </div>
          )}
          <div className="form-group">
            <label>Bio <span className="label-hint">(optional)</span></label>
            <textarea rows={3} value={form.bio} onChange={(e) => set("bio", e.target.value)}
              placeholder="Tell us about yourself..." />
          </div>
          {user?.role === "applicant" && (
            <div className="form-group">
              <label>Skills <span className="label-hint">(comma-separated)</span></label>
              <input value={form.skills} onChange={(e) => set("skills", e.target.value)}
                placeholder="React, Node.js, MongoDB" />
            </div>
          )}
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner" /> : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;