import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import "./MyCustomRequests.css";
import { apiRequest, getAuthSession } from "../../services/api.js";

function formatDate(value) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatStatus(status) {
  const labels = {
    pending: "En attente",
    discussion: "En discussion",
    approved: "Approuvée",
    rejected: "Refusée",
    production: "En production",
    done: "Terminée",
  };

  return labels[status] || status;
}

function MyCustomRequests() {
  const navigate = useNavigate();
  const { token } = getAuthSession();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const loadRequests = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const data = await apiRequest("/custom-requests/my");
        setRequests(data.customRequests || []);
      } catch (error) {
        if (error.status === 401) {
          navigate("/login");
          return;
        }

        setErrorMessage(error.message || "Impossible de charger vos demandes.");
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [navigate, token]);

  return (
    <div className="my-custom-requests-page">
      <Navbar />

      <main className="my-custom-requests-main">
        <section className="my-custom-requests-card">
          <div className="my-custom-requests-header">
            <div>
              <p>Demandes sur mesure</p>
              <h1>Mes demandes personnalisées</h1>
              <span>Retrouvez ici toutes les demandes de tapis enregistrées sur votre compte.</span>
            </div>

            <Link to="/custom-request" className="new-request-link">
              Nouvelle demande
            </Link>
          </div>

          {loading ? (
            <div className="requests-state">
              <h2>Chargement...</h2>
              <p>Nous récupérons vos demandes enregistrées.</p>
            </div>
          ) : errorMessage ? (
            <div className="requests-state requests-error">
              <h2>Une erreur est survenue</h2>
              <p>{errorMessage}</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="requests-state">
              <h2>Aucune demande pour le moment</h2>
              <p>Créez votre première demande personnalisée pour commencer.</p>
            </div>
          ) : (
            <div className="requests-grid">
              {requests.map((request) => (
                <article className="request-card" key={request.id}>
                  {request.imageUrl ? (
                    <img src={request.imageUrl} alt={request.title} className="request-image" />
                  ) : (
                    <div className="request-image-placeholder">Aucune image</div>
                  )}

                  <div className="request-body">
                    <div className="request-topline">
                      <span className={`request-status status-${request.status}`}>
                        {formatStatus(request.status)}
                      </span>
                      <small>{formatDate(request.createdAt)}</small>
                    </div>

                    <h2>{request.title}</h2>
                    <p>{request.description}</p>

                    <div className="request-meta">
                      <span>
                        <strong>Dimensions :</strong> {request.dimensions}
                      </span>
                      <span>
                        <strong>Couleurs :</strong> {request.colors || "Non renseignées"}
                      </span>
                      <span>
                        <strong>Budget :</strong> {request.budget || "Non renseigné"}
                      </span>
                      <span>
                        <strong>Téléphone :</strong> {request.phone}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default MyCustomRequests;
