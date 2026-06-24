import { useEffect, useState } from "react";

// Generic media-query hook (SSR-safe-ish for CRA).
export function useMediaQuery(query) {
  const get = () =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia(query).matches
      : false;

  const [matches, setMatches] = useState(get);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

// True on phones / small viewports — used to lighten animations & layout.
export const useIsMobile = () => useMediaQuery("(max-width: 767px)");

export const useIsTablet = () => useMediaQuery("(min-width: 768px) and (max-width: 1023px)");

export default useMediaQuery;
