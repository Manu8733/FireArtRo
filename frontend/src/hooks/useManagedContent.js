import { useEffect, useState } from "react";
import {
  LEGACY_MEDIA_IDS,
  LEGACY_PACKAGE_IDS,
  MEDIA_CATALOG_VERSION,
  MEDIA_ITEMS,
  PACKAGE_CATALOG_VERSION,
  PACKAGE_ITEMS,
} from "@/data/businessContent";

export const MANAGED_CONTENT_STORAGE_KEY = "fireartro-managed-content-v1";
export const MANAGED_CONTENT_EVENT = "fireartro-managed-content-updated";

const migratePackages = (content) => {
  if (content.packageCatalogVersion === PACKAGE_CATALOG_VERSION) return content;

  const legacyIds = new Set(LEGACY_PACKAGE_IDS);
  const catalogIds = new Set(PACKAGE_ITEMS.map((item) => item.id));
  const customPackages = Array.isArray(content.packages)
    ? content.packages.filter((item) => item?.id && !legacyIds.has(item.id) && !catalogIds.has(item.id))
    : [];

  return {
    ...content,
    packages: [...PACKAGE_ITEMS, ...customPackages],
    packageCatalogVersion: PACKAGE_CATALOG_VERSION,
  };
};

const migrateMedia = (content) => {
  if (content.mediaCatalogVersion === MEDIA_CATALOG_VERSION) return content;

  const catalogIds = new Set(MEDIA_ITEMS.map((item) => item.id));
  const legacyIds = new Set(LEGACY_MEDIA_IDS);
  const customMedia = Array.isArray(content.mediaItems)
    ? content.mediaItems.filter((item) => item?.id
      && !catalogIds.has(item.id)
      && !legacyIds.has(item.id)
      && !item.id.startsWith("gallery-import-"))
    : [];

  return {
    ...content,
    mediaItems: [...MEDIA_ITEMS, ...customMedia],
    mediaCatalogVersion: MEDIA_CATALOG_VERSION,
  };
};

const migrateManagedContent = (content) => migrateMedia(migratePackages(content));

export const readManagedContent = () => {
  if (typeof window === "undefined") return {};
  try {
    const stored = JSON.parse(window.localStorage.getItem(MANAGED_CONTENT_STORAGE_KEY) || "{}");
    const migrated = migrateManagedContent(stored);
    if (migrated !== stored) {
      window.localStorage.setItem(MANAGED_CONTENT_STORAGE_KEY, JSON.stringify(migrated));
    }
    return migrated;
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
