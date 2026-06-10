// ─── Internship form (create + edit) ──────────────────────────
import { useState } from "react";
import toast from "react-hot-toast";
import  {internshipsAPI}  from "../api/axios";
import { useAuth } from "../context/AuthContext";



const InternshipForm = ({ initial, onSaved, onCancel }) => {
  const { user } = useAuth();
  const editing  = !!initial;
  const blank    = {
    title: "", companyName: user?.companyName || "", location: "", description: "",
    type: "onsite", skills: "", stipend: "", duration: "", openings: 1, isPaid: false,
  };
  const [form, setForm]     = useState(
    initial ? { ...initial, skills: (initial.skills || []).join(", ") } : blank
  );
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        skills:   form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        openings: Number(form.openings),
      };
      if (editing) {
        await internshipsAPI.update(initial._id, payload);
        toast.success("Internship updated!");
      } else {
        await internshipsAPI.create(payload);
        toast.success("Internship posted!");
      }
      onSaved();
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (Array.isArray(errors)) errors.forEach((e) => toast.error(e));
      else toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="post-form">
      <div className="post-form-header">
        <h3>{editing ? "Edit Internship" : "Post New Internship"}</h3>
        <button type="button" className="close-btn" onClick={onCancel}>✕</button>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Title *</label>
          <input value={form.title} onChange={(e) => set("title", e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Company *</label>
          <input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Location *</label>
          <input value={form.location} onChange={(e) => set("location", e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Type *</label>
          <select value={form.type} onChange={(e) => set("type", e.target.value)}>
            {["onsite", "remote", "hybrid"].map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Description *</label>
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} required />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Skills <span className="label-hint">(comma-sep)</span></label>
          <input value={form.skills} onChange={(e) => set("skills", e.target.value)} placeholder="React, Node.js" />
        </div>
        <div className="form-group">
          <label>Openings</label>
          <input type="number" min={1} value={form.openings} onChange={(e) => set("openings", e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Paid?</label>
          <label className="toggle">
            <input type="checkbox" checked={form.isPaid} onChange={(e) => set("isPaid", e.target.checked)} />
            <span className="toggle-track"><span className="toggle-thumb" /></span>
            <span style={{ marginLeft: 8 }}>{form.isPaid ? "Yes" : "No"}</span>
          </label>
        </div>
        {form.isPaid && (
          <div className="form-group">
            <label>Stipend</label>
            <input value={form.stipend} onChange={(e) => set("stipend", e.target.value)} placeholder="₹10,000/month" />
          </div>
        )}
        <div className="form-group">
          <label>Duration</label>
          <input value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="3 months" />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <span className="spinner" /> : editing ? "Save Changes" : "Post Internship"}
        </button>
        <button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};


export default InternshipForm;