# 🍽️ Kinetic Kitchen


### **AI-Powered Nutrition & Fitness Tracking Platform**

*A modern full-stack web application built to simplify nutrition management, meal tracking, and workout monitoring using an intuitive dashboard and scalable architecture.*


---

# 📖 Overview

**Kinetic Kitchen** is a full-stack AI-powered nutrition and fitness management platform designed to help users achieve healthier lifestyles by monitoring their daily nutrition, tracking workouts, and visualizing fitness progress.

The application combines an elegant React frontend with a robust Express.js backend to provide a seamless user experience while maintaining a scalable and secure architecture.

Whether you're trying to lose weight, build muscle, or simply maintain a balanced diet, Kinetic Kitchen provides the tools needed to stay on track.

---

# ✨ Key Features

### 🥗 Smart Meal Tracking

* Search foods using the **Open Food Facts API**
* Log breakfast, lunch, dinner, and snacks
* Save frequently eaten meals as reusable templates
* Automatically calculate nutritional values

---

### 📈 Nutrition Dashboard

* Daily calorie tracking
* Protein intake monitoring
* Goal progress visualization
* Interactive analytics charts
* Historical nutrition insights

---

### 💪 Workout Tracker

* Built-in library of 20+ exercises
* Automatic calorie burn estimation
* Workout history
* Exercise logging
* Fitness progress monitoring

---

### 👤 User Authentication

* Secure user registration
* Login system
* Session management
* Protected routes
* Personalized dashboard

---

### 🎨 Modern User Experience

* Responsive interface
* Dark & Light Mode
* Toast Notifications
* Fast page navigation
* Mobile-friendly design

---

### 💾 Persistent Storage

* SQLite database
* Data persists after application restarts
* Lightweight and efficient storage

---

# 🏗️ Architecture

```
                +----------------------+
                |     React + Vite     |
                |      Frontend        |
                +----------+-----------+
                           |
                      REST API
                           |
                +----------v-----------+
                |    Express.js API    |
                |      Backend         |
                +----------+-----------+
                           |
                    SQLite Database
```

---

# 🛠️ Tech Stack

## Frontend

* React 18
* Vite
* React Router
* Context API
* CSS

---

## Backend

* Node.js
* Express.js
* SQLite
* REST APIs

---

## APIs

* Open Food Facts API

---

## Development Tools

* Git
* GitHub
* npm

---

# 📂 Project Structure

```
kinetic-kitchen/

├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── db.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── models/
│   │
│   ├── package.json
│   └── .env
│
└── README.md
```

---

# 🚀 Installation

## Clone the Repository

```bash
git clone https://github.com/yourusername/kinetic-kitchen.git

cd kinetic-kitchen
```

---

## Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

---

# ▶️ Running the Application

## Start Backend

```bash
cd backend

npm run dev
```

Server:

```
http://localhost:5000
```

---

## Start Frontend

```bash
cd frontend

npm run dev
```

Application:

```
http://localhost:5173
```

---

# ⚙️ Environment Variables

## Backend (.env)

```env
PORT=5000

JWT_SECRET=your_secret_key
```

---

## Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

---

# 📊 Current Features

* ✅ User Authentication
* ✅ Nutrition Tracking
* ✅ Meal Logging
* ✅ Food Search
* ✅ Workout Tracking
* ✅ Exercise Library
* ✅ Goal Progress Dashboard
* ✅ Charts & Analytics
* ✅ Responsive Design
* ✅ Dark Mode
* ✅ Toast Notifications
* ✅ SQLite Database

---

# 🔮 Future Improvements

* 🤖 AI Meal Recommendations
* 🧠 Personalized Nutrition Plans
* 📷 Food Image Recognition
* ⌚ Wearable Device Integration
* ☁️ Cloud Database
* 📊 Advanced Analytics
* 🏆 Achievement System
* 👥 Community Challenges
* 📱 Progressive Web App (PWA)

---

# 🔒 Security

* Secure authentication workflow
* Environment variable management
* Protected API routes
* Input validation
* RESTful API architecture

---

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository

2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push your branch

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the **MIT License**.

---

</div>
