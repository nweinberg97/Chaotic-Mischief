import { useEffect, useState } from 'react';

/**
 * A tiny hash router. Four routes don't need a routing library, and hash
 * URLs work on any static host (GitHub Pages included) with no rewrites.
 */
export type Route = '/' | '/play' | '/deck' | '/coupons';
const ROUTES: Route[] = ['/', '/play', '/deck', '/coupons'];

function parse(hash: string): { route: Route; anchor: string | null } {
  const raw = hash.replace(/^#/, '') || '/';
  if (ROUTES.includes(raw as Route)) return { route: raw as Route, anchor: null };
  // "#how-it-works" style anchors live on the landing page.
  return { route: '/', anchor: raw.replace(/^\//, '') };
}

export function useRoute() {
  const [state, setState] = useState(() => parse(window.location.hash));
  useEffect(() => {
    const onChange = () => setState(parse(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return state;
}

export function navigate(route: Route) {
  if (window.location.hash === `#${route}`) return;
  window.location.hash = route;
}

export const href = (route: Route | string) => `#${route}`;
