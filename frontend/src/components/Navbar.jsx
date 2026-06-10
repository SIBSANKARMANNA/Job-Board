import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* Avatar initials */
const Avatar = ({ name }) => {
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  return <div className="avatar">{initials}</div>;
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  const dashboardLink =
  user?.role === "employer" || user?.role === "admin"
    ? "/dashboard/employer"
    : "/dashboard/applicant";

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand"> InternBoard</Link>

      <div className="nav-links">
        <Link to="/">Browse</Link>

        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn-primary">Register</Link>
          </>
        ) : (
          <>
            <Link to={dashboardLink}>Dashboard</Link>

            {/* User avatar with dropdown */}
            <div className="avatar-wrap" ref={dropdownRef}>
              <button className="avatar-btn" onClick={() => setOpen((o) => !o)} aria-label="User menu">
                <Avatar name={user.name} />
              </button>

              {open && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <Avatar name={user.name} />
                    <div className="dropdown-info">
                      <span className="dropdown-name">{user.name}</span>
                      <span className="dropdown-email">{user.email}</span>
                      <span className={`dropdown-role role-tag role-${user.role}`}>{user.role}</span>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  {user.role === "employer" && user.companyName && (
                    <div className="dropdown-company">🏢 {user.companyName}</div>
                  )}

                  <Link to={dashboardLink} className="dropdown-item" onClick={() => setOpen(false)}>
                    📋 Dashboard
                  </Link>
                  <Link to="/profile" className="dropdown-item" onClick={() => setOpen(false)}>
                    ✏️ Edit Profile
                  </Link>

                  <div className="dropdown-divider" />

                  <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;