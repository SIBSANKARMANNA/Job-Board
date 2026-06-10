import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {authAPI} from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  const [form, setForm]     = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login }           = useAuth();
  const navigate            = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const token = res.data.data.token;
      const userData = res.data.data.user;
      login(token, userData);
      toast.success(`Welcome back, ${userData.name}!`);
      if (userData.role === "employer") navigate("/dashboard/employer");
      else if (userData.role === "admin") navigate("/dashboard/admin");
      else navigate("/dashboard/applicant");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* <div className="auth-logo">🚀</div> */}
        <h2>Welcome Back</h2>
        <p className="auth-sub">Sign in to your InternBoard account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Your password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
              />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd((s) => !s)}>
                {showPwd ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner" /> : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;