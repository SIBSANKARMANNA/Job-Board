import { Link } from "react-router-dom";

const TYPE_COLORS = { remote: "badge-remote", onsite: "badge-onsite", hybrid: "badge-hybrid" };

const InternshipCard = ({ internship }) => {
  const { _id, title, companyName, company, location, type, stipend, duration, isPaid, skills, createdAt } = internship;
  const displayCompany = companyName || company || "—";
  const daysAgo = Math.floor((Date.now() - new Date(createdAt)) / 86400000);

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">{title}</h3>
          <p className="card-company">{displayCompany}</p>
        </div>
        <div className="card-badges">
          {isPaid && <span className="badge badge-paid">Paid</span>}
          {type && <span className={`badge ${TYPE_COLORS[type] || ""}`}>{type}</span>}
        </div>
      </div>

      <div className="card-meta">
        <span>📍 {location}</span>
        {stipend && <span>💰 {stipend}</span>}
        {duration && <span>⏱ {duration}</span>}
      </div>

      {skills?.length > 0 && (
        <div className="card-skills">
          {skills.slice(0, 3).map((s) => (
            <span key={s} className="skill-tag">{s}</span>
          ))}
          {skills.length > 3 && <span className="skill-tag skill-more">+{skills.length - 3}</span>}
        </div>
      )}

      <div className="card-footer">
        <span className="card-date">{daysAgo === 0 ? "Today" : `${daysAgo}d ago`}</span>
        <Link to={`/internship/${_id}`} className="btn-primary btn-sm">View & Apply →</Link>
      </div>
    </div>
  );
};

export default InternshipCard;