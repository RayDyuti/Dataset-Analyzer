import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useSettings } from "../context/SettingsContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unitSystem, setUnitSystem } = useSettings();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navTo = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const toggleUnits = () => {
    setUnitSystem(unitSystem === "metric" ? "imperial" : "metric");
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.navContent}>
        <span
          style={styles.logo}
          onClick={() => navTo("/dashboard")}
        >
          {isMobile ? "FOSSEE" : "Data Visualizer Console"}
        </span>

        {/* 🍔 Hamburger Toggle (Mobile Only) */}
        {isMobile && (
          <button
            style={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        )}

        {/* 🖥️ Desktop Links / 📱 Mobile Drawer */}
        <div style={{
          ...styles.linksContainer,
          ...(isMobile && (menuOpen ? styles.mobileDrawerOpen : styles.mobileDrawerClosed))
        }}>
          <div style={styles.left}>
            <button
              style={styles.navButton}
              onClick={() => navTo("/dashboard")}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              Dashboard
            </button>

            <button
              style={styles.navButton}
              onClick={() => navTo("/upload")}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              Upload
            </button>

            {/* 📏 Unit Toggle */}
            <div
              style={styles.unitToggle}
              onClick={toggleUnits}
              title={`Switch to ${unitSystem === "metric" ? "Imperial" : "Metric"}`}
            >
              <div style={{ ...styles.toggleThumb, left: unitSystem === "metric" ? "4px" : "28px" }} />
              <span style={{ ...styles.unitText, opacity: unitSystem === "metric" ? 1 : 0.5 }}>M</span>
              <span style={{ ...styles.unitText, opacity: unitSystem === "imperial" ? 1 : 0.5 }}>I</span>
            </div>
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
                e.currentTarget.style.boxShadow = "0 8px 18px rgba(0,0,0,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    background: "rgba(15, 32, 39, 0.9)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  navContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  logo: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#4fd1c5",
    cursor: "pointer",
    marginRight: "1rem",
  },
  hamburger: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "1.8rem",
    cursor: "pointer",
  },
  linksContainer: {
    display: "flex",
    alignItems: "center",
    gap: "2rem",
  },
  // Mobile Drawer Styling
  mobileDrawerOpen: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "#0f2027",
    flexDirection: "column",
    padding: "1.5rem",
    gap: "1.5rem",
    borderBottom: "1px solid #4fd1c5",
  },
  mobileDrawerClosed: {
    display: "none",
  },
  navButton: {
    background: "transparent",
    border: "none",
    color: "#f5f7fa",
    fontSize: "0.95rem",
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  unitToggle: {
    position: "relative",
    width: "56px",
    height: "28px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.1)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    padding: "0 4px",
    margin: "0 0.5rem",
  },
  toggleThumb: {
    position: "absolute",
    width: "20px",
    height: "20px",
    background: "#4fd1c5",
    borderRadius: "50%",
    transition: "left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
  },
  unitText: {
    fontSize: "0.7rem",
    fontWeight: 800,
    zIndex: 1,
    pointerEvents: "none",
    userSelect: "none",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "1.2rem",
  },
  userBadge: {
    fontSize: "0.85rem",
    opacity: 0.85,
    padding: "0.5rem 1rem",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.1)",
  },
  logoutButton: {
    border: "none",
    padding: "0.5rem 1.2rem",
    borderRadius: "8px",
    background: "#ef4444",
    color: "#fff",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};
