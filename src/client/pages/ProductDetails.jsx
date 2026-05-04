import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import "./ProductDetails.css";
import { apiRequest, emitCartUpdated, getAuthSession } from "../../services/api.js";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const [failedRelatedImages, setFailedRelatedImages] = useState({});

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest("/products");
        const foundProduct = data.products?.find((item) => Number(item.id) === Number(id));

        if (!foundProduct) {
          setError("Produit introuvable");
          return;
        }

        setProduct(foundProduct);
        setImageFailed(false);
        setFailedRelatedImages({});

        const related = (data.products || [])
          .filter((item) => Number(item.id) !== Number(id))
          .slice(0, 3);

        setRelatedProducts(related);
      } catch (requestError) {
        setError(requestError.message || "Erreur serveur");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const addToCart = async () => {
    const { token } = getAuthSession();

    if (!token) {
      navigate("/login");
      return;
    }

    if (!product?.id) {
      alert("Produit invalide");
      return;
    }

    try {
      setAdding(true);

      const data = await apiRequest("/cart/add", {
        method: "POST",
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });

      emitCartUpdated(data.cart);
      alert("Produit ajoute au panier");
    } catch (requestError) {
      alert(requestError.message || "Erreur lors de l'ajout au panier");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="product-details-page">
        <Navbar />
        <main className="product-details-main">
          <div className="details-state-card">Chargement du produit...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-page">
        <Navbar />
        <main className="product-details-main">
          <div className="details-state-card details-error">
            <h2>{error || "Produit introuvable"}</h2>
            <Link to="/products">Retour au catalogue</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <Navbar />

      <main className="product-details-main">
        <section className="product-hero-details">
          <div className="product-details-image">
            {product.image && !imageFailed ? (
              <img
                src={product.image}
                alt={product.name}
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="product-details-placeholder">Image produit</div>
            )}
          </div>

          <div className="product-details-content">
            <span className="product-status">Disponible des maintenant</span>

            <h1>{product.name}</h1>

            <strong className="product-detail-price">
              {Number(product.price || 0).toFixed(2)} MAD
            </strong>

            <p className="product-detail-description">
              {product.description || "Aucune description disponible pour ce produit."}
            </p>

            <div className="product-detail-divider" />

            <div className="product-info-grid">
              <div>
                <span>Dimensions</span>
                <strong>{product.dimensions || "Non precise"}</strong>
              </div>

              <div>
                <span>Categorie</span>
                <strong>{product.categoryName || "Non classe"}</strong>
              </div>

              <div>
                <span>Stock</span>
                <strong>{Number(product.stock || 0)}</strong>
              </div>

              <div>
                <span>Reference</span>
                <strong>TR-{String(product.id).padStart(4, "0")}</strong>
              </div>
            </div>

            <div className="product-detail-actions">
              <button onClick={addToCart} disabled={adding}>
                {adding ? "Ajout..." : "Ajouter au panier"}
              </button>

              <Link to="/products">Retour au catalogue</Link>
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 ? (
          <section className="related-products-section">
            <div className="related-header">
              <p>Catalogue</p>
              <h2>Vous aimerez aussi</h2>
            </div>

            <div className="related-products-grid">
              {relatedProducts.map((item) => (
                <Link to={`/products/${item.id}`} className="related-product-card" key={item.id}>
                  {item.image && !failedRelatedImages[item.id] ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={() =>
                        setFailedRelatedImages((current) => ({
                          ...current,
                          [item.id]: true,
                        }))
                      }
                    />
                  ) : (
                    <div className="related-placeholder">Image produit</div>
                  )}

                  <div>
                    <h3>{item.name}</h3>
                    <p>{Number(item.price || 0).toFixed(2)} MAD</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}

export default ProductDetails;
