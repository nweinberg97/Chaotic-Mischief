import { Bolt } from '../components/Brand';
import { ShopGrid } from '../components/Shop';
import { SiteFooter, SiteHeader } from '../components/SiteChrome';
import { KICKSTARTER } from '../config';
import { href } from '../utils/router';
import './deck.css';
import './shop-page.css';

const STEPS = [
  {
    title: 'Pick your chaos',
    body: 'The coupon book on its own, or the full deck with the coupon book included.',
  },
  {
    title: 'Pay securely',
    body: 'Checkout is handled by Stripe. We never see or store your card details.',
  },
  {
    title: 'Download instantly',
    body: 'You land on a download page the moment payment goes through. Stripe emails your receipt too.',
  },
  {
    title: 'Print and play',
    body: 'Print at home or at any print shop. Letter or A4, actual size, ideally on card stock.',
  },
];

const FAQ = [
  {
    q: 'Is the web game free?',
    a: 'Yes. Play as much as you like on your phone. The downloads are for couples who want the cards on paper.',
  },
  {
    q: 'What’s actually in the full deck PDF?',
    a: 'A cover, a one-page rules sheet, and all 54 cards laid out 9 to a page with matching backs and crop marks, plus the full Chaos Coupon Book.',
  },
  {
    q: 'I paid but lost my download.',
    a: 'Reply to your Stripe receipt email and we’ll send it again.',
  },
  {
    q: 'When does the boxed deck ship?',
    a: `It’s a Kickstarter pre-order. ${KICKSTARTER.shipping}. You’re only charged if the campaign hits its goal.`,
  },
];

export function ShopPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="deck-page shop-page">
        <header className="deck-page__head">
          <p className="eyebrow">The shop</p>
          <h1 className="deck-page__title">Take the chaos offline.</h1>
          <p className="deck-page__lede">
            The web game is free, forever. If you want real cards in your hands, download the printable versions
            today or back the boxed deck.
          </p>
        </header>

        <ShopGrid />

        <section className="shop-steps" aria-labelledby="how-buying-works">
          <h2 id="how-buying-works" className="shop-page__h2">
            How buying works
          </h2>
          <ol className="shop-steps__list">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="shop-steps__num">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="shop-faq" aria-labelledby="shop-faq">
          <h2 id="shop-faq" className="shop-page__h2">
            Questions
          </h2>
          {FAQ.map((f) => (
            <details key={f.q} className="shop-faq__item">
              <summary>
                <Bolt className="shop-faq__bolt" />
                {f.q}
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>

        <div className="deck-page__cta">
          <a href={href('/play')} className="btn btn--big">
            Or just play for free <span aria-hidden>→</span>
          </a>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
