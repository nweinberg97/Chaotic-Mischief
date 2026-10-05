import { KICKSTARTER, PRODUCTS, type Product } from '../config';
import { Bolt } from './Brand';
import './shop.css';

/** Opens a Stripe Payment Link, or says plainly that checkout isn't open yet. */
export function BuyButton({ product, className = 'btn' }: { product: Product; className?: string }) {
  if (!product.checkoutUrl) {
    return (
      <span className={`${className} btn--soon`} aria-disabled="true">
        Checkout opening soon
      </span>
    );
  }
  return (
    <a className={className} href={product.checkoutUrl} rel="noopener">
      Buy · {product.price}
    </a>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className={`product ${product.featured ? 'product--featured' : ''}`}>
      {product.featured && <span className="product__flag">Best value</span>}
      <p className="product__kind">Instant download</p>
      <h3 className="product__name">{product.name}</h3>
      <p className="product__price">{product.price}</p>
      <p className="product__tagline">{product.tagline}</p>
      <ul className="product__list">
        {product.includes.map((item) => (
          <li key={item}>
            <Bolt className="product__bolt" />
            {item}
          </li>
        ))}
      </ul>
      <BuyButton product={product} className={`btn btn--block ${product.featured ? '' : 'btn--paper'}`} />
    </article>
  );
}

function KickstarterCard() {
  const k = KICKSTARTER;
  return (
    <article className="product product--physical">
      <p className="product__kind">Physical · Kickstarter</p>
      <h3 className="product__name">{k.name}</h3>
      <p className="product__price">{k.live ? k.price : 'Coming soon'}</p>
      <p className="product__tagline">{k.tagline}</p>
      <ul className="product__list">
        {k.includes.map((item) => (
          <li key={item}>
            <Bolt className="product__bolt" />
            {item}
          </li>
        ))}
      </ul>
      <p className="product__ship">📦 {k.shipping}</p>
      {k.url ? (
        <a className="btn btn--ghost btn--block" href={k.url} target="_blank" rel="noopener noreferrer">
          {k.live ? 'Pre-order on Kickstarter' : 'Get notified on Kickstarter'}
        </a>
      ) : (
        <span className="btn btn--ghost btn--block btn--soon" aria-disabled="true">
          Kickstarter launching soon
        </span>
      )}
    </article>
  );
}

/** The three ways to buy: two instant downloads and the boxed pre-order. */
export function ShopGrid() {
  return (
    <div className="shop-grid">
      <ProductCard product={PRODUCTS.coupons} />
      <ProductCard product={PRODUCTS.bundle} />
      <KickstarterCard />
    </div>
  );
}
