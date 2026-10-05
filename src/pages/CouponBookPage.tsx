import { Coupon } from '../components/Coupon';
import { SiteFooter, SiteHeader } from '../components/SiteChrome';
import { CouponUpsell } from '../components/Upsell';
import { PRODUCTS } from '../config';
import { COUPONS } from '../data/coupons';
import { CREDITS_PER_COUPON } from '../game/rules';
import { href } from '../utils/router';
import './deck.css';

/**
 * Preview of every Chaos Coupon. Coupons won in a game print free from the
 * winner screen; the whole print-ready book is the paid download.
 */
export function CouponBookPage() {
  const price = PRODUCTS.coupons.price;
  return (
    <>
      <SiteHeader />
      <main id="main" className="deck-page coupon-book">
        <header className="deck-page__head">
          <p className="eyebrow">The rewards</p>
          <h1 className="deck-page__title">The Chaos Coupon Book.</h1>
          <p className="deck-page__lede">
            Every {CREDITS_PER_COUPON} Chaos Credits earns one coupon. Win a game and you can print the ones you
            picked for free, with both your names on them.
          </p>
          <CouponUpsell
            title={`Want the whole book? ${price}.`}
            sub="All 31 coupons, print-ready, plus 5 blank ones to write your own. Instant PDF download."
          />
        </header>

        <div className="coupon-grid">
          {COUPONS.map((c) => (
            <Coupon key={c.id} coupon={c} />
          ))}
        </div>

        <div className="deck-page__cta">
          <a href={href('/play')} className="btn btn--big">
            Go earn some <span aria-hidden>→</span>
          </a>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
