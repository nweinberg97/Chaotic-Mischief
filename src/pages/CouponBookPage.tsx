import { useState } from 'react';
import { Coupon } from '../components/Coupon';
import { PrintSheet } from '../components/PrintSheet';
import { SiteFooter, SiteHeader } from '../components/SiteChrome';
import { COUPONS } from '../data/coupons';
import { CREDITS_PER_COUPON, MAX_NAME_LENGTH } from '../game/rules';
import { href } from '../utils/router';
import './deck.css';

/** The full printable Chaos Coupon book, optionally made out to someone. */
export function CouponBookPage() {
  const [to, setTo] = useState('');
  const [from, setFrom] = useState('');

  return (
    <>
      <SiteHeader />
      <main id="main" className="deck-page coupon-book">
        <header className="deck-page__head">
          <p className="eyebrow">The rewards</p>
          <h1 className="deck-page__title">The Chaos Coupon Book.</h1>
          <p className="deck-page__lede">
            Every {CREDITS_PER_COUPON} Chaos Credits earns one coupon. Win the night and you claim three. Print the
            whole book, cut along the lines, and keep them somewhere your partner can’t “lose” them.
          </p>

          <form className="coupon-book__form" onSubmit={(e) => e.preventDefault()}>
            <label>
              <span>Made out to</span>
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Optional"
                maxLength={MAX_NAME_LENGTH}
              />
            </label>
            <label>
              <span>From</span>
              <input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Optional"
                maxLength={MAX_NAME_LENGTH}
              />
            </label>
            <button type="button" className="btn" onClick={() => window.print()}>
              Print all {COUPONS.length}
            </button>
          </form>
        </header>

        <div className="coupon-grid">
          {COUPONS.map((c) => (
            <Coupon key={c.id} coupon={c} to={to.trim() || undefined} from={from.trim() || undefined} />
          ))}
        </div>

        <div className="deck-page__cta">
          <a href={href('/play')} className="btn btn--big">
            Go earn some <span aria-hidden>→</span>
          </a>
        </div>
      </main>
      <SiteFooter />

      <PrintSheet title="Chaotic Mischief · Chaos Coupon Book">
        {COUPONS.map((c) => (
          <div className="print-sheet__item" key={c.id}>
            <Coupon coupon={c} to={to.trim() || undefined} from={from.trim() || undefined} />
          </div>
        ))}
      </PrintSheet>
    </>
  );
}
