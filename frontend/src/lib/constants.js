import { SITE_DETAILS, SOCIAL_LINKS } from "@/data/businessContent";

// Phone and WhatsApp remain environment-driven because they may be private before launch.
export const WHATSAPP_NUMBER = process.env.REACT_APP_WHATSAPP_NUMBER || "";
export const PHONE_DISPLAY = process.env.REACT_APP_PHONE_DISPLAY || "";
export const PHONE_TEL = process.env.REACT_APP_PHONE_TEL || "";
export const EMAIL = SITE_DETAILS.email;
export const INSTAGRAM = SOCIAL_LINKS.find((item) => item.id === "instagram")?.href || "";
export const FACEBOOK = SOCIAL_LINKS.find((item) => item.id === "facebook")?.href || "";
export const YOUTUBE = SOCIAL_LINKS.find((item) => item.id === "youtube")?.href || "";

export const LOGO_URL = "/media/fireart-logo.webp";

export const whatsappLink = (msg) =>
  WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        msg || "Bună! Aș dori o ofertă pentru un spectacol FireArtRo."
      )}`
    : "";
