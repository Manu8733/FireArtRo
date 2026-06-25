import { useMemo, useState } from "react";
import { Download, RotateCcw, Save, Upload } from "lucide-react";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import usePageMeta from "@/hooks/usePageMeta";
import {
  MANAGED_CONTENT_DEFAULTS,
} from "@/data/businessContent";
import {
  readManagedContent,
  writeManagedContent,
  MANAGED_CONTENT_STORAGE_KEY,
} from "@/hooks/useManagedContent";

const labels = {
  promoSlides: "Slider homepage",
  mediaItems: "Galerie",
  packages: "Pachete",
  testimonials: "Testimoniale",
  partners: "Parteneri",
  cookieSettings: "Cookies",
};

export default function AdminPage() {
  const initial = useMemo(() => ({ ...MANAGED_CONTENT_DEFAULTS, ...readManagedContent() }), []);
  const [active, setActive] = useState("promoSlides");
  const [draft, setDraft] = useState(initial);
  const [text, setText] = useState(() => JSON.stringify(initial.promoSlides, null, 2));
  const [status, setStatus] = useState("");

  usePageMeta({
    title: "Administrare conținut local | FireArtRo",
    description: "Editor local pentru conținutul FireArtRo.",
    path: "/admin",
    noindex: true,
  });

  const switchSection = (key) => {
    setActive(key);
    setText(JSON.stringify(draft[key], null, 2));
    setStatus("");
  };

  const save = () => {
    try {
      const parsed = JSON.parse(text);
      if (active !== "cookieSettings" && !Array.isArray(parsed)) {
        throw new Error("Secțiunea trebuie să fie o listă JSON.");
      }
      if (active === "cookieSettings" && (Array.isArray(parsed) || typeof parsed !== "object")) {
        throw new Error("Setările cookies trebuie să fie un obiect JSON.");
      }
      const next = { ...draft, [active]: parsed };
      setDraft(next);
      writeManagedContent(next);
      setStatus("Draft salvat în acest browser.");
    } catch (error) {
      setStatus(`JSON invalid: ${error.message}`);
    }
  };

  const reset = () => {
    window.localStorage.removeItem(MANAGED_CONTENT_STORAGE_KEY);
    const next = { ...MANAGED_CONTENT_DEFAULTS };
    setDraft(next);
    setText(JSON.stringify(next[active], null, 2));
    setStatus("Datele locale au fost resetate.");
    window.location.reload();
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "fireartro-content.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      const next = { ...MANAGED_CONTENT_DEFAULTS, ...imported };
      setDraft(next);
      setText(JSON.stringify(next[active], null, 2));
      writeManagedContent(next);
      setStatus("Fișier importat și salvat local.");
    } catch {
      setStatus("Fișierul selectat nu conține JSON valid.");
    }
  };

  return (
    <main className="admin-page">
      <Navbar />
      <section className="admin-content" aria-labelledby="admin-title">
        <header>
          <span>Editor local FireArtRo</span>
          <h1 id="admin-title">Conținut ușor de actualizat.</h1>
          <p>
            Modificările se salvează doar în browserul curent. Pentru publicare globală, exportă JSON-ul și actualizează
            fișierul sursă sau conectează ulterior un CMS.
          </p>
        </header>

        <div className="admin-toolbar">
          <div role="tablist" aria-label="Secțiuni conținut">
            {Object.keys(labels).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active === key}
                className={active === key ? "is-active" : ""}
                onClick={() => switchSection(key)}
              >
                {labels[key]}
              </button>
            ))}
          </div>
          <div>
            <button type="button" onClick={save}><Save /> Salvează local</button>
            <button type="button" onClick={exportJson}><Download /> Exportă JSON</button>
            <label>
              <Upload /> Importă JSON
              <input type="file" accept="application/json" onChange={importJson} />
            </label>
            <button type="button" onClick={reset}><RotateCcw /> Reset</button>
          </div>
        </div>

        <label className="admin-editor">
          <span>{labels[active]}</span>
          <textarea value={text} onChange={(event) => setText(event.target.value)} spellCheck="false" />
        </label>
        <p className="admin-status" role="status">{status}</p>
      </section>
      <Footer />
    </main>
  );
}
