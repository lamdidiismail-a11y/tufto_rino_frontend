import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import "./Home.css";
import { apiRequest } from "../../services/api.js";
import heroImage from "../../assets/zoro.png";

function Home() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await apiRequest("/products");
        setProducts((data.products || []).slice(0, 3));
      } catch (error) {
        console.error("Erreur chargement produits:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div className="home-page">
      <Navbar />

      <main>
        <section className="hero-section" id="home">
          <div className="hero-copy">
            <span className="eyebrow">Tapis sur mesure de luxe</span>
            <h1>Transformez votre idée en tapis unique.</h1>
            <p>
              Tufto Rino crée des tapis premium avec un fini artistique, adaptés à votre
              conception et tissés pour une expérience domestique élégante.
            </p>
            <div className="hero-actions">
              <a href="#products" className="btn btn-primary">
                Acheter maintenant
              </a>
              <Link to="/custom-request" className="btn btn-secondary">
                Personnaliser
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card hero-card-large">
              <div className="hero-card-content">
                <div className="hero-card-label">Collections personnalisées</div>
                <div className="hero-card-copy">Tapis artisanaux façonnés selon votre vision.</div>
              </div>
              <img src={heroImage} alt="Tapis artistique Tufto Rino" className="hero-card-image" />
            </div>
            <div className="hero-pill hero-pill-left">Textures créatives</div>
            <div className="hero-pill hero-pill-right">Finition artisanale</div>
          </div>
        </section>

        <section className="highlights-section">
          <div className="section-intro">
            <p className="section-subtitle">Expérience vedette</p>
            <h2>Découvrez ce qui rend Tufto Rino exceptionnel.</h2>
          </div>

          <div className="highlight-grid">
            <article className="highlight-card">
              <h3>Tapis faits main</h3>
              <p>Textures raffinées, matériaux naturels et finition premium.</p>
            </article>
            <article className="highlight-card">
              <h3>Tapis sur mesure</h3>
              <p>Transformez votre conception en tapis original créé pour vous.</p>
            </article>
            <article className="highlight-card">
              <h3>Collections modernes</h3>
              <p>Pièces sélectionnées avec élégance contemporaine et détails luxueux.</p>
            </article>
            <article className="highlight-card">
              <h3>Conceptions uniques</h3>
              <p>Compositions audacieuses qui subliment les intérieurs.</p>
            </article>
          </div>
        </section>

        <section className="why-section" id="about">
          <div className="why-copy">
            <p className="section-subtitle">Pourquoi nous choisir</p>
            <h2>Qualité premium avec une touche personnelle raffinée.</h2>
            <p>
              Tufto Rino allie un artisanat sur mesure avec un support réactif pour offrir
              une expérience tapis digne des intérieurs modernes.
            </p>
          </div>

          <div className="why-list">
            <div className="why-card">
              <h3>Matériaux de luxe</h3>
              <p>Fibres douces et durables sélectionnées pour un confort élégant.</p>
            </div>
            <div className="why-card">
              <h3>Création sur mesure</h3>
              <p>Commandes personnalisées autour de votre design, couleur et taille.</p>
            </div>
            <div className="why-card">
              <h3>Commande sécurisée</h3>
              <p>Paiement fiable et service client attentif.</p>
            </div>
            <div className="why-card">
              <h3>Direction artistique</h3>
              <p>Conseils de conception pour un résultat raffiné.</p>
            </div>
          </div>
        </section>

        <section className="custom-section" id="custom">
          <div className="custom-content">
            <div>
              <p className="section-subtitle">Conception sur mesure</p>
              <h2>Donnez vie à votre concept de tapis.</h2>
              <p>
                Partagez votre croquis, inspiration ou oeuvre existante et recevez un tapis
                artisanal conçu pour votre espace.
              </p>
            </div>
            <Link to="/custom-request" className="btn btn-primary wide-btn">
              Commencez votre tapis sur mesure
            </Link>
          </div>

          <div className="custom-visual">
            <div className="custom-visual-card">
              <span>Téléchargez votre conception</span>
              <p>Support personnalisé du concept à la finition.</p>
            </div>
          </div>
        </section>

        <section className="products-section" id="products">
          <div className="section-header">
            <p className="section-subtitle">Tapis vedettes</p>
            <h2>Produits récents depuis la base de données.</h2>
          </div>

          <div className="product-grid">
            {loadingProducts ? (
              <p>Chargement des produits...</p>
            ) : products.length > 0 ? (
              products.map((product) => (
                <article className="product-card" key={product.id}>
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="product-real-image" />
                  ) : (
                    <div className="product-image product-image-1" aria-hidden="true" />
                  )}

                  <div className="product-copy">
                    <h3>{product.name}</h3>
                    <p>{product.category_name || "Sans catégorie"}</p>
                    <p>{product.dimensions || "Dimensions sur demande"}</p>
                    <p>{Number(product.price || 0).toFixed(2)} DH</p>
                    <a href={`/products/${product.id}`} className="btn btn-link">
                      Voir les détails
                    </a>
                  </div>
                </article>
              ))
            ) : (
              <p>Aucun produit trouvé.</p>
            )}
          </div>
        </section>

        <section className="testimonials-section">
          <div className="testimonial-card">
            <p>
              "Tufto Rino a transformé notre salon avec un tapis qui ressemble à une oeuvre
              d'art. Le processus personnalisé était fluide, et le résultat est époustouflant."
            </p>
            <span>Mina, collectionneuse de design</span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
