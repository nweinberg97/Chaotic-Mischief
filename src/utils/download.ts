import { DOWNLOAD_HOSTS, PRODUCTS, type ProductId } from '../config';

/**
 * Only hand out download links that point at a known file host over HTTPS.
 * Stops anyone from using the thank-you page to dress up an arbitrary link.
 */
export function safeDownloadUrl(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:') return null;
    return DOWNLOAD_HOSTS.includes(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}

export function productFromParam(raw: string | null): ProductId | null {
  return raw && raw in PRODUCTS ? (raw as ProductId) : null;
}
