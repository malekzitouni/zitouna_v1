import { useEffect, useState } from "react";
import { ArrowLeft, Download, FileText, Search, Video } from "lucide-react";
import { useRoute } from "wouter";
import { fetchManifest, type Manifest } from "../lib/adminApi";
import { CATEGORY_LABELS, LEVELS_META } from "../lib/levelsMeta";

const CATEGORY_INTRO: Record<string, string> = {
  lesson: "Tous les cours de ce niveau, à ouvrir ou télécharger en PDF.",
  practice: "Séries d’exercices et devoirs de ce niveau.",
  media: "Vidéos pédagogiques de ce niveau.",
  lab: "Travaux pratiques et activités expérimentales de ce niveau.",
};

export default function Category() {
  const [, params] = useRoute("/niveau/:levelId/:category");
  const levelId = params?.levelId ?? "";
  const category = params?.category ?? "";
  const level = LEVELS_META.find((item) => item.id === levelId);

  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchManifest()
      .then(setManifest)
      .catch(() => setManifest(null))
      .finally(() => setLoading(false));
  }, []);

  if (!level || !CATEGORY_LABELS[category]) {
    return (
      <div className="cat-page" dir="rtl">
        <div className="cat-inner">
          <a href="#/" className="cat-back"><ArrowLeft size={16} /> Retour à l’accueil</a>
          <div className="cat-empty"><strong>Page introuvable</strong></div>
        </div>
      </div>
    );
  }

  const levelData = manifest?.levels[level.id];
  const q = query.trim().toLocaleLowerCase();
  const items = levelData?.hidden
    ? []
    : (levelData?.resources ?? []).filter(
        (r) => !r.hidden && r.category === category && (!q || r.label.toLocaleLowerCase().includes(q))
      );

  return (
    <div className="cat-page" dir="rtl">
      <div className="cat-inner">
        <a href="#/" className="cat-back"><ArrowLeft size={16} /> Retour aux niveaux</a>

        <header className="cat-header">
          <span className="cat-kicker">{level.title}</span>
          <h1>{CATEGORY_LABELS[category]}</h1>
          <p>{CATEGORY_INTRO[category]}</p>
        </header>

        <nav className="cat-tabs" aria-label="Rubriques du niveau">
          {Object.entries(CATEGORY_LABELS).map(([id, label]) => (
            <a key={id} href={`#/niveau/${level.id}/${id}`} className={id === category ? "active" : ""} aria-current={id === category ? "page" : undefined}>
              {label}
            </a>
          ))}
        </nav>

        <label className="cat-search">
          <Search size={17} />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher dans cette rubrique..." aria-label="Rechercher" />
        </label>

        {loading ? (
          <div className="cat-empty"><span>Chargement…</span></div>
        ) : items.length > 0 ? (
          <ul className="cat-list">
            {items.map((r, i) => (
              <li key={r.id}>
                {r.fileUrl ? (
                  <a href={r.fileUrl} target="_blank" rel="noreferrer" className="cat-item">
                    <span className="cat-num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="cat-icon">{r.category === "media" ? <Video size={18} /> : <FileText size={18} />}</span>
                    <strong>{r.label}</strong>
                    <em>{r.category === "media" ? "Voir" : "Ouvrir (PDF)"} <Download size={14} /></em>
                  </a>
                ) : (
                  <div className="cat-item is-static">
                    <span className="cat-num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="cat-icon"><FileText size={18} /></span>
                    <strong>{r.label}</strong>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="cat-empty">
            <Search size={21} />
            <strong>{q ? "Aucun résultat" : "Aucun fichier pour le moment"}</strong>
            <span>{q ? "Essayez un autre mot-clé." : "De nouvelles ressources seront ajoutées bientôt."}</span>
          </div>
        )}
      </div>
    </div>
  );
}
