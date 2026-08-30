import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handle = async () => {
    if (!form.email || !form.password) return setError("Please fill in all fields");
    setError(""); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Check your credentials.");
    } finally { setLoading(false); }
  };

  const handleKey = (e) => { if (e.key === "Enter") handle(); };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0f172a", padding:20 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:52, marginBottom:8 }}>🍽️</div>
          <h1 style={{ fontSize:28, fontWeight:800, color:"#f97316", letterSpacing:"-0.5px" }}>Kinetic Kitchen</h1>
          <p style={{ color:"#64748b", marginTop:6, fontSize:14 }}>AI-Powered Nutrition & Fitness Tracker</p>
        </div>

        <div className="card">
          <h2 style={{ fontSize:18, fontWeight:700, marginBottom:20 }}>Welcome back</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} onKeyDown={handleKey} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={set("password")} onKeyDown={handleKey} />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button className="btn btn-primary" onClick={handle} disabled={loading} style={{ marginTop:4 }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
          <p style={{ textAlign:"center", marginTop:18, color:"#64748b", fontSize:14 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color:"#f97316", fontWeight:600, textDecoration:"none" }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
