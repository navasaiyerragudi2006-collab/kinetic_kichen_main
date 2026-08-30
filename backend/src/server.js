require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "kinetic-kitchen-secret-2024";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: "Invalid token" }); }
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

// AUTH
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "All fields are required" });
  if (db.prepare("SELECT id FROM users WHERE email = ?").get(email)) return res.status(400).json({ error: "Email already registered" });
  const hashed = await bcrypt.hash(password, 10);
  const id = uid();
  db.prepare("INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)").run(id, name, email, hashed);
  const token = jwt.sign({ id, name, email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id, name, email, daily_cal_goal: 2000, daily_protein_goal: 150 } });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) return res.status(400).json({ error: "No account with that email" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Incorrect password" });
  const token = jwt.sign({ id: user.id, name: user.name, email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, email, daily_cal_goal: user.daily_cal_goal, daily_protein_goal: user.daily_protein_goal } });
});

app.get("/api/auth/me", auth, (req, res) => {
  const user = db.prepare("SELECT id, name, email, daily_cal_goal, daily_protein_goal FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

app.patch("/api/auth/goals", auth, (req, res) => {
  const { daily_cal_goal, daily_protein_goal } = req.body;
  db.prepare("UPDATE users SET daily_cal_goal = ?, daily_protein_goal = ? WHERE id = ?").run(daily_cal_goal||2000, daily_protein_goal||150, req.user.id);
  res.json({ success: true });
});

// MEALS
app.get("/api/meals", auth, (req, res) => {
  res.json(db.prepare("SELECT * FROM meals WHERE user_id = ? ORDER BY date DESC").all(req.user.id));
});

app.post("/api/meals", auth, (req, res) => {
  const { name, calories, protein, carbs, fat, mealType } = req.body;
  if (!name || calories === undefined) return res.status(400).json({ error: "Name and calories required" });
  const id = uid();
  db.prepare("INSERT INTO meals (id, user_id, name, calories, protein, carbs, fat, meal_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(id, req.user.id, name, Number(calories), Number(protein)||0, Number(carbs)||0, Number(fat)||0, mealType||"snack");
  res.json(db.prepare("SELECT * FROM meals WHERE id = ?").get(id));
});

app.delete("/api/meals/:id", auth, (req, res) => {
  db.prepare("DELETE FROM meals WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
  res.json({ success: true });
});

// MEAL TEMPLATES
app.get("/api/meal-templates", auth, (req, res) => {
  res.json(db.prepare("SELECT * FROM meal_templates WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id));
});

app.post("/api/meal-templates", auth, (req, res) => {
  const { name, calories, protein, carbs, fat, mealType } = req.body;
  if (!name || calories === undefined) return res.status(400).json({ error: "Name and calories required" });
  const id = uid();
  db.prepare("INSERT INTO meal_templates (id, user_id, name, calories, protein, carbs, fat, meal_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(id, req.user.id, name, Number(calories), Number(protein)||0, Number(carbs)||0, Number(fat)||0, mealType||"snack");
  res.json(db.prepare("SELECT * FROM meal_templates WHERE id = ?").get(id));
});

app.delete("/api/meal-templates/:id", auth, (req, res) => {
  db.prepare("DELETE FROM meal_templates WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
  res.json({ success: true });
});

app.post("/api/meal-templates/:id/log", auth, (req, res) => {
  const tpl = db.prepare("SELECT * FROM meal_templates WHERE id = ? AND user_id = ?").get(req.params.id, req.user.id);
  if (!tpl) return res.status(404).json({ error: "Template not found" });
  const id = uid();
  db.prepare("INSERT INTO meals (id, user_id, name, calories, protein, carbs, fat, meal_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(id, req.user.id, tpl.name, tpl.calories, tpl.protein, tpl.carbs, tpl.fat, tpl.meal_type);
  res.json(db.prepare("SELECT * FROM meals WHERE id = ?").get(id));
});

// WORKOUTS
app.get("/api/workouts", auth, (req, res) => {
  res.json(db.prepare("SELECT * FROM workouts WHERE user_id = ? ORDER BY date DESC").all(req.user.id));
});

app.post("/api/workouts", auth, (req, res) => {
  const { name, duration, calories, type, notes } = req.body;
  if (!name || duration === undefined) return res.status(400).json({ error: "Name and duration required" });
  const id = uid();
  db.prepare("INSERT INTO workouts (id, user_id, name, duration, calories, type, notes) VALUES (?, ?, ?, ?, ?, ?, ?)").run(id, req.user.id, name, Number(duration), Number(calories)||0, type||"cardio", notes||"");
  res.json(db.prepare("SELECT * FROM workouts WHERE id = ?").get(id));
});

app.delete("/api/workouts/:id", auth, (req, res) => {
  db.prepare("DELETE FROM workouts WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
  res.json({ success: true });
});

// STATS
app.get("/api/stats", auth, (req, res) => {
  const uid = req.user.id;
  const today = new Date().toISOString().slice(0, 10);
  const allMeals = db.prepare("SELECT * FROM meals WHERE user_id = ?").all(uid);
  const allWorkouts = db.prepare("SELECT * FROM workouts WHERE user_id = ?").all(uid);
  const todayMeals = allMeals.filter(m => m.date.startsWith(today));
  const todayWorkouts = allWorkouts.filter(w => w.date.startsWith(today));
  const trend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    trend.push({
      day: d.toLocaleDateString("en", { weekday: "short" }),
      caloriesIn: allMeals.filter(m => m.date.startsWith(ds)).reduce((s, m) => s + m.calories, 0),
      caloriesBurned: allWorkouts.filter(w => w.date.startsWith(ds)).reduce((s, w) => s + w.calories, 0),
    });
  }
  const user = db.prepare("SELECT daily_cal_goal, daily_protein_goal FROM users WHERE id = ?").get(uid);
  res.json({
    today: {
      caloriesIn: todayMeals.reduce((s, m) => s + m.calories, 0),
      caloriesBurned: todayWorkouts.reduce((s, w) => s + w.calories, 0),
      netCalories: todayMeals.reduce((s, m) => s + m.calories, 0) - todayWorkouts.reduce((s, w) => s + w.calories, 0),
      protein: todayMeals.reduce((s, m) => s + m.protein, 0),
      carbs: todayMeals.reduce((s, m) => s + m.carbs, 0),
      fat: todayMeals.reduce((s, m) => s + m.fat, 0),
      mealsCount: todayMeals.length,
      workoutsCount: todayWorkouts.length,
    },
    goals: { calories: user?.daily_cal_goal || 2000, protein: user?.daily_protein_goal || 150 },
    totals: { meals: allMeals.length, workouts: allWorkouts.length },
    trend,
  });
});

app.get("/api/health", (_, res) => res.json({ status: "ok" }));
app.listen(PORT, () => console.log(`✅ Kinetic Kitchen backend → http://localhost:${PORT}`));
