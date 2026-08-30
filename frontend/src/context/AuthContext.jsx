import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("kk_token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      axios.get(`${API}/auth/me`)
        .then(r => setUser(r.data))
        .catch(() => { localStorage.removeItem("kk_token"); delete axios.defaults.headers.common["Authorization"]; })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const r = await axios.post(`${API}/auth/login`, { email, password });
    localStorage.setItem("kk_token", r.data.token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${r.data.token}`;
    setUser(r.data.user);
  };

  const register = async (name, email, password) => {
    const r = await axios.post(`${API}/auth/register`, { name, email, password });
    localStorage.setItem("kk_token", r.data.token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${r.data.token}`;
    setUser(r.data.user);
  };

  const logout = () => {
    localStorage.removeItem("kk_token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
export { API };
