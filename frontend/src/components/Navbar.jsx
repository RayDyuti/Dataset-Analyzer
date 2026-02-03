import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <span
          style={styles.logo}
          onClick={() => navigate("/dashboard")}
        >
          Data Visualizer Console
        </span>

        <button
          style={styles.navButton}
          onClick={() => navigate("/dashboard")}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background =
              "rgba(255,255,255,0.15)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          Dashboard
        </button>

        <button
          style={styles.navButton}
          onClick={() => navigate("/upload")}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background =
              "rgba(255,255,255,0.15)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          Upload
        </button>
      </div>

      <div style={styles.right}>
        <div style={styles.userBadge}>
          👤 {user?.username}
        </div>

        <button
          style={styles.logoutButton}
          onClick={handleLogout}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 8px 18px rgba(0,0,0,0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    background: "rgba(15, 32, 39, 0.85)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    fontFamily: "Inter, system-ui, sans-serif",
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },

  logo: {
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "#4fd1c5",
    cursor: "pointer",
    marginRight: "1rem",
  },

  navButton: {
    background: "transparent",
    border: "none",
    color: "#f5f7fa",
    fontSize: "0.9rem",
    padding: "0.5rem 0.9rem",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background 0.2s ease",
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },

  userBadge: {
    fontSize: "0.85rem",
    opacity: 0.85,
    padding: "0.4rem 0.75rem",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.1)",
  },

  logoutButton: {
    border: "none",
    padding: "0.45rem 0.9rem",
    borderRadius: "8px",
    background: "#ef4444",
    color: "#fff",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};

export default Navbar;
