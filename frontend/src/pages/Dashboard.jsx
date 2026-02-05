import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useSettings } from "../context/SettingsContext";
import Skeleton from "../components/Skeleton";
import api from "../api/axios";

const Dashboard = () => {
  const { user, token, loading: authLoading } = useAuth();
  const { convertValue, getUnit } = useSettings();
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
        <div style={styles.cardGrid}>
          {[1, 2, 3].map(i => (
            <div key={i} style={styles.card}>
              <Skeleton height="30px" width="60%" style={{ marginBottom: "1rem" }} />
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                <Skeleton height="35px" borderRadius="10px" />
                <Skeleton height="35px" borderRadius="10px" />
              </div>
              <div style={styles.statsGrid}>
                <Skeleton height="50px" borderRadius="12px" />
                <Skeleton height="50px" borderRadius="12px" />
                <Skeleton height="50px" borderRadius="12px" />
                <Skeleton height="50px" borderRadius="12px" />
              </div>
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <p style={styles.centerText}>No datasets available.</p>
      ) : (
        <div style={styles.cardGrid}>
          {history.map((dataset) => {
            const summary = dataset.summary || {};

            return (
              <div key={dataset.dataset_id} style={styles.card} className="dashboard-card">
                <div style={styles.cardHeader}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <h3 style={styles.cardTitle}>{dataset.dataset_name}</h3>
                    {summary.anomalies?.length > 0 && (
                      <span style={styles.anomalyBadge}>
                        ⚠️ {summary.anomalies.length} Anomalies
                      </span>
                    )}
                  </div>
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
                    label={`Avg Flowrate (${getUnit("flowrate")})`}
                    value={convertValue(summary.average_flowrate, "flowrate")}
                  />
                  <Stat
                    label={`Avg Pressure (${getUnit("pressure")})`}
                    value={convertValue(summary.average_pressure, "pressure")}
                  />
                  <Stat
                    label={`Avg Temp (${getUnit("temperature")})`}
                    value={convertValue(summary.average_temperature, "temperature")}
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
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    background: "rgba(255,255,255,0.09)",
    borderRadius: "20px",
    padding: window.innerWidth <= 768 ? "1.2rem" : "1.6rem",
  },
  cardHeader: {
    display: "flex",
    flexDirection: window.innerWidth <= 768 ? "column" : "row",
    alignItems: window.innerWidth <= 768 ? "flex-start" : "center",
    justifyContent: "space-between",
    gap: "1rem",
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
  anomalyBadge: {
    fontSize: "0.65rem",
    background: "rgba(239, 68, 68, 0.2)",
    color: "#fca5a5",
    padding: "0.2rem 0.6rem",
    borderRadius: "6px",
    fontWeight: 700,
    width: "fit-content",
  },
};

export default Dashboard;
