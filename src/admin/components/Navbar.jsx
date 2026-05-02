import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="admin-navbar">
      <div className="admin-navbar-brand">
        <img src={logo} alt="logo" className="admin-logo-img" />
        <span>Tufto Rino</span>
      </div>

      <nav className="admin-navbar-links">
        <NavLink to="/admin">Accueil</NavLink>
        <NavLink to="/admin/products">Produits</NavLink>
        <NavLink to="/admin/orders">Commandes</NavLink>
        <NavLink to="/admin/users">Utilisateurs</NavLink>
        <NavLink to="/admin/custom-requests">Demandes personnalisées</NavLink>
        <NavLink to="/admin/messages">Messages</NavLink>
      </nav>

      <button className="admin-logout-btn" onClick={handleLogout}>
        Déconnexion
      </button>
    </header>
  );
}

export default Navbar;
