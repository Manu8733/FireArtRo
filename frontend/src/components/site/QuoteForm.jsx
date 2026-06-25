import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { CheckCircle2, Clock3, Loader2, Mail, MessageCircle, Phone, Sparkles } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import {
  BUSINESS_HOURS,
  CONTACT_EVENT_TYPES,
  PACKAGE_ITEMS,
  SERVICE_INTEREST_OPTIONS,
} from "@/data/businessContent";
import { whatsappLink, PHONE_DISPLAY, EMAIL } from "@/lib/constants";
import { readContactPrefill } from "@/lib/contactNavigation";

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
const API = `${BACKEND_URL}/api`;

const empty = {
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  locality: "",
  event_location: "",
  event_date: "",
  event_type: "",
  services: [],
  package_id: "",
  package_title: "",
  message: "",
  consent: false,
  company_website: "",
};

export const QuoteForm = () => {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const prefill = readContactPrefill();
    if (Object.keys(prefill).length) {
      setForm((current) => ({
        ...current,
        ...prefill,
        services: [...new Set([...(current.services || []), ...(prefill.services || [])])],
      }));
    }

    const handler = (event) => {
      const item = event.detail;
      setForm((current) => ({
        ...current,
        package_id: item.id || "",
        package_title: item.title || String(item),
        services: item.category
          ? [...new Set([...current.services, item.category])]
          : current.services,
      }));
    };
    window.addEventListener("prefill-package", handler);
    return () => window.removeEventListener("prefill-package", handler);
  }, []);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const toggleService = (service) =>
    setForm((current) => ({
      ...current,
      services: current.services.includes(service)
        ? current.services.filter((item) => item !== service)
        : [...current.services, service],
    }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim() || !form.phone.trim() || !form.email.trim()) {
      toast.error("Completează numele, prenumele, telefonul și emailul.");
      return;
    }
    if (!form.locality.trim() || !form.event_type || !form.event_date) {
      toast.error("Completează localitatea, data și tipul evenimentului.");
      return;
    }
    if (!form.services.length) {
      toast.error("Alege cel puțin un serviciu de interes.");
      return;
    }
    if (!form.consent) {
      toast.error("Acceptă prelucrarea datelor pentru a continua.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/quotes`, form, {
        headers: { "Content-Type": "application/json" },
        timeout: 12000,
      });
      setDone(true);
      setForm(empty);
      toast.success("Cererea a fost trimisă. Revenim cu următorii pași.");
    } catch (error) {
      console.error(error);
      const message = error.response?.status === 429
        ? "Ai trimis mai multe solicitări într-un interval scurt. Încearcă mai târziu."
        : "Cererea nu a putut fi trimisă. Folosește WhatsApp sau email.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="contact-modern" data-testid="contact-section" aria-labelledby="contact-title">
      <div className="contact-modern-inner">
        <div className="contact-modern-layout">
          <Reveal>
            <div className="contact-modern-intro">
              <span className="contact-modern-kicker">Solicită ofertă</span>
              <h2 id="contact-title">Trimite contextul. Primești o direcție clară.</h2>
              <p>
                Nu ai nevoie de un brief perfect. Data, locația și tipul de spectacol sunt suficiente pentru prima evaluare.
              </p>

              <ol className="contact-brief-list">
                {[
                  ["01", "Context", "Eveniment, dată și locație"],
                  ["02", "Selecție", "Serviciile și pachetul care te interesează"],
                  ["03", "Răspuns", "Întrebări tehnice și o direcție de ofertă"],
                ].map(([number, title, text]) => (
                  <li key={number}>
                    <span>{number}</span>
                    <div><strong>{title}</strong><small>{text}</small></div>
                  </li>
                ))}
              </ol>

              <div className="contact-hours">
                <Clock3 />
                <div>
                  <strong>{BUSINESS_HOURS.label}</strong>
                  <span>{BUSINESS_HOURS.note}</span>
                </div>
              </div>

              <div className="contact-channel-list">
                {PHONE_DISPLAY && (
                  <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`}><Phone /><span><small>Telefon</small><strong>{PHONE_DISPLAY}</strong></span></a>
                )}
                <a href={`mailto:${EMAIL}`}><Mail /><span><small>Email</small><strong>{EMAIL}</strong></span></a>
                {whatsappLink() && (
                  <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                    <MessageCircle /><span><small>WhatsApp</small><strong>Scrie-ne direct</strong></span>
                  </a>
                )}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="contact-form-panel" data-testid="quote-form-card">
              <div className="contact-form-heading"><span>Brief eveniment</span><strong>2 minute</strong></div>
              {done ? (
                <div className="contact-success" data-testid="quote-success">
                  <div><CheckCircle2 /></div>
                  <h3>Cerere trimisă</h3>
                  <p>Analizăm detaliile și revenim cu întrebările relevante pentru configurație.</p>
                  <button type="button" onClick={() => setDone(false)}>Trimite altă cerere</button>
                </div>
              ) : (
                <form onSubmit={submit} className="contact-form-grid" data-testid="quote-form" noValidate>
                  <div className="contact-field">
                    <label htmlFor="quote-first-name">Nume *</label>
                    <input id="quote-first-name" value={form.first_name} onChange={(e) => update("first_name", e.target.value)} autoComplete="family-name" />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="quote-last-name">Prenume *</label>
                    <input id="quote-last-name" value={form.last_name} onChange={(e) => update("last_name", e.target.value)} autoComplete="given-name" />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="quote-phone">Telefon *</label>
                    <input id="quote-phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} autoComplete="tel" placeholder="07xx xxx xxx" />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="quote-email">Email *</label>
                    <input id="quote-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="quote-locality">Localitatea *</label>
                    <input id="quote-locality" value={form.locality} onChange={(e) => update("locality", e.target.value)} autoComplete="address-level2" />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="quote-event-location">Locația evenimentului</label>
                    <input id="quote-event-location" value={form.event_location} onChange={(e) => update("event_location", e.target.value)} placeholder="Sală, adresă sau reper" />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="quote-date">Data evenimentului *</label>
                    <input id="quote-date" type="date" value={form.event_date} onChange={(e) => update("event_date", e.target.value)} />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="quote-event-type">Tip eveniment *</label>
                    <select id="quote-event-type" value={form.event_type} onChange={(e) => update("event_type", e.target.value)}>
                      <option value="">Alege tipul</option>
                      {CONTACT_EVENT_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                  <div className="contact-field contact-field-wide">
                    <label htmlFor="quote-package">Pachet selectat</label>
                    <select
                      id="quote-package"
                      value={form.package_id}
                      onChange={(e) => {
                        const item = PACKAGE_ITEMS.find((entry) => entry.id === e.target.value);
                        update("package_id", e.target.value);
                        update("package_title", item?.title || "");
                      }}
                    >
                      <option value="">Fără pachet selectat</option>
                      {PACKAGE_ITEMS.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                    </select>
                  </div>
                  <details className="contact-services contact-field-wide" open={form.services.length > 0}>
                    <summary>
                      <span>Servicii de interes *</span>
                      <small>
                        {form.services.length
                          ? `${form.services.length} ${form.services.length === 1 ? "opțiune selectată" : "opțiuni selectate"}`
                          : "Alege una sau mai multe"}
                      </small>
                    </summary>
                    <div className="contact-services-options">
                      {SERVICE_INTEREST_OPTIONS.map((service) => (
                        <label key={service}>
                          <input
                            type="checkbox"
                            checked={form.services.includes(service)}
                            onChange={() => toggleService(service)}
                          />
                          <span>{service}</span>
                        </label>
                      ))}
                    </div>
                  </details>
                  <div className="contact-field contact-field-wide">
                    <label htmlFor="quote-message">Mesaj</label>
                    <textarea id="quote-message" value={form.message} onChange={(e) => update("message", e.target.value)} rows={4} placeholder="Detalii despre moment, public, muzică sau accesul în locație" />
                  </div>
                  <div className="contact-honeypot" aria-hidden="true">
                    <label htmlFor="company-website">Website companie</label>
                    <input id="company-website" tabIndex="-1" autoComplete="off" value={form.company_website} onChange={(e) => update("company_website", e.target.value)} />
                  </div>
                  <label className="contact-consent">
                    <input type="checkbox" checked={form.consent} onChange={(e) => update("consent", e.target.checked)} />
                    <span>Sunt de acord cu prelucrarea datelor conform <a href="/confidentialitate">politicii de confidențialitate</a>.</span>
                  </label>
                  <button type="submit" disabled={loading} className="contact-submit">
                    {loading ? <><Loader2 className="animate-spin" /> Se trimite...</> : <><Sparkles /> Trimite cererea</>}
                  </button>
                  <p className="contact-form-note">Datele sunt folosite exclusiv pentru această solicitare.</p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default QuoteForm;
