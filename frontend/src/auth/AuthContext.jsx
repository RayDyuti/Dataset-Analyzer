import { createContext, useContext, useEffect, useState } from "react";
import api, { publicApi } from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // ✅ store token
  const [loading, setLoading] = useState(true);

  // 🔄 Restore session on refresh
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");

    if (storedToken && storedUsername) {
      setUser({ username: storedUsername });
      setToken(storedToken);
    }

    setLoading(false);
  }, []);

  /**
   * 🔐 LOGIN (PUBLIC)
   */
  const login = async (username, password) => {
    try {
      const res = await publicApi.post("/auth/login/", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);

      setUser({ username: res.data.username });
      setToken(res.data.token);
    } catch (err) {
      console.error("Login failed:", err);
      throw err; // let UI handle error
    }
  };

  /**
   * 🚪 LOGOUT (PRIVATE)
   */
  const logout = async () => {
    try {
      await api.post("/auth/logout/", null, {
        headers: { Authorization: `Token ${token}` }, // send token if exists
      });
    } catch (err) {
      console.warn("Logout request failed, clearing session anyway");
    }

    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading, // auth loading state
        isAuthenticated: !!user,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
