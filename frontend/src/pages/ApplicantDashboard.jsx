
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { applicationsAPI } from "../api/axios";
import toast from "react-hot-toast";

const STATUS_META = {
  pending:     { label: "Pending",     cls: "status-pending" },
  reviewed:    { label: "Reviewed",    cls: "status-reviewed" },
  shortlisted: { label: "Shortlisted", cls: "status-shortlisted" },
  accepted:    { label: "Accepted",    cls: "status-accepted" },
  rejected:    { label: "Rejected",    cls: "status-rejected" },
};

const ApplicantDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("all");

  useEffect(() => {
    applicationsAPI
      .getMy()
      .then((res) => {
        console.log("my_applications", res);
        setApplications(res.data.data || []);
      })
      .catch((err) => {
        console.error("my_applications_error", err);
        toast.error("Failed to load applications");
    })
    .finally(() => setLoading(false));
}, []);

  // Each item shape from backend:
  // { internship: { _id, title, companyName, location, type }, application: { _id, status, coverLetter, resumeLink, employerNote, createdAt } }
  const getStatus = (item) => item.application?.status || item.status || "pending";

  const filtered = filter === "all"
    ? applications
    : applications.filter((a) => getStatus(a) === filter);

  return (
    <div className="page">
      <div className="dashboard-header">
        <h2 className="page-title">My Applications</h2>
        <span className="posting-count">{applications.length} total</span>
      </div>

      {/* Status filter tabs */}
      <div className="status-tabs">
        {["all", ...Object.keys(STATUS_META)].map((s) => (
          <button key={s} className={`status-tab ${filter === s ? "active" : ""}`}
            onClick={() => setFilter(s)}>
            {s === "all" ? "All" : STATUS_META[s].label}
            <span className="tab-count">
              {s === "all"
                ? applications.length
                : applications.filter((a) => getStatus(a) === s).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="apps-grid">
          {[1, 2, 3].map((i) => <div key={i} className="app-card skeleton" style={{ height: 160 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>{filter === "all" ? "No applications yet." : `No ${filter} applications.`}</p>
          <Link to="/" className="btn-primary" style={{ marginTop: 12, display: "inline-block" }}>
            Browse Internships
          </Link>
        </div>
      ) : (
        <div className="apps-grid">
          {filtered.map((item, idx) => {
            const intern = item.internship || item;
            const app    = item.application || item;
            const status = getStatus(item);
            const { label, cls } = STATUS_META[status] || { label: status, cls: "status-pending" };

            return (
              <div key={app._id || idx} className="app-card">
                <div className="app-card-header">
                  <div>
                    <h3>{intern.title}</h3>
                    <p>{intern.companyName} · {intern.location}</p>
                  </div>
                  <span className={`status-badge ${cls}`}>{label}</span>
                </div>

                {intern.type && (
                  <span className={`badge badge-${intern.type}`} style={{ alignSelf: "flex-start" }}>
                    {intern.type}
                  </span>
                )}

                {app.coverLetter && (
                  <p className="app-cover">
                    "{app.coverLetter.slice(0, 100)}{app.coverLetter.length > 100 ? "…" : ""}"
                  </p>
                )}

                {app.employerNote && (
                  <p className="employer-note">📝 {app.employerNote}</p>
                )}

                {app.resumeLink && (
                  <a href={app.resumeLink} target="_blank" rel="noreferrer" className="resume-link">
                    📎 View Resume
                  </a>
                )}

                <div className="app-card-footer">
                  <span className="app-date">
                    Applied {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                  <Link to={`/internship/${intern._id}`} className="btn-outline btn-sm">
                    View Posting
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApplicantDashboard;