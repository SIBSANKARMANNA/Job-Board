import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wraps any route that requires authentication.
 *
 * Props:
 *   children  — the page component to render
 *   roles     — optional string[] of allowed roles e.g. ["employer","admin"]
 *               if omitted, any authenticated user is allowed
 *
 * Behaviour:
 *   • Still loading  → show a centred spinner (avoids flash-redirect)
 *   • Not logged in  → redirect to /login, preserving the intended URL
 *   • Wrong role     → redirect to / with a clear state flag
 *   • Authorised     → render children
 */
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location          = useLocation();

  console.log('user from protectedRoute',user);

  // ── 1. Auth check still in flight ────────────────────────────
  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "calc(100vh - 60px)", flexDirection: "column", gap: 12,
      }}>
        <span className="spinner" style={{
          width: 32, height: 32,
          border: "3px solid #e2e8f0",
          borderTopColor: "#4f46e5",
        }} />
        <p style={{ color: "#718096", fontSize: "0.9rem" }}>Verifying session…</p>
      </div>
    );
  }

  // ── 2. Not authenticated → go to login, remember where they were ──
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // ── 3. Authenticated but wrong role → back to home ───────────
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" state={{ unauthorised: true }} replace />;
  }

  // ── 4. All good ───────────────────────────────────────────────
  return children;
};

export default ProtectedRoute;