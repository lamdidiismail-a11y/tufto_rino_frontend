import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (data.success) {
        alert(data.message);
        navigate("/login"); // redirect login
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Erreur serveur ❌");
    }
  };

  return (
    <>
        <Navbar />
        <div className="register-page">
        <div className="register-container">
            <div className="register-left">
            <h1>Inscription</h1>
            <p>Créez votre compte Tufto Rino</p>

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                <label>Nom complet</label>
                <input
                    type="text"
                    placeholder="Ismail Lamdidi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                </div>

                <div className="input-group">
                <label>Email</label>
                <input
                    type="email"
                    placeholder="email@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                </div>

                <div className="input-group">
                <label>Mot de passe</label>
                <input
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                </div>

                <button type="submit" className="register-btn">
                S'inscrire
                </button>
            </form>

            <p className="register-footer">
                Déjà un compte ? <a href="/login">Se connecter</a>
            </p>
            </div>

            <div className="register-right">
            <div className="brand-box">
                <h2>Tufto Rino</h2>
                <p>Création de tapis personnalisés premium</p>
            </div>
            </div>
        </div>
        </div>
        <Footer/>
    </>
  );
}

export default Register;