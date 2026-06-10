import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {authAPI} from "../api/axios";
import toast from "react-hot-toast";

const Register = () => {
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "applicant", companyName: "",
  });
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);
  // const { login }               = useAuth();
  const navigate                = useNavigate();

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role: form.role };
      if (form.role === "employer") payload.companyName = form.companyName;

      // const res = await api.post("/auth/register", payload);
      const res= await authAPI.register(payload);
      if(res.status === 201){
        toast.success("Account created!");
        navigate("/login");
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      // Joi returns details array or single message
      if (Array.isArray(err.response?.data?.errors)) {
        err.response.data.errors.forEach((e) => toast.error(e));
      } else {
        toast.error(msg || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* <div className="auth-logo">🚀</div> */}
        <h2>Create Account</h2>
        <p className="auth-sub">Join InternBoard today</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input placeholder="John Doe" value={form.name}
              onChange={(e) => set("name", e.target.value)} required autoFocus />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={(e) => set("email", e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Password <span className="label-hint">(min 8 chars, upper + lower + number)</span></label>
            <div className="input-with-icon">
              <input type={showPwd ? "text" : "password"} placeholder="Min 8 characters"
                value={form.password} onChange={(e) => set("password", e.target.value)} required />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd((s) => !s)}>
                {showPwd ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>I am a...</label>
            <div className="role-selector">
              {[
                { val: "applicant", label: "🎓 Student / Applicant" },
                { val: "employer",  label: "🏢 Employer" },
              ].map(({ val, label }) => (
                <label key={val} className={`role-option ${form.role === val ? "active" : ""}`}>
                  <input type="radio" name="role" value={val} checked={form.role === val}
                    onChange={() => set("role", val)} hidden />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {form.role === "employer" && (
            <div className="form-group">
              <label>Company Name</label>
              <input placeholder="e.g. TechCorp" value={form.companyName}
                onChange={(e) => set("companyName", e.target.value)} required />
            </div>
          )}

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner" /> : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;