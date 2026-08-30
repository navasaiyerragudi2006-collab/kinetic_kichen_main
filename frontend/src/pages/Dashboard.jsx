import { useState, useEffect } from "react";
import axios from "axios";
import { API, useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const MACRO_COLORS = ["#f97316", "#3b82f6", "#a855f7"];

function StatCard({ icon, label, value, unit, color }) {
  return (
    <div className="card" style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <div style={{ fontSize:24 }}>{icon}</div>
      <div style={{ fontSize:24, fontWeight:800, color }}>{typeof value === "number" ? value.toLocaleString() : value}</div>
      <div style={{ fontSize:12, color:"var(--text2)", fontWeight:500 }}>{label}</div>
      <div style={{ fontSize:11, color:"var(--muted)" }}>{unit}</div>
    </div>
  );
}

function GoalBar({ label, current, goal, color }) {
  const pct = Math.min(100, Math.round((current / goal) * 100));
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:13 }}>
        <span style={{ color:"var(--text2)", fontWeight:500 }}>{label}</span>
        <span style={{ color:"var(--text)", fontWeight:600 }}>{current} / {goal} <span style={{ color:"var(--muted)", fontWeight:400 }}>({pct}%)</span></span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width:`${pct}%`, background: pct >= 100 ? "#22c55e" : color }} />
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState({ calories: 2000, protein: 150 });
  const [editing, setEditing] = useState(false);
  const [goalForm, setGoalForm] = useState({ daily_cal_goal: 2000, daily_protein_goal: 150 });

  const load = () => {
    axios.get(`${API}/stats`).then(r => {
      setStats(r.data);
      setGoals(r.data.goals);
      setGoalForm({ daily_cal_goal: r.data.goals.calories, daily_protein_goal: r.data.goals.protein });
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const saveGoals = async () => {
    try {
      await axios.patch(`${API}/auth/goals`, goalForm);
      setGoals({ calories: goalForm.daily_cal_goal, protein: goalForm.daily_protein_goal });
      setEditing(false);
      toast("Goals updated!", "success");
      load();
    } catch { toast("Failed to save goals", "error"); }
  };

  if (loading) return <div style={{ color:"var(--muted)", padding:40, textAlign:"center" }}>Loading dashboard...</div>;

  const macros = [
    { name: "Protein", value: stats?.today.protein || 0 },
    { name: "Carbs", value: stats?.today.carbs || 0 },
    { name: "Fat", value: stats?.today.fat || 0 },
  ];

  const tooltipStyle = { background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:8, color:"var(--text)" };

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"var(--text)" }}>{getGreeting()}, {user?.name?.split(" ")[0]} 👋</h1>
          <p style={{ color:"var(--muted)", marginTop:4, fontSize:14 }}>
            {new Date().toLocaleDateString("en", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={() => setEditing(e => !e)} style={{ fontSize:13 }}>
          🎯 {editing ? "Cancel" : "Set Goals"}
        </button>
      </div>

      {/* Goal editor */}
      {editing && (
        <div className="card" style={{ marginBottom:20, borderColor:"var(--primary)" }}>
          <h3 style={{ fontSize:15, fontWeight:700, marginBottom:14, color:"var(--primary)" }}>🎯 Daily Goals</h3>
          <div className="form-row" style={{ maxWidth:400, marginBottom:14 }}>
            <div className="form-group">
              <label>Calorie Goal (kcal)</label>
              <input type="number" value={goalForm.daily_cal_goal} onChange={e => setGoalForm(f => ({...f, daily_cal_goal: Number(e.target.value)}))} />
            </div>
            <div className="form-group">
              <label>Protein Goal (g)</label>
              <input type="number" value={goalForm.daily_protein_goal} onChange={e => setGoalForm(f => ({...f, daily_protein_goal: Number(e.target.value)}))} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={saveGoals}>Save Goals</button>
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(148px, 1fr))", gap:14, marginBottom:20 }}>
        <StatCard icon="🍽️" label="Calories In" value={stats?.today.caloriesIn||0} unit="kcal today" color="var(--primary)" />
        <StatCard icon="🔥" label="Calories Burned" value={stats?.today.caloriesBurned||0} unit="kcal today" color="#22c55e" />
        <StatCard icon="⚡" label="Net Calories" value={stats?.today.netCalories||0} unit="kcal balance" color="var(--blue)" />
        <StatCard icon="🥩" label="Protein" value={stats?.today.protein||0} unit="grams today" color="var(--purple)" />
        <StatCard icon="🥗" label="Meals" value={stats?.today.mealsCount||0} unit="logged today" color="#ec4899" />
        <StatCard icon="🏋️" label="Workouts" value={stats?.today.workoutsCount||0} unit="today" color="#14b8a6" />
      </div>

      {/* Goal Progress */}
      <div className="card" style={{ marginBottom:20 }}>
        <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>🎯 Daily Progress</h3>
        <GoalBar label="Calories" current={stats?.today.caloriesIn||0} goal={goals.calories} color="var(--primary)" />
        <GoalBar label="Protein" current={Math.round(stats?.today.protein||0)} goal={goals.protein} color="var(--purple)" />
      </div>

      {/* Charts */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        <div className="card">
          <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>7-Day Calorie Trend</h3>
          {stats?.trend?.every(d => d.caloriesIn===0 && d.caloriesBurned===0) ? (
            <div style={{ color:"var(--muted)", textAlign:"center", padding:"40px 0", fontSize:14 }}>Log meals & workouts to see your trend</div>
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={stats?.trend||[]}>
                <XAxis dataKey="day" tick={{ fill:"var(--muted)", fontSize:12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:"var(--muted)", fontSize:11 }} axisLine={false} tickLine={false} width={38} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="caloriesIn" name="Consumed" fill="#f97316" radius={[4,4,0,0]} />
                <Bar dataKey="caloriesBurned" name="Burned" fill="#22c55e" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div style={{ display:"flex", gap:16, marginTop:10, fontSize:12 }}>
            <span style={{ color:"#f97316" }}>● Consumed</span>
            <span style={{ color:"#22c55e" }}>● Burned</span>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Today's Macros</h3>
          {macros.every(m => m.value===0) ? (
            <div style={{ color:"var(--muted)", textAlign:"center", padding:"40px 0", fontSize:14 }}>Log a meal with macros to see breakdown</div>
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={macros} cx="50%" cy="50%" outerRadius={72} dataKey="value">
                  {macros.map((_, i) => <Cell key={i} fill={MACRO_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [`${v}g`, n]} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div style={{ display:"flex", gap:14, marginTop:10, fontSize:12 }}>
            {macros.map((m, i) => <span key={m.name} style={{ color:MACRO_COLORS[i] }}>● {m.name}: {m.value}g</span>)}
          </div>
        </div>
      </div>

      <div className="card" style={{ background:"linear-gradient(135deg, rgba(249,115,22,0.08), rgba(234,88,12,0.03))", borderColor:"rgba(249,115,22,0.2)" }}>
        <h3 style={{ fontSize:14, fontWeight:700, marginBottom:10, color:"var(--primary)" }}>💡 Daily Tips</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:10 }}>
          {[["💧","Drink 8 glasses of water"],["🥦","Include veggies in every meal"],["😴","Aim for 7–9 hours of sleep"]].map(([icon,tip]) => (
            <div key={tip} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
              <span style={{ fontSize:16 }}>{icon}</span>
              <span style={{ fontSize:13, color:"var(--text2)" }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
