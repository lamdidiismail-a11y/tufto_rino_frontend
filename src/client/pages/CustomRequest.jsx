import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import "./CustomRequest.css";
import { apiRequest, getAuthSession } from "../../services/api.js";

const initialForm = {
  title: "",
  description: "",
  dimensions: "",
  colors: "",
  budget: "",
  phone: "",
};

function CustomRequest() {
  const navigate = useNavigate();
  const { user, token } = getAuthSession();
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const imagePreview = useMemo(() => {
    if (!imageFile) {
      return "";
    }

    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [navigate, token]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (!token) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
    setValidationErrors((current) => ({
      ...current,
      [name]: "",
    }));
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const validateForm = () => {
    const errors = {};

    if (!form.title.trim()) {
      errors.title = "Le titre du projet est obligatoire.";
    }

    if (!form.description.trim()) {
      errors.description = "La description du tapis est obligatoire.";
    }

    if (!form.dimensions.trim()) {
      errors.dimensions = "Les dimensions souhaitées sont obligatoires.";
    }

    if (!form.phone.trim()) {
      errors.phone = "Le numéro de téléphone est obligatoire.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSending(true);
      setSuccessMessage("");
      setErrorMessage("");

      const payload = new FormData();
      payload.append("title", form.title.trim());
      payload.append("description", form.description.trim());
      payload.append("dimensions", form.dimensions.trim());
      payload.append("colors", form.colors.trim());
      payload.append("budget", form.budget.trim());
      payload.append("phone", form.phone.trim());

      if (imageFile) {
        payload.append("image", imageFile);
      }

      await apiRequest("/custom-requests", {
        method: "POST",
        body: payload,
      });

      setForm(initialForm);
      setImageFile(null);
      setValidationErrors({});
      setSuccessMessage("Votre demande a été envoyée avec succès.");

      window.setTimeout(() => {
        navigate("/custom-requests/my");
      }, 900);
    } catch (error) {
      if (error.status === 401) {
        navigate("/login");
        return;
      }

      setErrorMessage(error.message || "Impossible d'envoyer la demande.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="custom-request-page">
      <Navbar />

      <main className="custom-request-main">
        <section className="custom-request-card">
          <div className="custom-request-header">
            <p>Conception sur mesure</p>
            <h1>Décrivez votre projet de tapis</h1>
            <span>
              Partagez vos inspirations, vos dimensions et votre budget pour lancer une
              demande personnalisée auprès de l’équipe Tufto Rino.
            </span>
          </div>

          <div className="custom-request-layout">
            <form className="custom-request-form" onSubmit={handleSubmit}>
              <label>
                Titre du projet *
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Exemple : Tapis salon contemporain"
                />
                {validationErrors.title ? (
                  <small className="field-error">{validationErrors.title}</small>
                ) : null}
              </label>

              <label>
                Description / idée du tapis *
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Décrivez le style, le motif, l’ambiance et toute précision utile."
                  rows="6"
                />
                {validationErrors.description ? (
                  <small className="field-error">{validationErrors.description}</small>
                ) : null}
              </label>

              <div className="custom-request-grid">
                <label>
                  Dimensions souhaitées *
                  <input
                    name="dimensions"
                    value={form.dimensions}
                    onChange={handleChange}
                    placeholder="200 x 300 cm"
                  />
                  {validationErrors.dimensions ? (
                    <small className="field-error">{validationErrors.dimensions}</small>
                  ) : null}
                </label>

                <label>
                  Couleurs préférées
                  <input
                    name="colors"
                    value={form.colors}
                    onChange={handleChange}
                    placeholder="Beige, vert sauge, noir"
                  />
                </label>
              </div>

              <div className="custom-request-grid">
                <label>
                  Budget approximatif
                  <input
                    name="budget"
                    value={form.budget}
                    onChange={handleChange}
                    placeholder="2500 - 4000 MAD"
                  />
                </label>

                <label>
                  Téléphone *
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+212 6 00 00 00 00"
                  />
                  {validationErrors.phone ? (
                    <small className="field-error">{validationErrors.phone}</small>
                  ) : null}
                </label>
              </div>

              <label className="upload-field">
                Image de référence / design
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </label>

              {imagePreview ? (
                <div className="image-preview-card">
                  <img src={imagePreview} alt="Aperçu de la référence" />
                </div>
              ) : null}

              {successMessage ? <p className="form-success">{successMessage}</p> : null}
              {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

              <div className="custom-request-actions">
                <button type="submit" className="submit-btn" disabled={sending}>
                  {sending ? "Envoi en cours..." : "Envoyer la demande"}
                </button>
                <Link to="/custom-requests/my" className="secondary-link">
                  Voir mes demandes
                </Link>
              </div>
            </form>

            <aside className="custom-request-sidecard">
              <h2>Votre espace créatif</h2>
              <p>
                Ajoutez tous les détails utiles pour nous aider à comprendre votre vision :
                dimensions, harmonie de couleurs, style attendu et image de référence.
              </p>

              <ul>
                <li>Réponse humaine et personnalisée</li>
                <li>Analyse de faisabilité selon vos dimensions</li>
                <li>Suivi direct depuis votre espace client</li>
              </ul>

              <div className="sidecard-meta">
                <span>Compte connecté</span>
                <strong>{user?.email}</strong>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default CustomRequest;
