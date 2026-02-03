import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";

const Dashboard = () => {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !token) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await api.get("/history/");
        setHistory(res.data);
      } catch (err) {
        console.error("Error fetching dataset history:", err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [authLoading, user, token]);

  const handleGenerateReport = async (datasetId, datasetName) => {
    try {
      const res = await api.get(`/report/${datasetId}/`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${datasetName}_report.pdf`;
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generating report:", err);
      alert("Failed to generate report PDF");
    }
  };

  if (authLoading) return <p style={styles.centerText}>Loading...</p>;
  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>
        <p style={styles.subtitle}>
          Welcome back, <strong>{user.username}</strong>
        </p>
      </header>

      <h2 style={styles.sectionTitle}>Recent Dataset Summaries</h2>

      {loading ? (
        <p style={styles.centerText}>Loading dataset summaries...</p>
      ) : history.length === 0 ? (
        <p style={styles.centerText}>No datasets available.</p>
      ) : (
        <div style={styles.cardGrid}>
          {history.map((dataset) => {
            const summary = dataset.summary || {};

            return (
              <div key={dataset.dataset_id} style={styles.card} className="dashboard-card">
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{dataset.dataset_name}</h3>
                  <span style={styles.timestamp}>
                    {(() => {
                      const d = new Date(dataset.uploaded_at);
                      return `${d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} • ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
                    })()}
                  </span>
                </div>

                <div style={styles.cardActions}>
                  <button
                    style={styles.secondaryBtn}
                    onClick={() => navigate(`/dataset/${dataset.dataset_id}`)}
                  >
                    View Details
                  </button>

                  <button
                    style={styles.secondaryBtn}
                    onClick={() =>
                      handleGenerateReport(dataset.dataset_id, dataset.dataset_name)
                    }
                  >
                    PDF Report
                  </button>
                </div>

                <div style={styles.statsGrid}>
                  <Stat label="Total Equipment" value={summary.total_equipment} />
                  <Stat
                    label="Avg Flowrate"
                    value={
                      summary.average_flowrate != null
                        ? summary.average_flowrate.toFixed(2)
                        : "N/A"
                    }
                  />
                  <Stat
                    label="Avg Pressure"
                    value={
                      summary.average_pressure != null
                        ? summary.average_pressure.toFixed(2)
                        : "N/A"
                    }
                  />
                  <Stat
                    label="Avg Temperature"
                    value={
                      summary.average_temperature != null
                        ? summary.average_temperature.toFixed(2)
                        : "N/A"
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>
        {`
          .dashboard-card {
            transition: transform 0.35s ease, box-shadow 0.35s ease;
          }
          .dashboard-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 30px 60px rgba(0,0,0,0.45);
          }
        `}
      </style>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div style={styles.stat}>
    <div style={styles.statLabel}>{label}</div>
    <div style={styles.statValue}>{value ?? "N/A"}</div>
  </div>
);

const styles = {
  container: {
    width: "100%",
    margin: "0 auto", // ✅ FIX
    padding: "2.5rem 0",
    color: "#f5f7fa",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  header: { marginBottom: "2rem" },
  title: { fontSize: "2.5rem" },
  subtitle: { opacity: 0.85 },
  sectionTitle: { fontSize: "1.7rem", marginBottom: "1.6rem" },
  centerText: { textAlign: "center", opacity: 0.8 },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "2rem",
  },
  card: {
    background: "rgba(255,255,255,0.09)",
    borderRadius: "20px",
    padding: "1.6rem",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1.5rem",
  },
  cardTitle: { fontSize: "1.25rem", fontWeight: 600 },
  timestamp: { fontSize: "0.75rem", opacity: 0.7 },
  cardActions: { display: "flex", gap: "1rem", margin: "1rem 0" },
  secondaryBtn: {
    flex: 1,
    padding: "0.6rem",
    borderRadius: "10px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "#fff",
    cursor: "pointer",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "0.9rem",
  },
  stat: {
    background: "rgba(0,0,0,0.28)",
    padding: "0.75rem",
    borderRadius: "12px",
  },
  statLabel: { fontSize: "0.72rem", opacity: 0.7 },
  statValue: { fontSize: "1.15rem", fontWeight: 600 },
};

export default Dashboard;
