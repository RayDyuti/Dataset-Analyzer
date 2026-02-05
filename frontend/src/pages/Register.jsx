import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicApi } from "../api/axios";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await publicApi.post("/auth/register/", {
        username,
        email,
        password,
      });

      navigate("/login");
    } catch (err) {
      setError("Registration failed. Try different credentials.");
    }
  };

  return (
    <div style={styles.page}>
      <div
        style={styles.card}
        onMouseEnter={(e) =>
          (e.currentTarget.style.transform = "translateY(-6px)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.transform = "translateY(0)")
        }
      >
        <h2 style={styles.title}>Create account</h2>
        <p style={styles.subtitle}>Join us in just a minute</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          <button
            type="submit"
            style={styles.button}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 10px 20px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Register
          </button>
        </form>
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
    transition: "transform 0.25s ease",
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
    transition: "all 0.2s ease",
  },
};

export default Register;
