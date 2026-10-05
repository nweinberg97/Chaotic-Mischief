import { useEffect, useState } from 'react';

/**
 * A tiny hash router. A handful of routes don't need a routing library, and
 * hash URLs work on any static host (GitHub Pages included) with no rewrites.
 */
export type Route = '/' | '/play' | '/deck' | '/coupons' | '/thanks';
const ROUTES: Route[] = ['/', '/play', '/deck', '/coupons', '/thanks'];

export interface RouteState {
  route: Route;
  /** Section id on the landing page, e.g. "how-it-works". */
  anchor: string | null;
  params: URLSearchParams;
}

export function parseHash(hash: string): RouteState {
  const raw = hash.replace(/^#/, '') || '/';
  const [path, query = ''] = raw.split('?');
  const params = new URLSearchParams(query);
  if (ROUTES.includes(path as Route)) return { route: path as Route, anchor: null, params };
  // "#how-it-works" style anchors live on the landing page.
  return { route: '/', anchor: path.replace(/^\//, ''), params };
}

export function useRoute() {
  const [state, setState] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setState(parseHash(window.location.hash));
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
