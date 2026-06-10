// ─── Admin Stats panel ─────────────────────────────────────────
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import  {adminAPI}  from "../api/axios";


const StatsPanel = () => {
  const [stats, setStats]   = useState(null);
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.getStats(), adminAPI.getUsers()])
      .then(([sRes, uRes]) => {
        setStats(sRes.data.data);
        setUsers(uRes.data.data || []);
      })
      .catch(() => toast.error("Failed to load admin data"))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success("User deleted");
      setUsers((u) => u.filter((x) => x._id !== id));
    } catch { toast.error("Failed to delete user"); }
  };

  if (loading) return <p className="loader">Loading stats...</p>;

  return (
    <>
      {stats && (
        <div className="stats-grid">
          {[
            { label: "Total Users",       value: stats.totalUsers,        icon: "👥" },
            { label: "Internships",       value: stats.totalInternships,  icon: "📋" },
            { label: "Employers",         value: stats.totalEmployers,    icon: "🏢" },
            { label: "Applicants",        value: stats.totalApplicants,   icon: "🎓" },
            { label: "Total Applications",value: stats.totalApplications, icon: "📨" },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <span className="stat-icon">{s.icon}</span>
              <span className="stat-value">{s.value ?? "—"}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="section">
        <h3>All Users ({users.length})</h3>
        <div className="users-table">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Company</th><th>Joined</th><th></th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`role-tag role-${u.role}`}>{u.role}</span></td>
                  <td>{u.companyName || "—"}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-danger btn-sm" onClick={() => handleDeleteUser(u._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};


export default StatsPanel;