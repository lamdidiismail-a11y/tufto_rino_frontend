import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import "./AdminLayout.css";

function AdminLayout() {
  return (
    <div className="admin-shell">
      <Navbar />

      <div className="admin-layout">
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;