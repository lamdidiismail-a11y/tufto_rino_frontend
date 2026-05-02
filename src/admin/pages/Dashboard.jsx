import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api.js";
import "./Dashboard.css";

const statCards = [
  { key: "totalProducts", title: "Total produits", note: "Catalogue actif" },
  { key: "totalOrders", title: "Total commandes", note: "Flux commercial" },
  { key: "totalUsers", title: "Total utilisateurs", note: "Comptes inscrits" },
  { key: "totalCustomRequests", title: "Demandes personnalisées", note: "Projets sur mesure" },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MAD",
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatOrderType(type) {
  if (type === "custom") {
    return "Sur mesure";
  }

  return "Catalogue";
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [latestOrders, setLatestOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await apiRequest("/admin/dashboard");
        setStats(data.stats);
        setLatestOrders(data.latestOrders);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <div className="admin-state-card">Chargement du tableau de bord...</div>;
  }

  if (error) {
    return <div className="admin-state-card admin-state-error">{error}</div>;
  }

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero panel-card">
        <div className="dashboard-hero-copy">
          <p className="section-eyebrow">Vue d’ensemble</p>
          <h2>Tableau de bord</h2>
          <p className="section-copy">
            Pilotez votre activité Tufto Rino avec une interface premium, pensée pour le
            suivi des produits, commandes, utilisateurs et créations personnalisées.
          </p>
        </div>
      </section>

      <section className="stats-grid">
        {statCards.map((card) => (
          <article key={card.key} className="stat-card">
            <div className="stat-head">
              <p className="stat-label">{card.title}</p>
              <span className="stat-chip">{card.note}</span>
            </div>
            <strong className="stat-value">{stats?.[card.key] ?? 0}</strong>
          </article>
        ))}
      </section>

      <section className="table-card">
        <div className="table-card-header">
          <div>
            <p className="section-eyebrow">Commandes récentes</p>
            <h3>Les 5 dernières commandes</h3>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Type</th>
                <th>Total</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {latestOrders.length > 0 ? (
                latestOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.client}</strong>
                      <span className="table-subtext">{order.summary}</span>
                    </td>
                    <td>{formatOrderType(order.orderType)}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{formatDate(order.date)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-row">
                    Aucune commande trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
