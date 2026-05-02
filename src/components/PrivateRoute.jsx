import { Navigate, Outlet } from "react-router-dom";
import { getAuthSession } from "../services/api.js";

function PrivateRoute({ adminOnly = false, children }) {
  const { user, role, token } = getAuthSession();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
}

export default PrivateRoute;
