import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, saveAuthSession } from "../../services/api.js";
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
      const data = await apiRequest("/login", {
        method: "POST",

        body: JSON.stringify({ email, password }),
      });
      
      saveAuthSession({
        user: data.user,
        token: data.token,
      });

      navigate(data.user.role === "admin" ? "/admin" : "/");
    } catch (error) {
      alert(error.message || "Erreur serveur");
    }
  };

  return (

    <>
      <Navbar />

      <div className="login-page">
        <div className="login-container">
          <div className="login-left">
            <h1>Connexion</h1>
            <p>Accedez a votre espace Tufto Rino</p>

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
              Pas de compte ? <Link to="/register">Creer un compte</Link>
            </p>
          </div>

          <div className="login-right">
            <div className="login-brand">
              <h2>Tufto Rino</h2>
              <p>Creation de tapis personnalises haut de gamme</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Login;
