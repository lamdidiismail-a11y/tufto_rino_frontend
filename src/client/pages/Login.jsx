import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, saveAuthSession } from "../../services/api.js";
import "./Login.css";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Email ou mot de passe incorrect");
        return;
      }

      saveAuthSession({
        user: data.user,
        token: data.token,
      });

      navigate(data.user.role === "admin" ? "/admin" : "/");
    } catch (error) {
      console.error(error);
      alert("Erreur serveur");
    }
  };

  return (
      
    <>
      <Navbar />

      <div className="login-page">
        <div className="login-container">
          <div className="login-left">
            <h1>Connexion</h1>
            <p>Accédez à votre espace Tufto Rino</p>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="exemple@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <button type="submit" className="login-btn">
                Se connecter
              </button>
            </form>

            <p className="login-footer">
              Pas de compte ? <a href="/register">Créer un compte</a>
            </p>
          </div>

          <div className="login-right">
            <div className="login-brand">
              <h2>Tufto Rino</h2>
              <p>Création de tapis personnalisés haut de gamme</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Login;
