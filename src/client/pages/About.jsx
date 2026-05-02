import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import "./About.css";
import heroImage from "../../assets/zoro.png";
import posterImage from "../../assets/hero.png";

const localVideoSrc = "/src/assets/videos/work.mp4";
const externalVideoSrc = "";

function About() {
  return (
    <div className="about-page">
      <Navbar />

      <main className="about-main">
        <section className="about-hero">
          <div className="about-hero-copy">
            <span className="about-eyebrow">L’atelier Tufto Rino</span>
            <h1>Née de la culture, façonnée par votre vision</h1>
            <p>
              Tufto Rino est une marque dédiée aux tapis personnalisés, créés à la main avec
              soin, patience et passion. Chaque pièce raconte une histoire, inspirée par votre
              imagination et réalisée avec une finition artisanale.
            </p>
          </div>

          <div className="about-hero-visual">
            <div className="about-hero-card">
              <img src={heroImage} alt="Tapis artistique Tufto Rino" />
            </div>
          </div>
        </section>

        <section className="about-story-grid">
          <article className="about-story-card">
            <span className="about-section-kicker">Notre histoire</span>
            <h2>Un projet né de la passion du tapis personnalisé</h2>
            <p>
              Tufto Rino est né d’un amour profond pour l’univers textile, les créations
              audacieuses et la possibilité de transformer une idée personnelle en objet
              tangible. Chaque tapis est pensé comme une pièce d’expression, à la frontière
              entre décoration, culture visuelle et artisanat.
            </p>
          </article>

          <article className="about-story-card">
            <span className="about-section-kicker">Votre vision</span>
            <h2>Votre design devient une pièce réelle</h2>
            <p>
              Vous pouvez partager votre image, votre univers, vos couleurs, vos dimensions
              et même l’ambiance souhaitée. Notre équipe traduit ensuite cette vision en tapis
              sur mesure, avec un accompagnement créatif et une fabrication fidèle à votre idée.
            </p>
          </article>
        </section>

        <section className="about-craft-section">
          <div className="about-craft-card">
            <div className="about-craft-icon" aria-hidden="true">
              ✦
            </div>
            <div className="about-craft-copy">
              <span className="about-section-kicker">Savoir-faire</span>
              <h2>100% tufté à la main</h2>
              <p>
                Chaque tapis est tufté à la main dans notre atelier. Nous utilisons des fils
                de qualité pour obtenir des couleurs éclatantes, une texture douce et une
                finition durable.
              </p>
            </div>
          </div>
        </section>

        <section className="about-video-section">
          <div className="about-video-copy">
            <span className="about-section-kicker">Découvrez notre processus</span>
            <h2>Du concept à la finition</h2>
            <p>
              Plongez dans les étapes clés de notre fabrication et découvrez comment chaque
              détail contribue à créer un tapis singulier et expressif.
            </p>
          </div>

          <div className="about-video-card">
           <video
              className="about-video"
              controls
              playsInline
              preload="metadata"
              poster={posterImage}
            >
              <source src="/video-work.mp4" type="video/mp4" />
              Votre navigateur ne supporte pas la vidéo.
            </video>
          </div>
        </section>

        <section className="about-values-section">
          <div className="about-values-header">
            <span className="about-section-kicker">Nos valeurs</span>
            <h2>Ce qui guide chaque création</h2>
          </div>

          <div className="about-values-grid">
            <article className="about-value-card">
              <h3>Créativité</h3>
              <p>Des tapis conçus comme des pièces visuelles fortes et personnelles.</p>
            </article>
            <article className="about-value-card">
              <h3>Qualité</h3>
              <p>Des matériaux choisis avec exigence pour un rendu durable et premium.</p>
            </article>
            <article className="about-value-card">
              <h3>Personnalisation</h3>
              <p>Chaque commande s’adapte à vos envies, vos couleurs et vos dimensions.</p>
            </article>
            <article className="about-value-card">
              <h3>Finition artisanale</h3>
              <p>Une attention particulière portée au détail, à la texture et à l’équilibre.</p>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default About;
