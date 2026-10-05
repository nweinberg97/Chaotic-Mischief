import { Bolt, Wordmark } from '../components/Brand';
import { PRODUCTS } from '../config';
import { productFromParam, safeDownloadUrl } from '../utils/download';
import { href } from '../utils/router';
import './thanks.css';

/**
 * Where Stripe sends buyers after paying. The product and the download link
 * arrive in the URL (set in Stripe), so the files never appear in this repo.
 */
export function ThanksPage({ params }: { params: URLSearchParams }) {
  const productId = productFromParam(params.get('item'));
  const product = productId ? PRODUCTS[productId] : null;
  const download = safeDownloadUrl(params.get('dl'));

  return (
    <main className="thanks" id="main">
      <a href={href('/')} className="thanks__home" aria-label="Chaotic Mischief home">
        <Wordmark />
      </a>
      <section className="thanks__card">
        <Bolt className="thanks__bolt" />
        <p className="eyebrow thanks__eyebrow">Payment received</p>
        <h1 className="thanks__title">You’ve officially started something.</h1>
        {product && <p className="thanks__item">{product.name}</p>}

        {download ? (
          <>
            <a className="btn btn--big btn--block" href={download} target="_blank" rel="noopener noreferrer">
              Download your PDF
            </a>
            <p className="thanks__fine">
              Save it somewhere safe. Print at home or at any print shop: letter or A4, “actual size”, ideally on
              card stock.
            </p>
          </>
        ) : (
          <p className="thanks__fine thanks__fine--warn">
            Your download link didn’t come through on this page. Reply to your Stripe receipt email and we’ll send
            your files straight away.
          </p>
        )}

        <div className="thanks__next">
          <a className="btn btn--ghost" href={href('/play')}>
            Play a round now
          </a>
          <a className="link-btn" href={href('/')}>
            Back home
          </a>
        </div>
      </section>
    </main>
  );
}
