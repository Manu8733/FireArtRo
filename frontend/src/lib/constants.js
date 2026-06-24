// Brand contact constants — update WHATSAPP_NUMBER / EMAIL / socials with real details.
export const WHATSAPP_NUMBER = process.env.REACT_APP_WHATSAPP_NUMBER || "";
export const PHONE_DISPLAY = process.env.REACT_APP_PHONE_DISPLAY || "";
export const PHONE_TEL = process.env.REACT_APP_PHONE_TEL || "";
export const EMAIL = "contact@fireartro.ro";
export const INSTAGRAM = "https://instagram.com/fireartro";
export const FACEBOOK = "https://facebook.com/fireartro"; // placeholder — replace with real page
export const YOUTUBE = "https://youtube.com/@fireartro"; // placeholder — replace with real channel

export const LOGO_URL = "/media/fireart-logo.webp";

export const whatsappLink = (msg) =>
  WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        msg || "Bună! Aș dori o ofertă pentru un spectacol FIREARTRO."
      )}`
    : "";
