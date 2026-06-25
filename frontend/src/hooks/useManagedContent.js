import { useEffect, useState } from "react";

export const MANAGED_CONTENT_STORAGE_KEY = "fireartro-managed-content-v1";
export const MANAGED_CONTENT_EVENT = "fireartro-managed-content-updated";

export const readManagedContent = () => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(MANAGED_CONTENT_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

export const writeManagedContent = (content) => {
  window.localStorage.setItem(MANAGED_CONTENT_STORAGE_KEY, JSON.stringify(content));
  window.dispatchEvent(new CustomEvent(MANAGED_CONTENT_EVENT));
};

export default function useManagedContent(key, fallback) {
  const [content, setContent] = useState(() => readManagedContent()[key] || fallback);

  useEffect(() => {
    const sync = () => setContent(readManagedContent()[key] || fallback);
    window.addEventListener("storage", sync);
    window.addEventListener(MANAGED_CONTENT_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(MANAGED_CONTENT_EVENT, sync);
    };
  }, [fallback, key]);

  return content;
}
