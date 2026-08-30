import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handle = async () => {
    if (!form.name || !form.email || !form.password) return setError("Please fill in all fields");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    setError(""); setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0f172a", padding:20 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:52, marginBottom:8 }}>🍽️</div>
          <h1 style={{ fontSize:28, fontWeight:800, color:"#f97316", letterSpacing:"-0.5px" }}>Kinetic Kitchen</h1>
          <p style={{ color:"#64748b", marginTop:6, fontSize:14 }}>Create your free account</p>
        </div>

        <div className="card">
          <h2 style={{ fontSize:18, fontWeight:700, marginBottom:20 }}>Get started</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div className="form-group">
              <label>Full Name</label>
              <input placeholder="John Doe" value={form.name} onChange={set("name")} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Min. 6 characters" value={form.password} onChange={set("password")} />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button className="btn btn-primary" onClick={handle} disabled={loading} style={{ marginTop:4 }}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </div>
          <p style={{ textAlign:"center", marginTop:18, color:"#64748b", fontSize:14 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color:"#f97316", fontWeight:600, textDecoration:"none" }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
