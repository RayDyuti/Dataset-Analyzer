import { useState } from "react";
import api from "../api/axios";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResponse(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError(null);

      const res = await api.post("/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResponse(res.data);
    } catch (err) {
      if (err.response?.data) {
        setError(JSON.stringify(err.response.data, null, 2));
      } else {
        setError("Upload failed");
      }
    } finally {
      setLoading(false);
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
        <h1 style={styles.title}>Upload CSV</h1>
        <p style={styles.subtitle}>
          Import your dataset securely
        </p>

        <div style={styles.uploadBox}>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={styles.fileInput}
          />
          {file && (
            <p style={styles.fileName}>
              📄 {file.name}
            </p>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 10px 20px rgba(0,0,0,0.3)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        {error && (
          <pre style={styles.error}>
            {error}
          </pre>
        )}

        {response && (
          <pre style={styles.success}>
            <div style={{ textAlign: "left" }}>
              <p><strong>✅ Upload Successful!</strong></p>
              <p>Dataset: <strong>{response.dataset_name}</strong> (ID: {response.dataset_id})</p>
              <p>Total Rows: {response.total_rows}</p>
              <p>Inserted: {response.inserted} | Failed: {response.failed}</p>
              
              {response.errors && response.errors.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <p><strong>⚠️ Warnings:</strong></p>
                  <ul style={{ paddingLeft: "1.2rem", margin: "0" }}>
                    {response.errors.slice(0, 5).map((err, idx) => (
                      <li key={idx}>Row {err.row}: {JSON.stringify(err.errors)}</li>
                    ))}
                    {response.errors.length > 5 && <li>...and {response.errors.length - 5} more</li>}
                  </ul>
                </div>
              )}
            </div>
          </pre>
        )}
      </div>
    </div>
  );
};

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
    maxWidth: "480px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "2.5rem",
    boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
    transition: "transform 0.25s ease",
  },

  title: {
    fontSize: "1.9rem",
    fontWeight: 700,
    marginBottom: "0.25rem",
  },

  subtitle: {
    fontSize: "0.9rem",
    opacity: 0.75,
    marginBottom: "1.5rem",
  },

  uploadBox: {
    border: "2px dashed rgba(255,255,255,0.25)",
    borderRadius: "12px",
    padding: "1.5rem",
    textAlign: "center",
    marginBottom: "1.5rem",
  },

  fileInput: {
    color: "#f5f7fa",
  },

  fileName: {
    marginTop: "0.75rem",
    fontSize: "0.85rem",
    opacity: 0.85,
  },

  button: {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "10px",
    border: "none",
    background: "#4fd1c5",
    color: "#102a43",
    fontWeight: 600,
    transition: "all 0.2s ease",
  },

  error: {
    marginTop: "1.25rem",
    background: "rgba(255, 107, 107, 0.15)",
    color: "#ff6b6b",
    padding: "0.75rem",
    borderRadius: "8px",
    fontSize: "0.8rem",
    maxHeight: "200px",
    overflow: "auto",
  },

  success: {
    marginTop: "1.25rem",
    background: "rgba(72, 187, 120, 0.15)",
    color: "#48bb78",
    padding: "0.75rem",
    borderRadius: "8px",
    fontSize: "0.8rem",
    maxHeight: "200px",
    overflow: "auto",
  },
};

export default Upload;
