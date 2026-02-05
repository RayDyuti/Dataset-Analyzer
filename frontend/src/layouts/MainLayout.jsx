import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <Outlet />
      </div>
    </main>
  );
};

const styles = {
  page: {
    minHeight: "calc(100vh - 72px)",
    display: "flex",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
  },
  container: {
    width: "100%",
    maxWidth: "1280px",
    padding: window.innerWidth <= 768 ? "1.5rem" : "2.5rem",
  },
};

export default MainLayout;
