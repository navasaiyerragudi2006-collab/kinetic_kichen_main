import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const EMPTY = { name:"", calories:"", protein:"", carbs:"", fat:"", mealType:"breakfast" };

export default function Meals() {
  const toast = useToast();
  const [meals, setMeals] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [tab, setTab] = useState("log"); // log | templates | search
  const searchTimeout = useRef(null);

  const loadMeals = () => axios.get(`${API}/meals`).then(r => setMeals(r.data));
  const loadTemplates = () => axios.get(`${API}/meal-templates`).then(r => setTemplates(r.data));

  useEffect(() => {
    Promise.all([loadMeals(), loadTemplates()]).finally(() => setFetching(false));
  }, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  // Food search via Open Food Facts
  const handleSearch = val => {
    setSearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!val.trim()) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(val)}&search_simple=1&action=process&json=1&page_size=8&fields=product_name,nutriments,serving_size`
        );
        const data = await res.json();
        const products = (data.products || [])
          .filter(p => p.product_name && p.nutriments?.["energy-kcal_100g"])
          .map(p => ({
            name: p.product_name,
            calories: Math.round(p.nutriments["energy-kcal_100g"] || 0),
            protein: Math.round(p.nutriments["proteins_100g"] || 0),
            carbs: Math.round(p.nutriments["carbohydrates_100g"] || 0),
            fat: Math.round(p.nutriments["fat_100g"] || 0),
            serving: p.serving_size || "100g",
          }));
        setSearchResults(products.slice(0, 8));
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 500);
  };

  const fillFromSearch = product => {
    setForm({ name: product.name, calories: product.calories, protein: product.protein, carbs: product.carbs, fat: product.fat, mealType: "snack" });
    setSearch(""); setSearchResults([]);
    setTab("log");
    toast("Food info filled in! Adjust serving size if needed.", "info");
  };

  const submit = async () => {
    if (!form.name || !form.calories) return setError("Name and calories are required");
    setError(""); setLoading(true);
    try {
      await axios.post(`${API}/meals`, form);
      setForm(EMPTY);
      await loadMeals();
      toast("Meal logged! 🥗", "success");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add meal");
    } finally { setLoading(false); }
  };

  const saveAsTemplate = async () => {
    if (!form.name || !form.calories) return setError("Fill in name and calories first");
    try {
      await axios.post(`${API}/meal-templates`, form);
      await loadTemplates();
      toast("Saved as template! ⭐", "success");
    } catch { toast("Failed to save template", "error"); }
  };

  const logFromTemplate = async tpl => {
    try {
      await axios.post(`${API}/meal-templates/${tpl.id}/log`);
      await loadMeals();
      toast(`${tpl.name} logged! 🥗`, "success");
    } catch { toast("Failed to log meal", "error"); }
  };

  const deleteTemplate = async id => {
    await axios.delete(`${API}/meal-templates/${id}`);
    await loadTemplates();
    toast("Template deleted", "info");
  };

  const removeMeal = async id => {
    await axios.delete(`${API}/meals/${id}`);
    setMeals(m => m.filter(x => x.id !== id));
    toast("Meal removed", "info");
  };

  const todayMeals = meals.filter(m => m.date.startsWith(new Date().toISOString().slice(0,10)));
  const totalCals = todayMeals.reduce((s,m) => s+m.calories, 0);
  const totalProtein = todayMeals.reduce((s,m) => s+m.protein, 0);

  const tabStyle = active => ({
    padding:"8px 18px", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer",
    background: active ? "var(--primary)" : "transparent",
    color: active ? "white" : "var(--text2)",
    border: active ? "none" : "1px solid var(--border)",
  });

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"var(--text)" }}>🥗 Meal Tracker</h1>
        <p style={{ color:"var(--muted)", marginTop:4, fontSize:14 }}>Log meals, search foods, save templates</p>
      </div>

      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:22 }}>
        {[
          { label:"Calories Today", value:`${totalCals} kcal`, color:"var(--primary)" },
          { label:"Protein Today", value:`${totalProtein}g`, color:"var(--purple)" },
          { label:"Meals Logged", value:todayMeals.length, color:"#22c55e" },
        ].map(({ label,value,color }) => (
          <div key={label} className="card" style={{ textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:800, color }}>{value}</div>
            <div style={{ fontSize:12, color:"var(--muted)", marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:18 }}>
        <button style={tabStyle(tab==="log")} onClick={() => setTab("log")}>➕ Log Meal</button>
        <button style={tabStyle(tab==="search")} onClick={() => setTab("search")}>🔍 Food Search</button>
        <button style={tabStyle(tab==="templates")} onClick={() => setTab("templates")}>⭐ Templates ({templates.length})</button>
      </div>

      {/* Log Meal form */}
      {tab === "log" && (
        <div className="card" style={{ marginBottom:22 }}>
          <h3 style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>Add Meal</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div className="form-row">
              <div className="form-group">
                <label>Meal Name *</label>
                <input placeholder="e.g. Grilled Chicken" value={form.name} onChange={set("name")} />
              </div>
              <div className="form-group">
                <label>Meal Type</label>
                <select value={form.mealType} onChange={set("mealType")}>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group"><label>Calories (kcal) *</label><input type="number" placeholder="350" value={form.calories} onChange={set("calories")} /></div>
              <div className="form-group"><label>Protein (g)</label><input type="number" placeholder="30" value={form.protein} onChange={set("protein")} /></div>
              <div className="form-group"><label>Carbs (g)</label><input type="number" placeholder="40" value={form.carbs} onChange={set("carbs")} /></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 3fr", gap:14, alignItems:"end" }}>
              <div className="form-group"><label>Fat (g)</label><input type="number" placeholder="10" value={form.fat} onChange={set("fat")} /></div>
              <div>
                {error && <div className="error-msg" style={{ marginBottom:8 }}>{error}</div>}
                <div style={{ display:"flex", gap:10 }}>
                  <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading ? "Adding..." : "➕ Log Meal"}</button>
                  <button className="btn btn-ghost" onClick={saveAsTemplate} style={{ fontSize:13 }}>⭐ Save as Template</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Food Search */}
      {tab === "search" && (
        <div className="card" style={{ marginBottom:22 }}>
          <h3 style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>🔍 Search Food Database</h3>
          <p style={{ fontSize:13, color:"var(--muted)", marginBottom:14 }}>Powered by Open Food Facts — search any food to auto-fill nutrition info</p>
          <input placeholder="Search e.g. banana, brown rice, chicken breast..." value={search} onChange={e => handleSearch(e.target.value)} />
          {searching && <div style={{ color:"var(--muted)", fontSize:13, marginTop:10 }}>Searching...</div>}
          {searchResults.length > 0 && (
            <div style={{ marginTop:14, display:"flex", flexDirection:"column", gap:8 }}>
              {searchResults.map((r, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", background:"var(--bg3)", borderRadius:10, gap:12 }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14, color:"var(--text)", marginBottom:2 }}>{r.name.slice(0,60)}</div>
                    <div style={{ fontSize:12, color:"var(--muted)" }}>per 100g · {r.calories} kcal · P:{r.protein}g C:{r.carbs}g F:{r.fat}g</div>
                  </div>
                  <button className="btn-sm" onClick={() => fillFromSearch(r)}>Use</button>
                </div>
              ))}
            </div>
          )}
          {!searching && search.length > 2 && searchResults.length === 0 && (
            <div style={{ color:"var(--muted)", fontSize:13, marginTop:12 }}>No results found. Try a different search term.</div>
          )}
        </div>
      )}

      {/* Templates */}
      {tab === "templates" && (
        <div className="card" style={{ marginBottom:22 }}>
          <h3 style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>⭐ Saved Meal Templates</h3>
          <p style={{ fontSize:13, color:"var(--muted)", marginBottom:14 }}>Log frequently eaten meals in one click</p>
          {templates.length === 0 ? (
            <div style={{ color:"var(--muted)", textAlign:"center", padding:"30px 0", fontSize:14 }}>
              No templates yet. Use "Save as Template" when logging a meal.
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {templates.map(tpl => (
                <div key={tpl.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", background:"var(--bg3)", borderRadius:12, gap:12 }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                      <span style={{ fontWeight:600, fontSize:14, color:"var(--text)" }}>{tpl.name}</span>
                      <span className={`badge badge-${tpl.meal_type}`}>{tpl.meal_type}</span>
                    </div>
                    <div style={{ fontSize:12, color:"var(--muted)" }}>
                      {tpl.calories} kcal · P:{tpl.protein}g · C:{tpl.carbs}g · F:{tpl.fat}g
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button className="btn-sm" onClick={() => logFromTemplate(tpl)}>Log It</button>
                    <button className="btn-danger" onClick={() => deleteTemplate(tpl.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Meals list */}
      <div className="card">
        <h3 style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>All Logged Meals</h3>
        {fetching ? (
          <div style={{ color:"var(--muted)", textAlign:"center", padding:30 }}>Loading...</div>
        ) : meals.length === 0 ? (
          <div style={{ color:"var(--muted)", textAlign:"center", padding:40, fontSize:14 }}>No meals logged yet. Add your first meal above!</div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {meals.map(meal => (
              <div key={meal.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", background:"var(--bg3)", borderRadius:12, gap:12, flexWrap:"wrap" }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                    <span style={{ fontWeight:600, fontSize:14, color:"var(--text)" }}>{meal.name}</span>
                    <span className={`badge badge-${meal.meal_type}`}>{meal.meal_type}</span>
                  </div>
                  <div style={{ fontSize:12, color:"var(--muted)" }}>
                    {new Date(meal.date).toLocaleDateString("en",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                  <div style={{ display:"flex", gap:12, fontSize:13, flexWrap:"wrap" }}>
                    <span style={{ color:"var(--primary)", fontWeight:700 }}>{meal.calories} kcal</span>
                    {meal.protein>0 && <span style={{ color:"#a855f7" }}>P:{meal.protein}g</span>}
                    {meal.carbs>0 && <span style={{ color:"#3b82f6" }}>C:{meal.carbs}g</span>}
                    {meal.fat>0 && <span style={{ color:"#f59e0b" }}>F:{meal.fat}g</span>}
                  </div>
                  <button className="btn-danger" onClick={() => removeMeal(meal.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
