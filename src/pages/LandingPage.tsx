import { Bolt, ChaosMeter, Wordmark } from '../components/Brand';
import { CategoryIcon, EyeIcon } from '../components/CategoryIcon';
import { Coupon } from '../components/Coupon';
import { CardBack, CardFace } from '../components/GameCard';
import { ShareButton, SiteFooter, SiteHeader } from '../components/SiteChrome';
import { SHOP_URL } from '../config';
import { getCard } from '../data/cards';
import { CATEGORIES, CATEGORY_ORDER } from '../data/categories';
import { COUPON_BY_ID } from '../data/coupons';
import { href } from '../utils/router';
import './landing.css';

const TAGLINES = [
  'Date night needed a villain',
  'Good trouble only',
  'Therapist says communicate. We say compete.',
  'A little bit of chaos is good for the soul',
  'Date night is SOOO back',
  'We’re just here for the plot twist',
  'Let’s get weird',
];

/** One example card per category for the card-type showcase. */
const SHOWCASE: Record<string, string> = {
  action: 'freeze-frame',
  performance: 'shark-tanked',
  'side-quest': 'sneaky-romance',
  challenge: 'you-laugh-you-lose',
  chaos: 'highway-robbery',
  connection: 'top-5s',
  mischief: 'fake-words',
};

const WHAT_CONNECTION_IS = [
  'Laughing until your abs hurt',
  'Doing ridiculous things together',
  'Inside jokes nobody else gets',
  'Being spontaneous for once',
  'Seeing your partner at their weirdest',
  'Stories you’ll still be telling next year',
];

export function LandingPage({ hasSavedGame }: { hasSavedGame: boolean }) {
  const playLabel = hasSavedGame ? 'Resume game' : 'Start playing';
  return (
    <>
      <SiteHeader ctaLabel={playLabel} />
      <main id="main">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="hero">
          <div className="hero__pattern" aria-hidden>
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i}>Chaotic Chaotic Chaotic Chaotic Chaotic Chaotic</span>
            ))}
          </div>
          <div className="hero__inner">
            <div className="hero__copy">
              <p className="eyebrow hero__eyebrow">A couples card game · 54 cards · 2 players</p>
              <h1 className="hero__title">
                Make boring nights <span className="hl">memorable.</span>
              </h1>
              <p className="hero__lede">
                Chaotic Mischief is a deck of challenges, side quests, performances, sneaky missions and the
                occasional honest moment. Draw a card. Cause some problems. First to 21 Chaos Credits wins the
                night.
              </p>
              <div className="hero__ctas">
                <a className="btn btn--big" href={href('/play')}>
                  {playLabel} <span aria-hidden>→</span>
                </a>
                <a className="btn btn--ghost btn--big" href={href('how-it-works')}>
                  How it works
                </a>
              </div>
              <p className="hero__fine">No app. No account. One phone and someone you like.</p>
            </div>

            <div className="hero__fan" aria-hidden>
              <div className="hero__card hero__card--1 card-frame">
                <CardFace card={getCard('top-5s')!} />
              </div>
              <div className="hero__card hero__card--2 card-frame">
                <CardBack />
              </div>
              <div className="hero__card hero__card--3 card-frame">
                <CardFace card={getCard('highway-robbery')!} />
              </div>
              <div className="hero__card hero__card--4 card-frame">
                <CardFace card={getCard('freeze-frame')!} />
              </div>
            </div>
          </div>
        </section>

        <div className="marquee" aria-label="Taglines">
          <div className="marquee__track">
            {[...TAGLINES, ...TAGLINES].map((t, i) => (
              <span key={i} aria-hidden={i >= TAGLINES.length}>
                {t} <Bolt className="marquee__bolt" />
              </span>
            ))}
          </div>
        </div>

        {/* ── The problem ──────────────────────────────────────── */}
        <section className="section problem">
          <div className="section__inner problem__grid">
            <div>
              <p className="eyebrow eyebrow--teal">Date night, a transcript</p>
              <div className="chat" aria-label="A very familiar conversation">
                <p className="chat__msg chat__msg--a">What do you want to watch?</p>
                <p className="chat__msg chat__msg--b">I don’t know.</p>
                <p className="chat__msg chat__msg--a">Want to order something?</p>
                <p className="chat__msg chat__msg--b">Sure.</p>
                <p className="chat__aside">(47 minutes of scrolling later)</p>
                <p className="chat__msg chat__msg--a">…we could just go to bed?</p>
              </div>
            </div>
            <div className="problem__copy">
              <h2 className="section__title">
                Somewhere along the way, you became Serious Adults<sup>™</sup>.
              </h2>
              <p>
                Life got busy. Date night became a negotiation about takeout. You love each other, you’re just
                stuck on the same loop.
              </p>
              <p>
                Chaotic Mischief breaks the loop. It’s a permission slip to stop taking yourselves so seriously
                and do things you’d never normally do together. Things that, frankly, you’ll be bringing up at
                dinner parties for years.
              </p>
              <p className="problem__punch">Date night needed a villain. So we made a deck of them.</p>
            </div>
          </div>
        </section>

        {/* ── Philosophy ───────────────────────────────────────── */}
        <section className="section philosophy">
          <div className="section__inner">
            <p className="eyebrow">The whole idea</p>
            <h2 className="section__title philosophy__title">
              Connection isn’t just deep questions. <span className="hl-ink">It’s also:</span>
            </h2>
            <ul className="philosophy__list">
              {WHAT_CONNECTION_IS.map((line) => (
                <li key={line}>
                  <Bolt className="philosophy__bolt" />
                  {line}
                </li>
              ))}
            </ul>
            <p className="philosophy__close">
              Every card turns an ordinary night into something worth remembering. Some of them also turn it
              into a small competitive war. That’s a feature.
            </p>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────── */}
        <section className="section how" id="how-it-works">
          <div className="section__inner">
            <p className="eyebrow eyebrow--teal">How it works</p>
            <h2 className="section__title">Three steps. Zero dignity required.</h2>
            <ol className="how__steps">
              <li>
                <span className="how__num">1</span>
                <h3>Draw</h3>
                <p>Take turns drawing a card. Some are for both of you. Some are for your eyes only.</p>
              </li>
              <li>
                <span className="how__num">2</span>
                <h3>Cause some problems</h3>
                <p>Do whatever ridiculous thing the card tells you to. Commitment is not optional.</p>
              </li>
              <li>
                <span className="how__num">3</span>
                <h3>Collect chaos</h3>
                <p>Earn Chaos Credits. First to 21 wins the night, plus some rewards your partner owes you.</p>
              </li>
            </ol>

            <div className="rules">
              <div className="rules__item">
                <strong>+1 to +3</strong>
                <span>Complete a card, earn its credits</span>
              </div>
              <div className="rules__item">
                <strong>−1</strong>
                <span>Skip a card. Cowardice has a price.</span>
              </div>
              <div className="rules__item">
                <strong>Winner</strong>
                <span>takes the credits on Challenge cards</span>
              </div>
              <div className="rules__item">
                <strong>???</strong>
                <span>Chaos cards steal, tax and twist the score</span>
              </div>
              <div className="rules__item rules__item--big">
                <strong>21</strong>
                <span>First to 21 Chaos Credits wins</span>
              </div>
            </div>
            <p className="house-rule">
              <span className="house-rule__tag">House rule</span>
              If a card needs something you don’t have, adapt it creatively or swap it for the next card. Chaos is
              flexible.
            </p>
          </div>
        </section>

        {/* ── Card types ───────────────────────────────────────── */}
        <section className="section types" id="cards">
          <div className="section__inner">
            <p className="eyebrow">The deck</p>
            <h2 className="section__title">Seven kinds of trouble.</h2>
            <p className="section__lede">
              Black cards are for doing. Teal cards are secret. White cards are for actually talking. The jokers
              tell you how many Chaos Credits are on the line.
            </p>
            <ul className="types__grid">
              {CATEGORY_ORDER.map((id) => {
                const cat = CATEGORIES[id];
                return (
                  <li key={id} className="type-tile">
                    <div className="type-tile__card card-frame">
                      <CardFace card={getCard(SHOWCASE[id])!} />
                    </div>
                    <div className="type-tile__meta">
                      <h3>
                        <CategoryIcon category={id} size="0.9em" /> {cat.name}
                      </h3>
                      <p className="type-tile__tag">{cat.tagline}</p>
                      <p className="type-tile__blurb">{cat.blurb}</p>
                      <p className="type-tile__facts">
                        <ChaosMeter value={cat.maxCredits} />
                        <span>up to {cat.maxCredits}</span>
                        {cat.visibility === 'secret' && (
                          <span className="type-tile__secret">
                            <EyeIcon size="1em" /> secret
                          </span>
                        )}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <a className="btn btn--ghost" href={href('/deck')}>
              Browse all 54 cards
            </a>
          </div>
        </section>

        {/* ── Secret cards ─────────────────────────────────────── */}
        <section className="section secret">
          <div className="section__inner secret__grid">
            <div className="secret__visual" aria-hidden>
              <div className="card-frame secret__card">
                <CardBack variant="secret" label="For your eyes only" />
              </div>
            </div>
            <div>
              <p className="eyebrow">👀 Only you can see this</p>
              <h2 className="section__title">Some cards are none of their business.</h2>
              <p className="section__lede">
                Chaos, Side Quest and Mischief cards are secret. When you draw one, your partner looks away, you
                read it, and the game carries on while you quietly plot. Slip a fake word into conversation. Inch
                across the couch. Steal their points with unnecessary confidence.
              </p>
              <p className="section__lede">
                Mischief can even run in the background for a few turns. Your partner will see that you’re up to
                something. That’s half the fun.
              </p>
            </div>
          </div>
        </section>

        {/* ── Coupons ──────────────────────────────────────────── */}
        <section className="section coupons-teaser">
          <div className="section__inner coupons-teaser__grid">
            <div>
              <p className="eyebrow eyebrow--teal">Winning has perks</p>
              <h2 className="section__title">Every 7 credits earns a Chaos Coupon.</h2>
              <p className="section__lede">
                Win the night and you claim three. Breakfast in bed. A Yes Day. Your partner on dish duty. Pick
                them at the end of the game and print them out, because a coupon is legally binding (in this
                house).
              </p>
              <a className="btn btn--ink" href={href('/coupons')}>
                See the coupon book
              </a>
            </div>
            <div className="coupons-teaser__stack" aria-hidden>
              {['breakfast-in-bed', 'yes-day', 'dishes'].map((id) => (
                <div key={id} className="coupons-teaser__item">
                  <Coupon coupon={COUPON_BY_ID[id]} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────── */}
        <section className="section final">
          <div className="section__inner final__inner">
            <p className="eyebrow eyebrow--teal">POV: your date night plans just got cancelled</p>
            <h2 className="final__title">
              <Wordmark stacked as="span" />
            </h2>
            <p className="section__lede">Life is way too short to take everything so seriously.</p>
            <div className="hero__ctas final__ctas">
              <a className="btn btn--big" href={href('/play')}>
                {playLabel} <span aria-hidden>→</span>
              </a>
              <ShareButton />
            </div>
            <div className="deck-cta">
              <p>
                <strong>Want the original deck?</strong> The printable PDF version has all 54 cards and the full
                coupon book.
              </p>
              {SHOP_URL ? (
                <a className="btn btn--paper" href={SHOP_URL} target="_blank" rel="noreferrer">
                  Get the Chaotic Mischief deck
                </a>
              ) : (
                <span className="deck-cta__soon">Shop link coming soon</span>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
