import { PRODUCTS, type ProductId } from '../config';
import { href } from '../utils/router';
import { BuyButton } from './Shop';
import './shop.css';

interface UpsellProps {
  product: ProductId;
  title: string;
  sub: string;
}

/** A buy strip shown where people already want the thing: coupons after winning, cards in the deck explorer. */
export function Upsell({ product, title, sub }: UpsellProps) {
  return (
    <aside className="upsell" aria-label={PRODUCTS[product].name}>
      <div className="upsell__copy">
        <p className="upsell__title">{title}</p>
        <p className="upsell__sub">{sub}</p>
      </div>
      <div className="upsell__actions">
        <BuyButton product={PRODUCTS[product]} className="btn btn--ink" />
        <a className="link-btn upsell__more" href={href('/shop')}>
          How it works
        </a>
      </div>
    </aside>
  );
}

export function CouponUpsell({ title, sub }: { title: string; sub: string }) {
  return <Upsell product="coupons" title={title} sub={sub} />;
}

export function DeckUpsell() {
  const p = PRODUCTS.bundle;
  return (
    <Upsell
      product="bundle"
      title={`Download the full deck · ${p.price}`}
      sub="All 54 cards as a print-and-play PDF (fronts + backs), the rules sheet and the complete coupon book. Instant download after checkout."
    />
  );
}
