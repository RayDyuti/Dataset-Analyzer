import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
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

  const [summary, setSummary] = useState(null);
  const [scatterPoints, setScatterPoints] = useState([]);
  const [loading, setLoading] = useState(true);

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
  // Guards
  // --------------------------------------------------
  if (authLoading) return <p style={styles.centerText}>Loading...</p>;
  if (!user) {
    navigate("/login");
    return null;
  }
  if (loading) return <p style={styles.centerText}>Loading dataset summary...</p>;
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
        label: "Pressure vs Temperature",
        data: scatterPoints.map((pt) => ({ x: pt.x, y: pt.y })),
        backgroundColor: scatterPoints.map(
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
            const pt = scatterPoints[context.dataIndex];
            return `${pt.equipment_type} — Temp: ${pt.x}, Pressure: ${pt.y}, Flowrate: ${pt.flowrate}`;
          },
        },
      },
      title: { display: true, text: "Pressure vs Temperature (Scatter)" },
    },
    scales: {
      x: {
        title: { display: true, text: "Temperature", font: { weight: "bold" } },
      },
      y: {
        title: { display: true, text: "Pressure", font: { weight: "bold" } },
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

        <h1 style={styles.title}>
          Dataset Summary <span style={styles.muted}>(ID: {datasetId})</span>
        </h1>

        <div style={styles.statsGrid}>
          <Stat label="Total Equipment" value={summary.total_equipment} />
          <Stat label="Avg Flowrate" value={summary.average_flowrate?.toFixed(2)} />
          <Stat label="Avg Pressure" value={summary.average_pressure?.toFixed(2)} />
          <Stat label="Avg Temperature" value={summary.average_temperature?.toFixed(2)} />
        </div>

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
    padding: "2.5rem",
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

  title: {
    fontSize: "2.3rem",
    marginBottom: "2rem",
  },

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
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.5rem",
    marginBottom: "3rem",
  },

  stat: {
    background: "rgba(255,255,255,0.1)",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
    gap: "2rem",
  },

  chartCard: {
    background: "rgba(255,255,255,0.95)",
    padding: "1.2rem",
    borderRadius: "18px",
  },
};

export default DatasetSummary;
