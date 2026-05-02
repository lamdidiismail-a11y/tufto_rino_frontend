import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import "./Cart.css";
import { apiRequest, emitCartUpdated } from "../../services/api.js";

function formatPrice(value) {
  return `${Number(value || 0).toFixed(2)} MAD`;
}

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function Cart() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("cart");

  const [cart, setCart] = useState({
    items: [],
    summary: {
      subtotal: 0,
      total: 0,
      totalQuantity: 0,
      itemCount: 0,
    },
  });

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [pendingItemId, setPendingItemId] = useState(null);

  const loadCart = async () => {
    try {
      setLoading(true);

      const data = await apiRequest("/cart");

      setCart(data.cart);
      emitCartUpdated(data.cart);
    } catch (error) {
      if (error.status === 401) {
        navigate("/login");
      } else {
        alert(error.message || "Impossible de charger le panier.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);

      const data = await apiRequest("/my-orders");

      setOrders(data.orders || []);
    } catch (error) {
      if (error.status === 401) {
        navigate("/login");
      } else {
        alert(error.message || "Impossible de charger vos commandes.");
      }
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    if (activeTab === "orders") {
      loadOrders();
    }
  }, [activeTab]);

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) {
      return;
    }

    try {
      setPendingItemId(itemId);

      const data = await apiRequest(`/cart/items/${itemId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity }),
      });

      setCart(data.cart);
      emitCartUpdated(data.cart);
    } catch (error) {
      alert(error.message || "Impossible de mettre à jour la quantité.");
    } finally {
      setPendingItemId(null);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setPendingItemId(itemId);

      const data = await apiRequest(`/cart/items/${itemId}`, {
        method: "DELETE",
      });

      setCart(data.cart);
      emitCartUpdated(data.cart);
    } catch (error) {
      alert(error.message || "Impossible de supprimer cet article.");
    } finally {
      setPendingItemId(null);
    }
  };

  const items = cart.items || [];
  const subtotal = Number(cart.summary?.subtotal || 0);
  const total = Number(cart.summary?.total || 0);
  const isEmpty = items.length === 0;

  const totalLabel = useMemo(() => formatPrice(total), [total]);

  return (
    <div className="cart-page">
      <Navbar />

      <main className="cart-main">
        <section className="cart-header">
          <p>Espace client</p>
          <h1>{activeTab === "cart" ? "Votre panier" : "Mes commandes"}</h1>
        </section>

        <div className="cart-tabs">
          <button
            type="button"
            className={activeTab === "cart" ? "active" : ""}
            onClick={() => setActiveTab("cart")}
          >
            Panier
          </button>

          <button
            type="button"
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => setActiveTab("orders")}
          >
            Mes commandes
          </button>
        </div>

        {activeTab === "cart" ? (
          <section className="cart-layout">
            <div className="cart-left">
              {loading ? (
                <div className="cart-empty">
                  <h2>Chargement du panier...</h2>
                </div>
              ) : isEmpty ? (
                <div className="cart-empty">
                  <h2>Votre panier est vide</h2>
                  <p>Ajoutez des tapis depuis le catalogue pour les voir ici.</p>

                  <Link to="/products" className="continue-btn">
                    Continuer vos achats
                  </Link>
                </div>
              ) : (
                <>
                  {items.map((item) => (
                    <article className="cart-item" key={item.id}>
                      <div className="cart-img">
                        {item.product.image ? (
                          <img src={item.product.image} alt={item.product.name} />
                        ) : (
                          <span>Image tapis</span>
                        )}
                      </div>

                      <div className="cart-info">
                        <h3>{item.product.name}</h3>
                        <p>
                          {item.product.categoryName || "Tapis premium"} • Tufto Rino
                        </p>

                        <div className="qty-row">
                          <span>Quantité :</span>

                          <div className="qty-control">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={
                                item.quantity <= 1 || pendingItemId === item.id
                              }
                            >
                              -
                            </button>

                            <strong>{item.quantity}</strong>

                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={pendingItemId === item.id}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="cart-price">
                        <h3>{formatPrice(item.lineTotal)}</h3>
                        <p>{formatPrice(item.unitPrice)} chacun</p>

                        <button
                          className="delete-btn"
                          onClick={() => removeItem(item.id)}
                          disabled={pendingItemId === item.id}
                        >
                          🗑
                        </button>
                      </div>
                    </article>
                  ))}

                  <Link to="/products" className="continue-shopping">
                    Continuer vos achats
                  </Link>
                </>
              )}
            </div>

            <aside className="cart-summary">
              <h2>Résumé de la commande</h2>

              <div className="summary-row">
                <span>Total articles</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>

              <div className="summary-row">
                <span>Expédition</span>
                <strong>Gratuit</strong>
              </div>

              <div className="summary-row">
                <span>Quantité totale</span>
                <strong>{cart.summary?.totalQuantity || 0}</strong>
              </div>

              <div className="summary-line"></div>

              <div className="summary-total">
                <span>Total</span>
                <strong>{totalLabel}</strong>
              </div>

              <Link to="/checkout" className="summary-link">
                Passer à la caisse
              </Link>

              <button
                type="button"
                className="summary-link summary-link-button"
                onClick={() => setActiveTab("orders")}
              >
                Mes commandes
              </button>

              <Link to="/products" className="summary-link">
                Continuer vos achats
              </Link>
            </aside>
          </section>
        ) : (
          <section className="orders-panel">
            {ordersLoading ? (
              <div className="cart-empty">
                <h2>Chargement de vos commandes...</h2>
              </div>
            ) : orders.length === 0 ? (
              <div className="cart-empty">
                <h2>Aucune commande trouvée</h2>
                <p>Vous n’avez pas encore passé de commande.</p>

                <Link to="/products" className="continue-btn">
                  Voir le catalogue
                </Link>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <article className="order-card" key={order.id}>
                    <div>
                      <span className="order-ref">Commande #{order.id}</span>
                      <h3>{formatPrice(order.total)}</h3>
                      <p>{formatDate(order.createdAt)}</p>
                    </div>

                    <div className="order-meta">
                      <span>{order.itemCount} produit(s)</span>
                      <span>Statut : {order.status}</span>
                      <span>
                        Paiement :{" "}
                        {order.paymentMethod === "cmi"
                          ? "CMI"
                          : "Paiement à la livraison"}
                      </span>
                      <span>Paiement status : {order.paymentStatus || "—"}</span>
                    </div>

                    <Link
                      to={`/order-success/${order.id}`}
                      className="invoice-btn"
                    >
                      Voir facture
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Cart;