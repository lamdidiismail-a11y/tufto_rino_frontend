import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import "./Products.css";
import { apiRequest, emitCartUpdated, getAuthSession } from "../../services/api.js";

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [addingProductId, setAddingProductId] = useState(null);
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    apiRequest("/products")
      .then((data) => {
        if (data.success) {
          setProducts(data.products);
          setFiltered(data.products);
        }
      })
      .catch((error) => console.error("Erreur produits:", error));
  }, []);

  useEffect(() => {
    let result = [...products];

    if (search) {
      const text = search.toLowerCase();
      result = result.filter(
        (product) =>
          product.name?.toLowerCase().includes(text) ||
          product.description?.toLowerCase().includes(text) ||
          product.category_name?.toLowerCase().includes(text)
      );
    }

    if (maxPrice) {
      result = result.filter((product) => Number(product.price) <= Number(maxPrice));
    }

    if (category) {
      result = result.filter(
        (product) => product.category_name?.toLowerCase() === category.toLowerCase()
      );
    }

    setFiltered(result);
  }, [search, maxPrice, category, products]);

  const addToCart = async (productId) => {
    const { token } = getAuthSession();

    if (!token) {
      navigate("/login");
      return;
    }

    if (!productId) {
      alert("Produit invalide");
      return;
    }

    setAddingProductId(productId);

    try {
      const data = await apiRequest("/cart/add", {
        method: "POST",
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      emitCartUpdated(data.cart);
      alert("Produit ajouté au panier");
    } catch (error) {
      console.error(error);
      alert(error.message || "Erreur serveur");
    } finally {
      setAddingProductId(null);
    }
  };

  const categories = [...new Set(products.map((product) => product.category_name).filter(Boolean))];

  return (
    <div className="products-page">
      <Navbar />

      <main className="products-main">
        <section className="products-header">
          <p className="section-subtitle">Catalogue</p>
          <h1>Découvrez nos tapis</h1>
          <p>Explorez nos créations et trouvez le tapis idéal pour votre espace.</p>
        </section>

        <section className="filter-bar">
          <input
            type="text"
            placeholder="Rechercher par nom..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <input
            type="number"
            placeholder="Prix maximum"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          />

          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">Toutes les catégories</option>
            {categories.map((cat) => (
              <option value={cat} key={cat}>
                {cat}
              </option>
            ))}
          </select>
        </section>

        <section className="products-grid">
          {filtered.length > 0 ? (
            filtered.map((product) => (
              <Link to={`/products/${product.id}`} className="product-card" key={product.id}>
                <div className="product-image-box">
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    <div className="fake-img">Image tapis</div>
                  )}

                  <button
                    className="add-cart-btn"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      addToCart(product.id);
                    }}
                    disabled={addingProductId === product.id}
                  >
                    {addingProductId === product.id ? "Ajout..." : "Ajouter au panier"}
                  </button>
                </div>

                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p>{product.category_name || "Sans catégorie"}</p>
                  <p>{product.dimensions || "Dimensions sur demande"}</p>
                  <p>{Number(product.price || 0).toFixed(2)} MAD</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="empty-products">Aucun produit trouvé.</p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Products;
