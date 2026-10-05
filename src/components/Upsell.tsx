import { PRODUCTS } from '../config';
import { BuyButton } from './Shop';
import './shop.css';

/** "Want the whole book?" — shown where people already want coupons. */
export function CouponUpsell({ title, sub }: { title: string; sub: string }) {
  return (
    <aside className="upsell" aria-label="Get the full coupon book">
      <div className="upsell__copy">
        <p className="upsell__title">{title}</p>
        <p className="upsell__sub">{sub}</p>
      </div>
      <div className="upsell__actions">
        <BuyButton product={PRODUCTS.coupons} className="btn btn--ink" />
        {PRODUCTS.bundle.checkoutUrl && (
          <a className="btn btn--ghost" href={PRODUCTS.bundle.checkoutUrl} rel="noopener">
            Deck + coupons · {PRODUCTS.bundle.price}
          </a>
        )}
      </div>
    </aside>
  );
}
