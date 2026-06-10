
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { internshipsAPI, applicationsAPI } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const InternshipDetail = () => {
  const { id }      = useParams();
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [internship, setInternship]         = useState(null);
  const [loading, setLoading]               = useState(true);
  const [applyForm, setApplyForm]           = useState({ resumeLink: "", coverLetter: "" });
  const [applying, setApplying]             = useState(false);
  const [showApply, setShowApply]           = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    internshipsAPI.getOne(id)
      .then((res) => {
        const data = res.data.data;
        setInternship(data);
        if (user?.role === "applicant" && data.applications) {
          setAlreadyApplied(
            data.applications.some((a) =>
              (a.applicant?._id || a.applicant) === user._id
            )
          );
        }
      })
      .catch(() => toast.error("Internship not found"))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    setApplying(true);
    try {
      await applicationsAPI.apply(id, applyForm);
      toast.success("Application submitted!");
      setShowApply(false);
      setAlreadyApplied(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Application failed");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="page"><div className="loader">Loading...</div></div>;
  if (!internship) return (
    <div className="page empty-state">
      <p>Internship not found.</p>
      <Link to="/" className="btn-primary">Back to Browse</Link>
    </div>
  );

  const company = internship.companyName || internship.postedBy?.companyName;

  return (
    <div className="page detail-page">
      <Link to="/" className="back-link">← Back to listings</Link>

      <div className="detail-card">
        <div className="detail-header">
          <div>
            <h1>{internship.title}</h1>
            <p className="detail-company">{company}</p>
          </div>
          <div className="detail-badges">
            {internship.isPaid && <span className="badge badge-paid">Paid</span>}
            {internship.type   && <span className="badge badge-type">{internship.type}</span>}
          </div>
        </div>

        <div className="detail-meta">
          <div className="meta-item">📍 <span>{internship.location}</span></div>
          {internship.stipend   && <div className="meta-item">💰 <span>{internship.stipend}</span></div>}
          {internship.duration  && <div className="meta-item">⏱ <span>{internship.duration}</span></div>}
          {internship.openings  && <div className="meta-item">👤 <span>{internship.openings} opening(s)</span></div>}
          <div className="meta-item">📅 <span>Posted by {internship.postedBy?.name || "Employer"}</span></div>
        </div>

        {internship.skills?.length > 0 && (
          <div className="detail-skills">
            <h4>Required Skills</h4>
            <div className="skills-row">
              {internship.skills.map((s) => <span key={s} className="skill-tag">{s}</span>)}
            </div>
          </div>
        )}

        <div className="detail-description">
          <h3>About this Internship</h3>
          <p>{internship.description}</p>
        </div>

        {/* Applicant: apply button / form */}
        {user?.role === "applicant" && (
          <div className="apply-section">
            {alreadyApplied ? (
              <div className="already-applied">✅ You have already applied for this internship.</div>
            ) : !showApply ? (
              <button className="btn-primary btn-lg" onClick={() => setShowApply(true)}>Apply Now</button>
            ) : (
              <form onSubmit={handleApply} className="apply-form">
                <h3>Submit Application</h3>
                <div className="form-group">
                  <label>Resume Link <span className="label-hint">(optional)</span></label>
                  <input type="url" placeholder="https://drive.google.com/..."
                    value={applyForm.resumeLink}
                    onChange={(e) => setApplyForm((f) => ({ ...f, resumeLink: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Cover Letter <span className="label-hint">(optional)</span></label>
                  <textarea rows={4} placeholder="Why are you a great fit?"
                    value={applyForm.coverLetter}
                    onChange={(e) => setApplyForm((f) => ({ ...f, coverLetter: e.target.value }))} />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={applying}>
                    {applying ? <span className="spinner" /> : "Submit Application"}
                  </button>
                  <button type="button" className="btn-outline" onClick={() => setShowApply(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        )}

        {!user && (
          <p className="login-nudge">
            <Link to="/login">Sign in</Link> to apply for this internship
          </p>
        )}
      </div>
    </div>
  );
};

export default InternshipDetail;