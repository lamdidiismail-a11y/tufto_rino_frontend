import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import "./Checkout.css";
import { apiRequest, emitCartUpdated, getAuthSession } from "../../services/api.js";

function formatPrice(value) {
  return `${Number(value || 0).toFixed(2)} MAD`;
}

function Checkout() {
  const navigate = useNavigate();
  const session = getAuthSession();

  const [step, setStep] = useState(1);
  const [cart, setCart] = useState({
    items: [],
    summary: {
      subtotal: 0,
      total: 0,
      totalQuantity: 0,
      itemCount: 0,
    },
  });

  const [delivery, setDelivery] = useState({
    firstName: "",
    lastName: "",
    email: session.user?.email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("livraison");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
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

    loadCart();
  }, [navigate]);

  const handleChange = (event) => {
    setDelivery((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const validateDelivery = (event) => {
    event.preventDefault();

    if (cart.items.length === 0) {
      alert("Votre panier est vide.");
      return;
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const completeOrder = async () => {
    if (cart.items.length === 0) {
      alert("Votre panier est vide.");
      return;
    }

    try {
      setSubmitting(true);

      const orderItems = cart.items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.unitPrice,
        quantity: item.quantity,
      }));

      const data = await apiRequest("/checkout", {
        method: "POST",
        body: JSON.stringify({
          delivery,
          paymentMethod,
        }),
      });

      emitCartUpdated({
        items: [],
        summary: {
          subtotal: 0,
          total: 0,
          totalQuantity: 0,
          itemCount: 0,
        },
      });

      localStorage.setItem("lastOrderId", data.orderId);

      localStorage.setItem(
        "lastOrder",
        JSON.stringify({
          delivery,
          paymentMethod,
          items: orderItems,
        })
      );

      navigate("/order-success", {
        state: {
          orderId: data.orderId,
          order: {
            delivery,
            paymentMethod,
            items: orderItems,
          },
        },
      });
    } catch (error) {
      alert(error.message || "Impossible de valider la commande.");
    } finally {
      setSubmitting(false);
    }
  };

  const subtotal = Number(cart.summary?.subtotal || 0);
  const total = Number(cart.summary?.total || 0);

  return (
    <div className="checkout-page">
      <Navbar />

      <main className="checkout-main">
        <section className="checkout-left">
          {loading ? (
            <>
              <div className="checkout-title">
                <span>1</span>
                <h1>Chargement du panier</h1>
              </div>

              <p className="simulation-note">
                Préparation de votre résumé de commande...
              </p>
            </>
          ) : step === 1 ? (
            <>
              <div className="checkout-title">
                <span>1</span>
                <h1>Adresse de livraison</h1>
              </div>

              <form className="checkout-form" onSubmit={validateDelivery}>
                <div className="form-grid">
                  <label>
                    Prénom *
                    <input
                      name="firstName"
                      value={delivery.firstName}
                      onChange={handleChange}
                      placeholder="Votre prenom"
                      required
                    />
                  </label>

                  <label>
                    Nom de famille *
                    <input
                      name="lastName"
                      value={delivery.lastName}
                      onChange={handleChange}
                      placeholder="Votre nom"
                      required
                    />
                  </label>
                </div>

                <label>
                  E-mail *
                  <input
                    type="email"
                    name="email"
                    value={delivery.email}
                    onChange={handleChange}
                    placeholder="email@gmail.com"
                    required
                  />
                </label>

                <label>
                  Téléphone *
                  <input
                    name="phone"
                    value={delivery.phone}
                    onChange={handleChange}
                    placeholder="+212 600 000 000"
                    required
                  />
                </label>

                <label>
                  Adresse *
                  <input
                    name="address"
                    value={delivery.address}
                    onChange={handleChange}
                    placeholder="Rue, quartier, numéro..."
                    required
                  />
                </label>

                <div className="form-grid">
                  <label>
                    Ville *
                    <input
                      name="city"
                      value={delivery.city}
                      onChange={handleChange}
                      placeholder="Votre ville"
                      required
                    />
                  </label>

                  <label>
                    Code postal
                    <input
                      name="postalCode"
                      value={delivery.postalCode}
                      onChange={handleChange}
                      placeholder="35000"
                    />
                  </label>
                </div>

                <button type="submit" className="checkout-primary-btn">
                  Valider l’adresse
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="checkout-title">
                <span>2</span>
                <h1>Mode de paiement</h1>
              </div>

              <div className="payment-methods">
                <label
                  className={`payment-card ${
                    paymentMethod === "livraison" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "livraison"}
                    onChange={() => setPaymentMethod("livraison")}
                  />

                  <div>
                    <strong>Paiement à la livraison</strong>
                    <p>
                      Le règlement sera effectué à la réception de votre commande.
                    </p>
                  </div>
                </label>

                <label
                  className={`payment-card ${
                    paymentMethod === "cmi" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "cmi"}
                    onChange={() => setPaymentMethod("cmi")}
                  />

                  <div>
                    <strong>CMI</strong>
                    <p>Paiement sécurisé simulé pour le projet.</p>
                  </div>
                </label>
              </div>

              {paymentMethod === "cmi" ? (
                <div className="card-box">
                  <input placeholder="Numéro de carte" />

                  <div className="form-grid">
                    <input placeholder="MM/AA" />
                    <input placeholder="CVC" />
                  </div>

                  <p className="simulation-note">
                    Cette étape reste une simulation. La commande sera créée en
                    base de données.
                  </p>
                </div>
              ) : null}

              <div className="checkout-buttons">
                <button
                  type="button"
                  className="checkout-secondary-btn"
                  onClick={() => setStep(1)}
                  disabled={submitting}
                >
                  Retour
                </button>

                <button
                  type="button"
                  className="checkout-primary-btn"
                  onClick={completeOrder}
                  disabled={submitting}
                >
                  {submitting ? "Confirmation..." : "Confirmer la commande"}
                </button>
              </div>
            </>
          )}
        </section>

        <aside className="checkout-summary">
          <h2>Résumé de la commande</h2>

          <div className="summary-products">
            {loading ? (
              <p>Chargement du panier...</p>
            ) : cart.items.length === 0 ? (
              <p>Votre panier est vide.</p>
            ) : (
              cart.items.map((item) => (
                <div className="summary-product" key={item.id}>
                  <span>
                    {item.product.name} ({item.quantity}x)
                  </span>

                  <strong>{formatPrice(item.lineTotal)}</strong>
                </div>
              ))
            )}
          </div>

          <div className="summary-line" />

          <div className="summary-row">
            <span>Total articles</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>

          <div className="summary-row">
            <span>Expédition</span>
            <strong>Gratuit</strong>
          </div>

          <div className="summary-row">
            <span>Quantité</span>
            <strong>{cart.summary?.totalQuantity || 0}</strong>
          </div>

          <div className="summary-line" />

          <div className="summary-total">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
}

export default Checkout;
