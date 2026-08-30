import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const EXERCISE_LIBRARY = [
  { name:"Running (moderate)", type:"cardio", metPerMin:0.175, emoji:"🏃" },
  { name:"Cycling (moderate)", type:"cardio", metPerMin:0.133, emoji:"🚴" },
  { name:"Swimming", type:"cardio", metPerMin:0.158, emoji:"🏊" },
  { name:"Jump Rope", type:"cardio", metPerMin:0.208, emoji:"⛹️" },
  { name:"Walking (brisk)", type:"cardio", metPerMin:0.075, emoji:"🚶" },
  { name:"HIIT", type:"cardio", metPerMin:0.217, emoji:"⚡" },
  { name:"Bench Press", type:"strength", metPerMin:0.083, emoji:"🏋️" },
  { name:"Squats", type:"strength", metPerMin:0.1, emoji:"💪" },
  { name:"Deadlift", type:"strength", metPerMin:0.1, emoji:"🔩" },
  { name:"Pull-ups", type:"strength", metPerMin:0.092, emoji:"🤸" },
  { name:"Pushups", type:"strength", metPerMin:0.067, emoji:"💪" },
  { name:"Dumbbell Curls", type:"strength", metPerMin:0.067, emoji:"💪" },
  { name:"Yoga", type:"flexibility", metPerMin:0.05, emoji:"🧘" },
  { name:"Stretching", type:"flexibility", metPerMin:0.033, emoji:"🤸" },
  { name:"Pilates", type:"flexibility", metPerMin:0.058, emoji:"🧘" },
  { name:"Basketball", type:"sports", metPerMin:0.142, emoji:"🏀" },
  { name:"Football", type:"sports", metPerMin:0.158, emoji:"⚽" },
  { name:"Tennis", type:"sports", metPerMin:0.133, emoji:"🎾" },
  { name:"Badminton", type:"sports", metPerMin:0.117, emoji:"🏸" },
  { name:"Dancing", type:"cardio", metPerMin:0.1, emoji:"💃" },
];

const EMPTY = { name:"", duration:"", calories:"", type:"cardio", notes:"" };
const WEIGHT_KG = 70; // default estimate for calorie calc

export default function Workouts() {
  const toast = useToast();
  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [tab, setTab] = useState("log"); // log | library
  const [libFilter, setLibFilter] = useState("all");
  const [libSearch, setLibSearch] = useState("");

  const load = () => axios.get(`${API}/workouts`).then(r => setWorkouts(r.data)).finally(() => setFetching(false));
  useEffect(() => { load(); }, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const pickExercise = ex => {
    const duration = form.duration || 30;
    const calories = Math.round(ex.metPerMin * WEIGHT_KG * Number(duration));
    setForm(f => ({ ...f, name: ex.name, type: ex.type, calories }));
    setTab("log");
    toast(`${ex.name} selected! Calories estimated at ${calories} kcal.`, "info");
  };

  // Auto-recalculate calories when duration changes (if exercise was picked from library)
  const handleDurationChange = e => {
    const duration = e.target.value;
    const ex = EXERCISE_LIBRARY.find(x => x.name === form.name);
    if (ex && duration) {
      const calories = Math.round(ex.metPerMin * WEIGHT_KG * Number(duration));
      setForm(f => ({ ...f, duration, calories }));
    } else {
      setForm(f => ({ ...f, duration }));
    }
  };

  const submit = async () => {
    if (!form.name || !form.duration) return setError("Name and duration are required");
    setError(""); setLoading(true);
    try {
      await axios.post(`${API}/workouts`, form);
      setForm(EMPTY);
      await load();
      toast("Workout logged! 💪", "success");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to log workout");
    } finally { setLoading(false); }
  };

  const remove = async id => {
    await axios.delete(`${API}/workouts/${id}`);
    setWorkouts(w => w.filter(x => x.id !== id));
    toast("Workout removed", "info");
  };

  const today = workouts.filter(w => w.date.startsWith(new Date().toISOString().slice(0,10)));
  const totalMins = today.reduce((s,w) => s+w.duration, 0);
  const totalBurned = today.reduce((s,w) => s+w.calories, 0);

  const tabStyle = active => ({
    padding:"8px 18px", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer",
    background: active ? "var(--primary)" : "transparent",
    color: active ? "white" : "var(--text2)",
    border: active ? "none" : "1px solid var(--border)",
  });

  const filteredLib = EXERCISE_LIBRARY.filter(ex =>
    (libFilter === "all" || ex.type === libFilter) &&
    ex.name.toLowerCase().includes(libSearch.toLowerCase())
  );

  const typeColors = { cardio:"#dbeafe", strength:"#fce7f3", flexibility:"#d1fae5", sports:"#fef9c3" };
  const typeText = { cardio:"#1e40af", strength:"#9d174d", flexibility:"#065f46", sports:"#713f12" };

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"var(--text)" }}>💪 Workout Tracker</h1>
        <p style={{ color:"var(--muted)", marginTop:4, fontSize:14 }}>Log workouts, pick from exercise library</p>
      </div>

      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:22 }}>
        {[
          { label:"Sessions Today", value:today.length, color:"#22c55e" },
          { label:"Minutes Today", value:`${totalMins} min`, color:"var(--blue)" },
          { label:"Calories Burned", value:`${totalBurned} kcal`, color:"var(--primary)" },
        ].map(({ label,value,color }) => (
          <div key={label} className="card" style={{ textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:800, color }}>{value}</div>
            <div style={{ fontSize:12, color:"var(--muted)", marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:18 }}>
        <button style={tabStyle(tab==="log")} onClick={() => setTab("log")}>➕ Log Workout</button>
        <button style={tabStyle(tab==="library")} onClick={() => setTab("library")}>📚 Exercise Library ({EXERCISE_LIBRARY.length})</button>
      </div>

      {/* Log Workout form */}
      {tab === "log" && (
        <div className="card" style={{ marginBottom:22 }}>
          <h3 style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>Log Workout</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div className="form-row">
              <div className="form-group">
                <label>Workout Name *</label>
                <input placeholder="e.g. Morning Run" value={form.name} onChange={set("name")} />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={form.type} onChange={set("type")}>
                  <option value="cardio">Cardio</option>
                  <option value="strength">Strength</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="sports">Sports</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Duration (minutes) *</label>
                <input type="number" placeholder="30" value={form.duration} onChange={handleDurationChange} />
              </div>
              <div className="form-group">
                <label>Calories Burned {form.name && EXERCISE_LIBRARY.find(x=>x.name===form.name) ? "(auto-calculated)" : ""}</label>
                <input type="number" placeholder="250" value={form.calories} onChange={set("calories")} />
              </div>
            </div>
            <div className="form-group">
              <label>Notes (optional)</label>
              <input placeholder="How did it go?" value={form.notes} onChange={set("notes")} />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <button className="btn btn-primary" onClick={submit} disabled={loading} style={{ alignSelf:"flex-start" }}>
                {loading ? "Adding..." : "➕ Log Workout"}
              </button>
              <span style={{ fontSize:13, color:"var(--muted)" }}>or pick from Exercise Library →</span>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Library */}
      {tab === "library" && (
        <div className="card" style={{ marginBottom:22 }}>
          <h3 style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>📚 Exercise Library</h3>
          <p style={{ fontSize:13, color:"var(--muted)", marginBottom:14 }}>Pick an exercise to auto-fill name, type, and estimated calories</p>
          <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
            <input placeholder="Search exercises..." value={libSearch} onChange={e => setLibSearch(e.target.value)} style={{ flex:1, minWidth:160 }} />
            {["all","cardio","strength","flexibility","sports"].map(f => (
              <button key={f} onClick={() => setLibFilter(f)} style={{
                padding:"8px 14px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer",
                background: libFilter===f ? "var(--primary)" : "var(--bg3)",
                color: libFilter===f ? "white" : "var(--text2)", border:"none",
                textTransform:"capitalize",
              }}>{f}</button>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px,1fr))", gap:10 }}>
            {filteredLib.map(ex => (
              <div key={ex.name} onClick={() => pickExercise(ex)} style={{
                padding:"14px", background:"var(--bg3)", borderRadius:12, cursor:"pointer",
                border:"1px solid var(--border)", transition:"all 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor="var(--primary)"}
              onMouseLeave={e => e.currentTarget.style.borderColor="var(--border)"}
              >
                <div style={{ fontSize:22, marginBottom:6 }}>{ex.emoji}</div>
                <div style={{ fontWeight:600, fontSize:14, color:"var(--text)", marginBottom:6 }}>{ex.name}</div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{
                    fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:20,
                    background: typeColors[ex.type] || "#f1f5f9",
                    color: typeText[ex.type] || "#475569",
                  }}>{ex.type}</span>
                  <span style={{ fontSize:11, color:"var(--muted)" }}>
                    ~{Math.round(ex.metPerMin * WEIGHT_KG * 30)} kcal/30min
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workout list */}
      <div className="card">
        <h3 style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>All Logged Workouts</h3>
        {fetching ? (
          <div style={{ color:"var(--muted)", textAlign:"center", padding:30 }}>Loading...</div>
        ) : workouts.length === 0 ? (
          <div style={{ color:"var(--muted)", textAlign:"center", padding:40, fontSize:14 }}>No workouts logged yet. Log your first workout above!</div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {workouts.map(w => (
              <div key={w.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", background:"var(--bg3)", borderRadius:12, gap:12, flexWrap:"wrap" }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                    <span style={{ fontSize:16 }}>{EXERCISE_LIBRARY.find(x=>x.name===w.name)?.emoji || "🏃"}</span>
                    <span style={{ fontWeight:600, fontSize:14, color:"var(--text)" }}>{w.name}</span>
                    <span className={`badge badge-${w.type}`}>{w.type}</span>
                  </div>
                  <div style={{ fontSize:12, color:"var(--muted)" }}>
                    {new Date(w.date).toLocaleDateString("en",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}
                    {w.notes && <span style={{ marginLeft:8 }}>· {w.notes}</span>}
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                  <div style={{ display:"flex", gap:12, fontSize:13 }}>
                    <span style={{ color:"var(--blue)", fontWeight:700 }}>⏱ {w.duration} min</span>
                    {w.calories>0 && <span style={{ color:"#22c55e", fontWeight:700 }}>🔥 {w.calories} kcal</span>}
                  </div>
                  <button className="btn-danger" onClick={() => remove(w.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
