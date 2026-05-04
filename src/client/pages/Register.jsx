import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { apiRequest } from "../../services/api.js";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const data = await apiRequest("/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      if (data.success) {
        alert(data.message);
        navigate("/login");
        return;
      }

      alert(data.message);
    } catch (error) {
      alert(error.message || "Erreur serveur");
    }
  };

  return (
    <>
      <Navbar />

      <div className="register-page">
        <div className="register-container">
          <div className="register-left">
            <h1>Inscription</h1>
            <p>Creez votre compte Tufto Rino</p>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Nom complet</label>
                <input
                  type="text"
                  placeholder="Votre nom complet"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="email@gmail.com"
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

              <button type="submit" className="register-btn">
                S'inscrire
              </button>
            </form>

            <p className="register-footer">
              Deja un compte ? <Link to="/login">Se connecter</Link>
            </p>
          </div>

          <div className="register-right">
            <div className="brand-box">
              <h2>Tufto Rino</h2>
              <p>Creation de tapis personnalises premium</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Register;
