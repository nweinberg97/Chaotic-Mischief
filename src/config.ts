/**
 * Shop settings.
 *
 * To turn a product on, paste its Stripe Payment Link into `checkoutUrl`.
 * In Stripe, set the link's "After payment" option to redirect to
 * the site's thank-you page:
 *
 *   https://<your-site>/#/thanks?item=<product id>&dl=<url-encoded download link>
 *
 * The download link lives only in Stripe (not in this public repo), so the
 * files can't be found by reading the code. Downloads must be hosted on one
 * of DOWNLOAD_HOSTS below.
 *
 * A product with an empty `checkoutUrl` shows "Checkout opening soon" instead
 * of a buy button, so nothing on the site pretends to sell something it can't.
 */

export type ProductId = 'coupons' | 'bundle';

export interface Product {
  id: ProductId;
  name: string;
  price: string;
  tagline: string;
  includes: string[];
  checkoutUrl: string;
  featured?: boolean;
}

export const PRODUCTS: Record<ProductId, Product> = {
  coupons: {
    id: 'coupons',
    name: 'The Chaos Coupon Book',
    price: '$5',
    tagline: 'Every reward in the game, ready to print and redeem.',
    includes: [
      'All 31 Chaos Coupons, print-ready',
      '5 blank coupons to write your own',
      'Instant PDF download, print at home',
    ],
    checkoutUrl: '',
  },
  bundle: {
    id: 'bundle',
    name: 'The Full Deck + Coupon Book',
    price: '$12',
    tagline: 'The whole game on paper. Print it, cut it, cause problems.',
    includes: [
      'All 54 cards as a print-and-play PDF (fronts + backs)',
      'Rules sheet and card legend',
      'The complete Chaos Coupon Book',
      'Instant PDF download',
    ],
    checkoutUrl: '',
    featured: true,
  },
};

/**
 * The physical boxed deck, pre-ordered through Kickstarter.
 * Paste the campaign URL (or its pre-launch "notify me" page) into `url`.
 * `live` switches the button from "Get notified" to "Pre-order".
 */
export const KICKSTARTER = {
  url: '',
  live: false,
  name: 'The Boxed Deck',
  price: 'Pre-order',
  shipping: 'Ships about 3 months after the campaign ends',
  tagline: 'Real cards. Real box. Real consequences.',
  includes: [
    'All 54 cards, printed on proper card stock',
    'The Chaos Coupon Book, printed',
    'A box worth leaving on the coffee table',
    'Backer-only early pricing',
  ],
};

/** Hosts a thank-you page is allowed to hand out download links for. */
export const DOWNLOAD_HOSTS = [
  'drive.google.com',
  'docs.google.com',
  'www.dropbox.com',
  'dropbox.com',
  'dl.dropboxusercontent.com',
  'onedrive.live.com',
  '1drv.ms',
];

export const SITE_TITLE = 'Chaotic Mischief';
