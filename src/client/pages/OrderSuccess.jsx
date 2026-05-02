import { useEffect, useState } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api.js";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import "./OrderSuccess.css";

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [dbOrder, setDbOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    const loadOrderFromDb = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await apiRequest(`/my-orders/${id}`);
        setDbOrder(data.order);
      } catch (error) {
        if (error.status === 401) {
          navigate("/login");
          return;
        }

        alert(error.message || "Impossible de charger cette facture.");
      } finally {
        setLoading(false);
      }
    };

    loadOrderFromDb();
  }, [id, navigate]);

  const localOrder =
    location.state?.order ||
    JSON.parse(localStorage.getItem("lastOrder") || "{}");

  const order = dbOrder || localOrder;

  const orderId =
    dbOrder?.id ||
    location.state?.orderId ||
    localStorage.getItem("lastOrderId") ||
    "N/A";

  const items = order.items || [];
  const delivery = order.delivery || {};
  const paymentMethod = order.paymentMethod || "livraison";

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("fr-FR")
    : new Date().toLocaleDateString("fr-FR");

  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price || item.unitPrice || 0);
    const quantity = Number(item.quantity || 1);
    return sum + price * quantity;
  }, 0);

  const tax = subtotal * 0.1;
  const shipping = 0;

  const totalFromDb = Number(order.total || 0);
  const total = totalFromDb > 0 ? totalFromDb : subtotal + tax + shipping;

  const printInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="invoice-page">
        <Navbar />

        <main className="invoice-main">
          <section className="invoice-card">
            <h1>Chargement de la facture...</h1>
            <p>Veuillez patienter quelques secondes.</p>
          </section>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="invoice-page">
      <Navbar />

      <main className="invoice-main">
        <section className="invoice-card" id="invoice">
          <div className="invoice-header">
            <div>
              <span className="invoice-badge">Commande validée</span>
              <h1>Facture</h1>
              <p>Merci pour votre achat chez Tufto Rino.</p>
            </div>

            <div className="invoice-brand">
              <h2>Tufto Rino</h2>
              <p>Création de tapis personnalisés</p>
            </div>
          </div>

          <div className="invoice-meta">
            <div>
              <span>Référence</span>
              <strong>#{orderId}</strong>
            </div>

            <div>
              <span>Date</span>
              <strong>{orderDate}</strong>
            </div>

            <div>
              <span>Paiement</span>
              <strong>
                {paymentMethod === "cmi" ? "CMI" : "Paiement à la livraison"}
              </strong>
            </div>
          </div>

          <div className="invoice-info-grid">
            <div className="invoice-box">
              <h3>Client</h3>
              <p>
                {delivery.firstName || "Client"} {delivery.lastName || ""}
              </p>
              <p>{delivery.email || "—"}</p>
              <p>{delivery.phone || "—"}</p>
            </div>

            <div className="invoice-box">
              <h3>Adresse de livraison</h3>
              <p>{delivery.address || "—"}</p>
              <p>
                {delivery.city || "—"} {delivery.postalCode || ""}
              </p>
            </div>
          </div>

          <div className="invoice-table-wrap">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {items.length > 0 ? (
                  items.map((item, index) => {
                    const price = Number(item.price || item.unitPrice || 0);
                    const quantity = Number(item.quantity || 1);

                    return (
                      <tr key={item.id || index}>
                        <td>{item.name || item.product?.name || "Produit"}</td>
                        <td>{quantity}</td>
                        <td>{price.toFixed(2)} MAD</td>
                        <td>{(price * quantity).toFixed(2)} MAD</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="empty-invoice">
                      Aucun produit trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="invoice-total-box">
            <div>
              <span>Sous-total</span>
              <strong>{subtotal.toFixed(2)} MAD</strong>
            </div>

            <div>
              <span>Livraison</span>
              <strong>
                {shipping === 0 ? "Gratuit" : `${shipping.toFixed(2)} MAD`}
              </strong>
            </div>

            <div>
              <span>Taxe (10%)</span>
              <strong>{tax.toFixed(2)} MAD</strong>
            </div>

            <div className="invoice-grand-total">
              <span>Total</span>
              <strong>{total.toFixed(2)} MAD</strong>
            </div>
          </div>

          <div className="invoice-footer">
            <p>
              Votre commande a bien été enregistrée et sera traitée par l’équipe
              Tufto Rino dans les meilleurs délais.
            </p>
          </div>
        </section>

        <div className="invoice-actions">
          <button onClick={printInvoice}>Imprimer la facture</button>
          <Link to="/cart">Mes commandes</Link>
          <Link to="/products">Continuer vos achats</Link>
          <Link to="/">Retour à l’accueil</Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default OrderSuccess;