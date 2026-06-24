import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/constants";

export const WhatsAppFloat = () => (
  <a
    href={whatsappLink()}
    target="_blank"
    rel="noopener noreferrer"
    data-testid="whatsapp-float"
    aria-label="Contactează-ne pe WhatsApp"
    className="fixed bottom-6 left-6 z-40 h-14 w-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_8px_30px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform duration-300"
  >
    <MessageCircle className="h-7 w-7 text-white" />
    <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
  </a>
);

export default WhatsAppFloat;
