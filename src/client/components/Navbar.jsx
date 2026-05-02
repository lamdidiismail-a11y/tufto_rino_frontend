import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Navbar.css";
import logo from "../../assets/logo.png";
import {
  apiRequest,
  AUTH_CHANGED_EVENT,
  CART_UPDATED_EVENT,
  clearAuthSession,
  getAuthSession,
} from "../../services/api.js";

const navItems = [
  { type: "route", to: "/", label: "Accueil" },
  { type: "route", to: "/products", label: "Produits" },
  { type: "route", to: "/custom-request", label: "Conception sur mesure" },
  { type: "route", to: "/messages", label: "Contact" },
  { type: "route", to: "/about", label: "À propos" },
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const applySession = () => {
      const session = getAuthSession();
      setUser(session.user);

      if (!session.isAuthenticated) {
        setCartCount(0);
      }
    };

    const loadCartCount = async () => {
      const session = getAuthSession();

      if (!session.isAuthenticated) {
        setCartCount(0);
        return;
      }

      try {
        const data = await apiRequest("/cart");
        setCartCount(data.cart.summary.totalQuantity);
      } catch (error) {
        if (error.status === 401) {
          clearAuthSession();
        }
      }
    };

    const handleAuthChanged = () => {
      applySession();
      loadCartCount();
    };

    const handleCartUpdated = (event) => {
      if (event.detail?.summary) {
        setCartCount(event.detail.summary.totalQuantity || 0);
        return;
      }

      loadCartCount();
    };

    applySession();
    loadCartCount();

    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    clearAuthSession();
    setIsMenuOpen(false);
    navigate("/login");
  };

  const renderNavItem = (item, className = "") => {
    if (item.type === "anchor") {
      return (
        <a key={item.label} href={item.href} className={className}>
          {item.label}
        </a>
      );
    }

    return (
      <Link key={item.label} to={item.to} className={className}>
        {item.label}
      </Link>
    );
  };

  return (
    <header className={`navbar${isMenuOpen ? " menu-open" : ""}`}>
      <div className="navbar-toprow">
        <Link to="/" className="navbar-brand">
          <img src={logo} alt="Tufto Rino" className="logo-img" />
          <span>Tufto Rino</span>
        </Link>

        <button
          type="button"
          className="navbar-toggle"
          onClick={() => setIsMenuOpen((current) => !current)}
          aria-label="Ouvrir le menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? "×" : "☰"}
        </button>
      </div>

      <nav className="navbar-links">
        {navItems.map((item) => renderNavItem(item))}
      </nav>

      <div className="navbar-actions">
        <Link to="/cart" className="navbar-cart">
          Panier ({cartCount})
        </Link>

        {user ? (
          <>
            <span className="navbar-user">{user.name || user.email}</span>
            <button className="navbar-login" onClick={handleLogout}>
              Deconnexion
            </button>
          </>
        ) : (
          <Link to="/login" className="navbar-login">
            Connexion
          </Link>
        )}
      </div>

      <div className={`navbar-mobile-menu${isMenuOpen ? " open" : ""}`}>
        <div className="mobile-menu-grid">
          <div className="mobile-menu-left">
            {navItems.map((item) => renderNavItem(item, "navbar-mobile-link"))}
          </div>

          <div className="mobile-menu-right">
            <span className="wave-line line-1"></span>
            <span className="wave-line line-2"></span>
            <span className="wave-line line-3"></span>
            <span className="wave-line line-4"></span>
          </div>
        </div>

        <div className="mobile-menu-bottom">
          {user ? (
            <button type="button" className="navbar-mobile-account">
              👤 {user.name || user.email}
            </button>
          ) : (
            <Link to="/login" className="navbar-mobile-account">
              👤 Compte
            </Link>
          )}

          <Link to="/cart" className="navbar-mobile-cart">
            🛒 Panier ({cartCount})
          </Link>

          {user && (
            <button type="button" className="navbar-mobile-logout" onClick={handleLogout}>
              Déconnexion
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
