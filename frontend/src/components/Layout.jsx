import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const links = [
  { to: "/", label: "Dashboard", icon: "📊", end: true },
  { to: "/meals", label: "Meals", icon: "🥗" },
  { to: "/workouts", label: "Workouts", icon: "💪" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  const themeOptions = [
    { value: "auto", icon: "🌗" },
    { value: "light", icon: "☀️" },
    { value: "dark", icon: "🌙" },
  ];

  const Sidebar = () => (
    <aside className={`sidebar${mobileOpen ? " open" : ""}`} style={{
      width: 220, background: "var(--sidebar)", borderRight: "1px solid rgba(255,255,255,0.06)",
      padding: "0 12px", display: "flex", flexDirection: "column",
      position: "sticky", top: 0, height: "100vh", flexShrink: 0,
    }}>
      <div style={{ padding: "22px 8px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 800, color: "#f97316" }}>🍽️ Kinetic</div>
          <div style={{ fontSize: 10, color: "#64748b", letterSpacing: "1px", fontWeight:600 }}>KITCHEN</div>
        </div>
        {/* Theme toggle */}
        <div style={{ display:"flex", gap:4 }}>
          {themeOptions.map(opt => (
            <button key={opt.value} onClick={() => setTheme(opt.value)} title={opt.value} style={{
              background: theme === opt.value ? "rgba(249,115,22,0.2)" : "transparent",
              border: theme === opt.value ? "1px solid rgba(249,115,22,0.4)" : "1px solid transparent",
              borderRadius: 6, padding: "3px 5px", fontSize: 13, cursor:"pointer",
            }}>{opt.icon}</button>
          ))}
        </div>
      </div>

      <nav style={{ padding: "14px 0", display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
        {links.map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)} style={({ isActive }) => ({
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 10, textDecoration: "none",
            fontWeight: 500, fontSize: 14,
            color: isActive ? "#f97316" : "#94a3b8",
            background: isActive ? "rgba(249,115,22,0.12)" : "transparent",
            transition: "all 0.15s",
          })}>
            <span style={{ fontSize: 16 }}>{icon}</span>{label}
          </NavLink>
        ))}
      </nav>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "14px 8px" }}>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 10, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          👤 {user?.name}
        </div>
        <button onClick={handleLogout} style={{
          width: "100%", background: "transparent", color: "#ef4444",
          border: "1px solid #ef4444", borderRadius: 8, padding: "8px",
          fontSize: 13, cursor: "pointer", fontWeight: 600,
        }}>Sign Out</button>
      </div>
    </aside>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:99
        }} />
      )}
      <main className="main-content" style={{ flex: 1, padding: "28px 32px", overflowY: "auto", minHeight:"100vh", background:"var(--bg)" }}>
        {/* Mobile menu button */}
        <button onClick={() => setMobileOpen(o => !o)} style={{
          display:"none", marginBottom:16, background:"var(--bg2)", border:"1px solid var(--border)",
          borderRadius:8, padding:"8px 12px", color:"var(--text)", fontSize:18,
        }} className="mobile-menu-btn">☰</button>
        <Outlet />
      </main>
    </div>
  );
}
