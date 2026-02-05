import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useSettings } from "../context/SettingsContext";
import Skeleton from "../components/Skeleton";
import api from "../api/axios";

/* 📊 Chart.js */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Bar, Scatter } from "react-chartjs-2";

/* 🔧 Register Chart.js components */
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  Tooltip,
  Legend,
  Title
);

const DatasetSummary = () => {
  const { datasetId } = useParams();
  const navigate = useNavigate();
  const { user, token, loading: authLoading } = useAuth();
  const { convertValue, getUnit } = useSettings();

  const [summary, setSummary] = useState(null);
  const [scatterPoints, setScatterPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🧪 Filter State
  const [filters, setFilters] = useState({
    type: "All",
    minTemp: "",
    maxTemp: "",
    minPressure: "",
    maxPressure: "",
  });

  // --------------------------------------------------
  // Fetch dataset summary
  // --------------------------------------------------
  useEffect(() => {
    if (authLoading) return;
    if (!user || !token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const summaryRes = await api.get(`/summary/${datasetId}/`);
        setSummary(summaryRes.data);

        const scatterRes = await api.get(`/datasets/${datasetId}/scatter/`);
        setScatterPoints(scatterRes.data.points);
      } catch (err) {
        console.error("Error fetching dataset data:", err);
        setSummary(null);
        setScatterPoints([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, user, token, datasetId]);

  // --------------------------------------------------
  // Filter Logic (Computed)
  // --------------------------------------------------
  const filteredPoints = scatterPoints.filter(pt => {
    const typeMatch = filters.type === "All" || pt.equipment_type === filters.type;
    const tempMatch = (!filters.minTemp || pt.x >= parseFloat(filters.minTemp)) &&
      (!filters.maxTemp || pt.x <= parseFloat(filters.maxTemp));
    const presMatch = (!filters.minPressure || pt.y >= parseFloat(filters.minPressure)) &&
      (!filters.maxPressure || pt.y <= parseFloat(filters.maxPressure));
    return typeMatch && tempMatch && presMatch;
  });

  // --------------------------------------------------
  // Guards
  // --------------------------------------------------
  if (authLoading) return <p style={styles.centerText}>Loading...</p>;
  if (!user) {
    navigate("/login");
    return null;
  }
  if (loading) return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Skeleton width="100px" height="40px" style={{ marginBottom: "2rem" }} />
        <Skeleton width="40%" height="50px" style={{ marginBottom: "2rem" }} />
        <Skeleton height="100px" style={{ marginBottom: "2rem" }} />
        <div style={styles.statsGrid}>
          <Skeleton height="80px" borderRadius="16px" />
          <Skeleton height="80px" borderRadius="16px" />
          <Skeleton height="80px" borderRadius="16px" />
          <Skeleton height="80px" borderRadius="16px" />
        </div>
        <div style={styles.chartGrid}>
          <Skeleton height="350px" borderRadius="18px" />
          <Skeleton height="350px" borderRadius="18px" />
        </div>
      </div>
    </div>
  );
  if (!summary) return <p style={styles.centerText}>Dataset not found.</p>;

  // --------------------------------------------------
  // Bar Chart — Equipment Type Distribution
  // --------------------------------------------------
  const equipmentTypes = Object.keys(summary.equipment_type_distribution || {});
  const equipmentCounts = Object.values(summary.equipment_type_distribution || {});
  const COLORS = [
    "#2563eb",
    "#16a34a",
    "#dc2626",
    "#7c3aed",
    "#ea580c",
    "#0891b2",
    "#ca8a04",
  ];

  const barChartData = {
    labels: equipmentTypes,
    datasets: [
      {
        label: "Equipment Count",
        data: equipmentCounts,
        backgroundColor: equipmentTypes.map((_, i) => COLORS[i % COLORS.length]),
        borderColor: "#111827",
        borderWidth: 1.5,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Equipment Type Distribution" },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  // --------------------------------------------------
  // Scatter Chart — Pressure vs Temperature
  // --------------------------------------------------
  const equipmentColors = {
    Pump: "#2563eb",
    Compressor: "#dc2626",
    Valve: "#16a34a",
    HeatExchanger: "#7c3aed",
    Reactor: "#ea580c",
    Condenser: "#0891b2",
  };

  const scatterChartData = {
    datasets: [
      {
        label: `Pressure vs Temperature (${getUnit("pressure")} vs ${getUnit("temperature")})`,
        data: filteredPoints.map((pt) => ({
          x: convertValue(pt.x, "temperature"),
          y: convertValue(pt.y, "pressure")
        })),
        backgroundColor: filteredPoints.map(
          (pt) => equipmentColors[pt.equipment_type] || "#111827"
        ),
      },
    ],
  };

  const scatterChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: function (context) {
            const pt = filteredPoints[context.dataIndex];
            return `${pt.equipment_type} — Temp: ${convertValue(pt.x, "temperature")}${getUnit("temperature")}, Pressure: ${convertValue(pt.y, "pressure")}${getUnit("pressure")}, Flow: ${convertValue(pt.flowrate, "flowrate")}${getUnit("flowrate")}`;
          },
        },
      },
      title: { display: true, text: `Active Filters: ${filteredPoints.length} items shown` },
    },
    scales: {
      x: {
        title: { display: true, text: `Temperature (${getUnit("temperature")})`, font: { weight: "bold" } },
      },
      y: {
        title: { display: true, text: `Pressure (${getUnit("pressure")})`, font: { weight: "bold" } },
      },
    },
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ⬅ Back
        </button>

        <div style={styles.headerRow}>
          <h1 style={styles.title}>
            Dataset Summary <span style={styles.muted}>(ID: {datasetId})</span>
          </h1>
          <button
            style={styles.excelBtn}
            onClick={() => window.open(`${api.defaults.baseURL}/export/excel/${datasetId}/`, "_blank")}
          >
            📗 Download Excel
          </button>
        </div>

        {/* 🤖 AI Insight Box */}
        <div style={styles.insightBox}>
          <h3 style={styles.insightTitle}>💡 System Intelligence Brief</h3>
          <p style={styles.insightText}>{summary.insights}</p>
        </div>

        {/* 🕵️ Filter Controls */}
        <div style={styles.filterBar}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Type:</label>
            <select
              style={styles.select}
              value={filters.type}
              onChange={e => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="All">All Equipment</option>
              {equipmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Temp Range ({getUnit("temperature")}):</label>
            <div style={styles.rangeInputs}>
              <input
                type="number" placeholder="Min" style={styles.input}
                onChange={e => setFilters({ ...filters, minTemp: e.target.value })}
              />
              <input
                type="number" placeholder="Max" style={styles.input}
                onChange={e => setFilters({ ...filters, maxTemp: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div style={styles.statsGrid}>
          <Stat label={`Total Records`} value={summary.total_equipment} />
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

        {/* ⚠️ Anomaly Report */}
        {summary.anomalies && summary.anomalies.length > 0 && (
          <div style={styles.anomalySection}>
            <h2 style={styles.sectionTitle}>⚠️ Operational Anomalies Detected</h2>
            <div style={styles.anomalyList}>
              {summary.anomalies.map((ano, idx) => (
                <div key={idx} style={styles.anomalyCard}>
                  <div style={styles.anoHeader}>
                    <span style={ano.severity === "Critical" ? styles.criticalBadge : styles.warningBadge}>
                      {ano.severity}
                    </span>
                    <strong style={styles.anoName}>{ano.equipment_name}</strong>
                  </div>
                  <div style={styles.anoDetail}>
                    Detected abnormal <strong>{ano.metric}</strong>: <span style={styles.anoValue}>{convertValue(ano.value, ano.metric.toLowerCase())}{getUnit(ano.metric.toLowerCase())}</span>
                  </div>
                  <div style={styles.anoReason}>{ano.reason}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={styles.chartGrid}>
          <div style={styles.chartCard} className="lift">
            <Bar data={barChartData} options={barChartOptions} />
          </div>

          <div style={styles.chartCard} className="lift">
            <Scatter data={scatterChartData} options={scatterChartOptions} />
          </div>
        </div>
      </div>

      {/* Hover animations */}
      <style>
        {`
          .lift {
            transition: transform 0.35s ease, box-shadow 0.35s ease;
          }

          .lift:hover {
            transform: translateY(-10px);
            box-shadow: 0 30px 60px rgba(0,0,0,0.45);
          }
        `}
      </style>
    </div>
  );
};

// --------------------------------------------------
// Reusable stat block
// --------------------------------------------------
const Stat = ({ label, value }) => (
  <div style={styles.stat}>
    <div style={styles.statLabel}>{label}</div>
    <div style={styles.statValue}>{value ?? "N/A"}</div>
  </div>
);

// --------------------------------------------------
// Styles
// --------------------------------------------------
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    color: "#f5f7fa",
    fontFamily: "Inter, system-ui, sans-serif",
  },

  container: {
    width: "100%",
    maxWidth: "1280px",
    padding: window.innerWidth <= 768 ? "1.5rem" : "2.5rem",
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    flexDirection: window.innerWidth <= 768 ? "column" : "row",
    gap: "1rem",
    textAlign: window.innerWidth <= 768 ? "center" : "left",
  },

  backBtn: {
    marginBottom: "1.5rem",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "#fff",
    padding: "0.5rem 1rem",
    borderRadius: "10px",
    cursor: "pointer",
  },

  excelBtn: {
    background: "#22c55e",
    color: "#fff",
    border: "none",
    padding: "0.6rem 1.2rem",
    borderRadius: "12px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
  },

  title: {
    fontSize: window.innerWidth <= 768 ? "1.8rem" : "2.3rem",
    margin: 0,
  },

  insightBox: {
    background: "rgba(79, 209, 197, 0.1)",
    border: "1px solid rgba(79, 209, 197, 0.3)",
    borderRadius: "16px",
    padding: "1.5rem",
    marginBottom: "2.5rem",
  },

  insightTitle: {
    margin: "0 0 0.75rem 0",
    color: "#4fd1c5",
    fontSize: "1.1rem",
  },

  insightText: {
    margin: 0,
    lineHeight: 1.6,
    opacity: 0.9,
    fontSize: "0.95rem",
  },

  filterBar: {
    display: "flex",
    gap: "2rem",
    background: "rgba(255,255,255,0.05)",
    padding: "1.25rem",
    borderRadius: "14px",
    marginBottom: "2rem",
    alignItems: "flex-end",
    flexWrap: "wrap",
    border: "1px solid rgba(255,255,255,0.1)",
  },

  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },

  filterLabel: {
    fontSize: "0.8rem",
    fontWeight: 600,
    opacity: 0.8,
  },

  select: {
    background: "#1a1a1a",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.2)",
    padding: "0.5rem",
    borderRadius: "8px",
    cursor: "pointer",
  },

  rangeInputs: {
    display: "flex",
    gap: "0.5rem",
  },

  input: {
    width: "80px",
    background: "#1a1a1a",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.2)",
    padding: "0.5rem",
    borderRadius: "8px",
  },

  anomalySection: {
    marginBottom: "3rem",
  },

  sectionTitle: {
    fontSize: "1.5rem",
    marginBottom: "1.5rem",
    color: "#fca5a5",
  },

  anomalyList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.2rem",
  },

  anomalyCard: {
    background: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    borderRadius: "14px",
    padding: "1.2rem",
  },

  anoHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "0.6rem",
  },

  criticalBadge: {
    background: "#ef4444",
    fontSize: "0.65rem",
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
    fontWeight: 800,
    textTransform: "uppercase",
  },

  warningBadge: {
    background: "#f59e0b",
    fontSize: "0.65rem",
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
    fontWeight: 800,
    textTransform: "uppercase",
  },

  anoName: { fontSize: "1rem" },

  anoDetail: { fontSize: "0.85rem", opacity: 0.85, marginBottom: "0.4rem" },

  anoValue: { color: "#fca5a5", fontWeight: 700 },

  anoReason: { fontSize: "0.8rem", opacity: 0.7, fontStyle: "italic" },

  muted: {
    fontSize: "1rem",
    opacity: 0.7,
  },

  centerText: {
    textAlign: "center",
    opacity: 0.8,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1.2rem",
    marginBottom: "3rem",
  },

  stat: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "1.2rem",
    backdropFilter: "blur(14px)",
  },

  statLabel: {
    fontSize: "0.75rem",
    opacity: 0.7,
    marginBottom: "0.4rem",
  },

  statValue: {
    fontSize: "1.4rem",
    fontWeight: 600,
  },

  chartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "2rem",
  },

  chartCard: {
    background: "rgba(255,255,255,0.95)",
    padding: "1.2rem",
    borderRadius: "18px",
    minHeight: "300px",
  },
};

export default DatasetSummary;
