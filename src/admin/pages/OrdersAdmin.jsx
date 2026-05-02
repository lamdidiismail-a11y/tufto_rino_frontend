import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../services/api.js";
import "./OrdersAdmin.css";

const filters = [
  { value: "all", label: "Toutes" },
  { value: "pending", label: "En attente" },
  { value: "paid", label: "Payées" },
  { value: "shipped", label: "Expédiées" },
];

const statusOptions = [
  { value: "pending", label: "En attente" },
  { value: "paid", label: "Payée" },
  { value: "shipped", label: "Expédiée" },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MAD",
  }).format(Number(value || 0));
}

function formatDate(value) {
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

function formatStatusLabel(status) {
  const option = statusOptions.find((item) => item.value === status);
  return option?.label || status;
}

function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingOrderId, setPendingOrderId] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest("/orders");
      setOrders(data.orders);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (filter === "all") {
      return orders;
    }

    return orders.filter((order) => order.status === filter);
  }, [filter, orders]);

  const handleStatusChange = async (orderId, status) => {
    try {
      setPendingOrderId(orderId);
      setError("");
      await apiRequest(`/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? { ...order, status } : order))
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPendingOrderId(null);
    }
  };

  return (
    <div className="orders-admin-page">
      <section className="table-card">
        <div className="table-card-header table-card-header-stack">
          <div>
            <p className="section-eyebrow">Gestion</p>
            <h3>Commandes</h3>
          </div>

          <div className="filter-row">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`filter-pill${filter === item.value ? " active" : ""}`}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        {loading ? (
          <div className="admin-state-card">Chargement des commandes...</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Mettre à jour</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.client}</strong>
                        <span className="table-subtext">
                          {order.summary} • {formatOrderType(order.orderType)}
                        </span>
                      </td>
                      <td>{formatCurrency(order.total)}</td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>
                          {formatStatusLabel(order.status)}
                        </span>
                      </td>
                      <td>{formatDate(order.date)}</td>
                      <td>
                        <select
                          className="status-select"
                          value={order.status}
                          onChange={(event) => handleStatusChange(order.id, event.target.value)}
                          disabled={pendingOrderId === order.id}
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
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
        )}
      </section>
    </div>
  );
}

export default OrdersAdmin;
