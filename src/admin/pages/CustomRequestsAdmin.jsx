import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api.js";
import "./CustomRequestsAdmin.css";

function formatDate(value) {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function CustomRequestsAdmin() {
  const navigate = useNavigate();
  const [customRequests, setCustomRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openingConversationId, setOpeningConversationId] = useState(null);

  const loadCustomRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest("/admin/custom-requests");
      setCustomRequests(data.customRequests || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomRequests();
  }, []);

  const handleOpenConversation = async (customRequest) => {
    try {
      setOpeningConversationId(customRequest.id);
      setError("");

      if (customRequest.conversationId) {
        navigate(`/admin/messages?conversation=${customRequest.conversationId}`);
        return;
      }

      const data = await apiRequest(`/admin/custom-requests/${customRequest.id}/open-conversation`, {
        method: "POST",
      });

      await loadCustomRequests();
      navigate(`/admin/messages?conversation=${data.conversation.id}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setOpeningConversationId(null);
    }
  };

  return (
    <div className="custom-requests-admin-page">
      <section className="table-card">
        <div className="table-card-header table-card-header-stack">
          <div>
            <p className="section-eyebrow">Demandes personnalisées</p>
            <h3>Suivi client sur mesure</h3>
          </div>
          <p className="section-copy">
            Consultez les demandes envoyées par les clients et ouvrez rapidement une conversation
            dédiée pour les accompagner.
          </p>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        {loading ? (
          <div className="admin-state-card">Chargement des demandes personnalisées...</div>
        ) : customRequests.length > 0 ? (
          <section className="custom-requests-grid">
            {customRequests.map((request) => (
              <article className="custom-request-card" key={request.id}>
                <div className="custom-request-card-head">
                  <div>
                    <p className="custom-request-ref">Demande #{request.id}</p>
                    <h4>{request.title}</h4>
                  </div>
                  <span className={`status-badge status-${request.status || "pending"}`}>
                    {request.status || "pending"}
                  </span>
                </div>

                <div className="custom-request-client">
                  <strong>{request.client?.name || "Client inconnu"}</strong>
                  <span>{request.client?.email || "--"}</span>
                </div>

                {request.imageUrl ? (
                  <img
                    src={request.imageUrl}
                    alt={request.title}
                    className="custom-request-image"
                  />
                ) : null}

                <p className="custom-request-description">{request.description}</p>

                <div className="custom-request-details">
                  <p>
                    <span>Dimensions</span>
                    <strong>{request.dimensions || "--"}</strong>
                  </p>
                  <p>
                    <span>Couleurs</span>
                    <strong>{request.colors || "--"}</strong>
                  </p>
                  <p>
                    <span>Budget</span>
                    <strong>{request.budget || "--"}</strong>
                  </p>
                  <p>
                    <span>Téléphone</span>
                    <strong>{request.phone || "--"}</strong>
                  </p>
                  <p>
                    <span>Créée le</span>
                    <strong>{formatDate(request.createdAt)}</strong>
                  </p>
                  <p>
                    <span>Conversation</span>
                    <strong>{request.conversationId ? `#${request.conversationId}` : "Aucune"}</strong>
                  </p>
                </div>

                <div className="custom-request-actions">
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => handleOpenConversation(request)}
                    disabled={openingConversationId === request.id}
                  >
                    {openingConversationId === request.id
                      ? "Ouverture..."
                      : "Ouvrir conversation"}
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="admin-state-card">Aucune demande personnalisée trouvée.</div>
        )}
      </section>
    </div>
  );
}

export default CustomRequestsAdmin;
