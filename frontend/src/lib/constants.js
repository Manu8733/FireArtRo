// Brand contact constants — update WHATSAPP_NUMBER / EMAIL with real details.
export const WHATSAPP_NUMBER = "40700000000"; // placeholder (no + or spaces)
export const PHONE_DISPLAY = "+40 700 000 000";
export const EMAIL = "contact@fireartro.ro";
export const INSTAGRAM = "https://instagram.com/fireartro";

export const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_aerial-spectacle/artifacts/nnijhbwf_WhatsApp%20Image%202026-05-03%20at%2020.52.56-Photoroom%20%281%29.png";

export const whatsappLink = (msg) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    msg || "Bună! Aș dori o ofertă pentru un spectacol FIREARTRO."
  )}`;
