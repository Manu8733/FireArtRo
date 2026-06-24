import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { CheckCircle2, Loader2, MessageCircle, Phone, Mail, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Reveal from "@/components/site/Reveal";
import { EVENT_TYPES, PACKAGES, SERVICE_OPTIONS } from "@/data/content";
import { whatsappLink, PHONE_DISPLAY, EMAIL } from "@/lib/constants";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const empty = {
  name: "",
  phone: "",
  email: "",
  event_type: "",
  event_date: "",
  location: "",
  package: "",
  preferred_service: "",
  message: "",
  consent: false,
};

export const QuoteForm = () => {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const handler = (e) => setForm((f) => ({ ...f, package: e.detail }));
    window.addEventListener("prefill-package", handler);
    return () => window.removeEventListener("prefill-package", handler);
  }, []);

  const update = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.event_type) {
      toast.error("Completează numele, telefonul și tipul evenimentului.");
      return;
    }
    if (!form.consent) {
      toast.error("Te rugăm să accepți prelucrarea datelor pentru a continua.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/quotes`, form);
      setDone(true);
      toast.success("Cererea ta a fost trimisă! Te contactăm în curând.");
      setForm(empty);
    } catch (err) {
      console.error(err);
      toast.error("A apărut o eroare. Încearcă din nou sau scrie-ne pe WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="relative py-24 md:py-32 section-grid-bg" data-testid="contact-section">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left copy */}
          <Reveal>
            <div>
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#8338EC]">
                Solicită ofertă
              </span>
              <h2 className="font-display font-bold text-white text-4xl sm:text-5xl mt-4 tracking-tight">
                Hai să creăm spectacolul tău
              </h2>
              <p className="mt-5 text-white/60 text-base sm:text-lg font-light">
                Completează formularul cu detaliile evenimentului. Revenim rapid cu o ofertă
                personalizată în funcție de locație, durată și complexitate.
              </p>

              <div className="mt-10 space-y-4">
                <a
                  href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`}
                  data-testid="contact-phone"
                  className="flex items-center gap-4 glass rounded-2xl p-4 hover:border-white/20 transition-colors"
                >
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#3A86FF]/20 to-[#8338EC]/20 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-[#9D7BFF]" />
                  </div>
                  <div>
                    <div className="text-xs text-white/45">Telefon</div>
                    <div className="text-white font-medium">{PHONE_DISPLAY}</div>
                  </div>
                </a>
                <a
                  href={`mailto:${EMAIL}`}
                  data-testid="contact-email"
                  className="flex items-center gap-4 glass rounded-2xl p-4 hover:border-white/20 transition-colors"
                >
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#3A86FF]/20 to-[#8338EC]/20 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-[#9D7BFF]" />
                  </div>
                  <div>
                    <div className="text-xs text-white/45">Email</div>
                    <div className="text-white font-medium">{EMAIL}</div>
                  </div>
                </a>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="contact-whatsapp"
                  className="flex items-center gap-4 glass rounded-2xl p-4 hover:border-white/20 transition-colors"
                >
                  <div className="h-11 w-11 rounded-xl bg-[#25D366]/15 flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-[#25D366]" />
                  </div>
                  <div>
                    <div className="text-xs text-white/45">WhatsApp</div>
                    <div className="text-white font-medium">Scrie-ne acum</div>
                  </div>
                </a>
              </div>
            </div>
          </Reveal>

          {/* Right form */}
          <Reveal delay={0.1}>
            <div className="glass rounded-3xl p-7 md:p-9 glow-ring" data-testid="quote-form-card">
              {done ? (
                <div className="text-center py-12" data-testid="quote-success">
                  <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-[#3A86FF] to-[#8338EC] flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mt-6 font-display font-semibold text-2xl text-white">
                    Mulțumim!
                  </h3>
                  <p className="mt-3 text-white/60 font-light">
                    Cererea ta a fost trimisă cu succes. Te contactăm în cel mai scurt timp cu o
                    ofertă personalizată.
                  </p>
                  <button
                    onClick={() => setDone(false)}
                    data-testid="quote-new-request"
                    className="mt-7 glass text-white font-semibold px-6 py-3 rounded-full hover:bg-white/10 transition-colors"
                  >
                    Trimite altă cerere
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-5" data-testid="quote-form">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm">Nume *</Label>
                      <Input
                        data-testid="quote-input-name"
                        value={form.name}
                        onChange={(e) => update("name")(e.target.value)}
                        placeholder="Numele tău"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus-visible:ring-[#8338EC]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm">Telefon *</Label>
                      <Input
                        data-testid="quote-input-phone"
                        value={form.phone}
                        onChange={(e) => update("phone")(e.target.value)}
                        placeholder="07xx xxx xxx"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus-visible:ring-[#8338EC]"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm">Email</Label>
                      <Input
                        data-testid="quote-input-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => update("email")(e.target.value)}
                        placeholder="email@exemplu.ro"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus-visible:ring-[#8338EC]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm">Data evenimentului</Label>
                      <Input
                        data-testid="quote-input-date"
                        type="date"
                        value={form.event_date}
                        onChange={(e) => update("event_date")(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus-visible:ring-[#8338EC] [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm">Tip eveniment *</Label>
                      <Select value={form.event_type} onValueChange={update("event_type")}>
                        <SelectTrigger
                          data-testid="quote-select-event"
                          className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-[#8338EC]"
                        >
                          <SelectValue placeholder="Alege..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0A0712] border-white/10 text-white">
                          {EVENT_TYPES.map((t) => (
                            <SelectItem key={t} value={t} className="focus:bg-[#8338EC]/30">
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm">Pachet dorit</Label>
                      <Select value={form.package} onValueChange={update("package")}>
                        <SelectTrigger
                          data-testid="quote-select-package"
                          className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-[#8338EC]"
                        >
                          <SelectValue placeholder="Opțional" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0A0712] border-white/10 text-white">
                          {PACKAGES.map((p) => (
                            <SelectItem key={p.name} value={p.name} className="focus:bg-[#8338EC]/30">
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm">Locație</Label>
                      <Input
                        data-testid="quote-input-location"
                        value={form.location}
                        onChange={(e) => update("location")(e.target.value)}
                        placeholder="Oraș / locație aproximativă"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus-visible:ring-[#8338EC]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm">Serviciu preferat</Label>
                      <Select value={form.preferred_service} onValueChange={update("preferred_service")}>
                        <SelectTrigger
                          data-testid="quote-select-service"
                          className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-[#8338EC]"
                        >
                          <SelectValue placeholder="Opțional" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0A0712] border-white/10 text-white">
                          {SERVICE_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s} className="focus:bg-[#8338EC]/30">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/70 text-sm">Mesaj</Label>
                    <Textarea
                      data-testid="quote-input-message"
                      value={form.message}
                      onChange={(e) => update("message")(e.target.value)}
                      placeholder="Spune-ne mai multe despre evenimentul tău..."
                      rows={4}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus-visible:ring-[#8338EC] resize-none"
                    />
                  </div>

                  <div className="flex items-start gap-3 pt-1">
                    <Checkbox
                      id="consent"
                      data-testid="quote-consent"
                      checked={form.consent}
                      onCheckedChange={(v) => update("consent")(!!v)}
                      className="mt-0.5 border-white/30 data-[state=checked]:bg-[#8338EC] data-[state=checked]:border-[#8338EC]"
                    />
                    <Label htmlFor="consent" className="text-white/55 text-sm font-light leading-relaxed cursor-pointer">
                      Sunt de acord cu prelucrarea datelor mele pentru a primi o ofertă, conform{" "}
                      <a href="/legal/confidentialitate" target="_blank" className="text-[#9D7BFF] underline">
                        politicii de confidențialitate
                      </a>
                      .
                    </Label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    data-testid="quote-submit"
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#3A86FF] to-[#8338EC] text-white font-semibold px-8 py-4 rounded-full hover:shadow-[0_0_28px_rgba(131,56,236,0.5)] transition-all duration-300 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Se trimite...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" /> Trimite cererea
                      </>
                    )}
                  </button>
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
