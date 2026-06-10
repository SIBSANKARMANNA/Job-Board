// ─── Applications panel (per internship) ──────────────────────
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { applicationsAPI, internshipsAPI } from "../api/axios";




const ApplicationsPanel = ({ internshipId, title, onBack }) => {
  const [apps, setApps]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    internshipsAPI.getApplicationsForPosting(internshipId)
      .then((res) => setApps(res.data.data || []))
      .catch(() => toast.error("Failed to load applications"))
      .finally(() => setLoading(false));
  }, [internshipId]);

  const handleStatus = async (appId, status) => {
    setUpdating(appId);
    try {
      await applicationsAPI.updateStatus(appId, { status });
      toast.success(`Marked as ${status}`);
      setApps((prev) => prev.map((a) => a._id === appId ? { ...a, status } : a));
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <button className="back-link" style={{ background: "none", border: "none", cursor: "pointer", marginBottom: 16 }}
        onClick={onBack}>← Back to postings</button>
      <h3 style={{ marginBottom: 12 }}>Applications — {title}</h3>

      {loading ? <p className="loader">Loading...</p>
        : apps.length === 0 ? <p className="empty-state">No applications yet.</p>
        : (
          <div className="apps-list">
            {apps.map((app) => (
              <div key={app._id} className="app-item">
                <div className="app-item-top">
                  <div className="app-info">
                    <strong>{app.applicant?.name || app.name}</strong>
                    <a href={`mailto:${app.applicant?.email || app.email}`}>
                      {app.applicant?.email || app.email}
                    </a>
                    {app.resumeLink && (
                      <a href={app.resumeLink} target="_blank" rel="noreferrer" className="resume-link">
                        📎 Resume
                      </a>
                    )}
                  </div>
                  <span className={`status-badge status-${app.status}`}>{app.status}</span>
                </div>

                {app.coverLetter && <p className="cover-letter">"{app.coverLetter}"</p>}

                <div className="status-changer">
                  <span className="status-changer-label">Set status:</span>
                  {["reviewed", "shortlisted", "accepted", "rejected"].map((s) => (
                    <button key={s}
                      className={`status-btn status-btn-${s} ${app.status === s ? "active" : ""}`}
                      disabled={app.status === s || updating === app._id}
                      onClick={() => handleStatus(app._id, s)}>
                      {s}
                    </button>
                  ))}
                </div>

                {app.employerNote && <p className="employer-note">📝 {app.employerNote}</p>}
              </div>
            ))}
          </div>
        )}
    </div>
  );
};



export default ApplicationsPanel;