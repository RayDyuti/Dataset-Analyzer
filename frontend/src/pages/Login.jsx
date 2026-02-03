import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.subtitle}>Login to continue</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>

        <p style={styles.footer}>
          Don’t have an account?{" "}
          <Link to="/register" style={styles.link}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    fontFamily: "Inter, system-ui, sans-serif",
    color: "#f5f7fa",
  },

  card: {
    width: "100%",
    maxWidth: "420px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "2.5rem",
    boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
  },

  title: {
    fontSize: "1.8rem",
    fontWeight: 700,
    marginBottom: "0.25rem",
  },

  subtitle: {
    fontSize: "0.9rem",
    opacity: 0.75,
    marginBottom: "1.5rem",
  },

  error: {
    color: "#ff6b6b",
    fontSize: "0.85rem",
    marginBottom: "1rem",
  },

  field: {
    marginBottom: "1.25rem",
  },

  label: {
    fontSize: "0.75rem",
    opacity: 0.8,
    marginBottom: "0.3rem",
    display: "block",
  },

  input: {
    width: "100%",
    padding: "0.65rem 0.75rem",
    borderRadius: "8px",
    border: "none",
    outline: "none",
    fontSize: "0.9rem",
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
  },

  button: {
    width: "100%",
    marginTop: "0.5rem",
    padding: "0.7rem",
    borderRadius: "10px",
    border: "none",
    background: "#4fd1c5",
    color: "#102a43",
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },

  footer: {
    marginTop: "1.5rem",
    fontSize: "0.8rem",
    opacity: 0.8,
    textAlign: "center",
  },

  link: {
    color: "#4fd1c5",
    textDecoration: "none",
    fontWeight: 500,
  },
};

/* Hover effects (JS-safe inline trick) */
styles.card[":hover"] = {};
styles.button[":hover"] = {};

export default Login;
