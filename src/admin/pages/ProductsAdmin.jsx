import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api.js";
import "./ProductsAdmin.css";

const initialForm = {
  name: "",
  description: "",
  dimensions: "",
  price: "",
  stock: "",
  category_id: "",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MAD",
  }).format(Number(value || 0));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest("/products");
      setProducts(data.products || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await apiRequest("/categories");
      setCategories(Array.isArray(data) ? data : data.categories || []);
    } catch (requestError) {
      console.error("Erreur chargement catégories:", requestError.data || requestError.message);
      setError(requestError.message);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetImageState = () => {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview("");
  };

  const closeModal = () => {
    if (submitting) {
      return;
    }

    setIsModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
    setError("");
    resetImageState();
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    resetImageState();
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      dimensions: product.dimensions || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      category_id: product.category_id ? String(product.category_id) : "",
    });
    setError("");
    resetImageState();
    setImagePreview(product.image || "");
    setIsModalOpen(true);
  };

  const handleImageChange = (event) => {
    const nextFile = event.target.files?.[0] || null;

    if (!nextFile) {
      setImageFile(null);
      setImagePreview(editingId ? imagePreview : "");
      return;
    }

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(nextFile);
    setImagePreview(URL.createObjectURL(nextFile));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("description", form.description);
      payload.append("dimensions", form.dimensions);
      payload.append("price", form.price);
      payload.append("stock", form.stock || "0");
      payload.append("category_id", form.category_id);

      if (imageFile) {
        payload.append("image", imageFile);
      }

      if (editingId) {
        await apiRequest(`/products/${editingId}`, {
          method: "PUT",
          body: payload,
        });
      } else {
        await apiRequest("/products", {
          method: "POST",
          body: payload,
        });
      }

      await loadProducts();
      closeModal();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    const isConfirmed = window.confirm("Supprimer ce produit ?");
    if (!isConfirmed) {
      return;
    }

    try {
      setError("");
      await apiRequest(`/products/${productId}`, {
        method: "DELETE",
      });
      await loadProducts();
      if (editingId === productId) {
        closeModal();
      }
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="products-admin-page">
      <section className="products-admin-toolbar panel-card">
        <div>
          <p className="section-eyebrow">Catalogue premium</p>
          <h2>Produits dynamiques</h2>
          <p className="products-admin-intro">
            Gérez vos produits, leurs images et leurs catégories directement depuis MySQL.
          </p>
        </div>

        <button type="button" className="primary-btn add-product-btn" onClick={openCreateModal}>
          Ajouter le produit
        </button>
      </section>

      {error && !isModalOpen ? <p className="form-error page-error">{error}</p> : null}

      {loading ? (
        <div className="admin-state-card">Chargement des produits...</div>
      ) : products.length > 0 ? (
        <section className="products-grid-admin">
          {products.map((product) => (
            <article className="product-admin-card" key={product.id}>
              <div className="product-admin-image-wrap">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="product-admin-image" />
                ) : (
                  <div className="product-admin-image product-admin-image-placeholder">
                    Image indisponible
                  </div>
                )}
              </div>

              <div className="product-admin-content">
                <div className="product-admin-topline">
                  <span className="product-admin-category">
                    {product.category_name || "Sans catégorie"}
                  </span>
                  <span className="product-admin-stock">Stock : {product.stock}</span>
                </div>

                <h3>{product.name}</h3>

                <p className="product-admin-description">
                  {product.description || "Aucune description fournie."}
                </p>

                <div className="product-admin-details">
                  <p>
                    <span>Dimensions</span>
                    <strong>{product.dimensions || "Non renseignées"}</strong>
                  </p>
                  <p>
                    <span>Prix</span>
                    <strong>{formatCurrency(product.price)}</strong>
                  </p>
                  <p>
                    <span>Créé le</span>
                    <strong>{formatDate(product.createdAt)}</strong>
                  </p>
                </div>

                <div className="product-admin-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => handleEdit(product)}
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    className="danger-btn"
                    onClick={() => handleDelete(product.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="admin-state-card empty-products-admin">
          <h3>Aucun produit trouvé</h3>
          <p>Ajoutez un produit pour remplir le catalogue administrateur.</p>
        </div>
      )}

      {isModalOpen ? (
        <div className="product-modal-backdrop" onClick={closeModal}>
          <section
            className="product-modal panel-card"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="product-modal-header">
              <div>
                <p className="section-eyebrow">
                  {editingId ? "Modifier le produit" : "Ajouter un produit"}
                </p>
                <h3>{editingId ? "Modifier le produit" : "Ajouter le produit"}</h3>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={closeModal}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            <form className="product-form" onSubmit={handleSubmit}>
              <label>
                Nom du produit
                <input name="name" value={form.name} onChange={handleChange} required />
              </label>

              <label className="field-wide">
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                />
              </label>

              <label>
                Dimensions
                <input
                  name="dimensions"
                  value={form.dimensions}
                  onChange={handleChange}
                  placeholder="Ex. 160 x 230 cm"
                />
              </label>

              <label>
                Prix
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Stock
                <input
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                />
              </label>

              <label>
                Catégorie
                <select name="category_id" value={form.category_id} onChange={handleChange} required>
                  <option value="">Choisir une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field-wide">
                Image du produit
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </label>

              {imagePreview ? (
                <div className="image-preview-card field-wide">
                  <p>Aperçu de l&apos;image</p>
                  <img src={imagePreview} alt="Aperçu du produit" className="image-preview" />
                </div>
              ) : null}

              {error ? <p className="form-error field-wide">{error}</p> : null}

              <div className="form-actions field-wide">
                <button type="submit" className="primary-btn" disabled={submitting}>
                  {submitting
                    ? "Enregistrement..."
                    : editingId
                      ? "Modifier le produit"
                      : "Ajouter le produit"}
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Annuler
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export default ProductsAdmin;
