import { describe, expect, it } from 'vitest';
import { productFromParam, safeDownloadUrl } from './download';
import { parseHash } from './router';

describe('thank-you page links', () => {
  it('accepts https links on known file hosts', () => {
    expect(safeDownloadUrl('https://drive.google.com/file/d/abc/view')).toBe('https://drive.google.com/file/d/abc/view');
    expect(safeDownloadUrl('https://www.dropbox.com/s/x/deck.pdf?dl=1')).toBe('https://www.dropbox.com/s/x/deck.pdf?dl=1');
  });

  it('rejects everything else', () => {
    expect(safeDownloadUrl(null)).toBeNull();
    expect(safeDownloadUrl('http://drive.google.com/file')).toBeNull();
    expect(safeDownloadUrl('https://evil.example.com/drive.google.com')).toBeNull();
    expect(safeDownloadUrl('javascript:alert(1)')).toBeNull();
    expect(safeDownloadUrl('not a url')).toBeNull();
  });

  it('only knows real products', () => {
    expect(productFromParam('bundle')).toBe('bundle');
    expect(productFromParam('coupons')).toBe('coupons');
    expect(productFromParam('free-stuff')).toBeNull();
  });

  it('reads the item and download link from the hash', () => {
    const dl = encodeURIComponent('https://drive.google.com/file/d/abc/view?usp=sharing');
    const r = parseHash(`#/thanks?item=bundle&dl=${dl}`);
    expect(r.route).toBe('/thanks');
    expect(r.params.get('item')).toBe('bundle');
    expect(safeDownloadUrl(r.params.get('dl'))).toBe('https://drive.google.com/file/d/abc/view?usp=sharing');
  });
});
