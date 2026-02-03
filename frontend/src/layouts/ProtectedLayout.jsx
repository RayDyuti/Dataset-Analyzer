import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Navbar from "../components/Navbar";

const ProtectedLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export default ProtectedLayout;
