import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-shell">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-brand-top">
              <img src={logo} alt="Tufto Rino" className="footer-logo" />
              <div>
                <h2>Tufto Rino</h2>
                <span>Studio textile artisanal</span>
              </div>
            </div>

            <p>
              Tufto Rino imagine et réalise des tapis personnalisés au style audacieux, avec
              une finition artisanale pensée pour les intérieurs qui veulent marquer les
              esprits.
            </p>

            <div className="footer-socials">
              <a href="https://www.instagram.com/tufto_rino/" aria-label="Instagram">
                IG
              </a>
              <a href="https://www.tiktok.com/@tufto_rino" aria-label="TikTok">
                TT
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h3>Navigation</h3>
            <Link to="/">Accueil</Link>
            <Link to="/products">Produits</Link>
            <Link to="/custom-request">Conception sur mesure</Link>
            <Link to="/messages">Contact</Link>
            <Link to="/about">À propos</Link>
          </div>

          <div className="footer-column">
            <h3>Liens utiles</h3>
            <Link to="/cart">Panier</Link>
            <Link to="/login">Connexion</Link>
            <Link to="/cart">Mes commandes</Link>
          </div>

          <div className="footer-column">
            <h3>Contact</h3>
            <a href="mailto:support@tuftorino.com">tuftorino@gmail.com</a>
            <a href="https://wa.me/212646414016" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <span>Taza, Maroc</span>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Tufto Rino. Tous droits réservés.</p>
          <span>Conçu pour des tapis personnalisés, créatifs et durables.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
