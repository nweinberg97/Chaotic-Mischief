/**
 * Print-ready PDFs of the deck and coupon book.
 *
 * Not part of the public site: Vite only builds index.html. To regenerate the
 * PDFs, run `npm run dev`, open /print.html?doc=deck (or coupons, bundle) and
 * save as PDF: Letter, no margins, background graphics on.
 */
import { Bolt, ChaosMeter, Wordmark } from '../components/Brand';
import { CategoryIcon } from '../components/CategoryIcon';
import { Coupon } from '../components/Coupon';
import { CardBack, CardFace } from '../components/GameCard';
import { DECK } from '../data/cards';
import { CATEGORIES, CATEGORY_ORDER } from '../data/categories';
import { COUPON_FINE_PRINT, COUPONS } from '../data/coupons';
import { CREDITS_PER_COUPON, SKIP_PENALTY, WIN_SCORE } from '../game/rules';
import type { Card } from '../types/game';
import './print.css';

const CARDS_PER_SHEET = 9;
const COUPONS_PER_SHEET = 4;
const BLANK_COUPONS = 5;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function Cover({ title, sub }: { title: string; sub: string }) {
  return (
    <section className="sheet sheet--cover">
      <div className="cover__pattern" aria-hidden>
        {Array.from({ length: 16 }, (_, i) => (
          <span key={i}>Chaotic Chaotic Chaotic Chaotic</span>
        ))}
      </div>
      <div className="cover__inner">
        <Wordmark stacked className="cover__mark" />
        <p className="cover__title">{title}</p>
        <p className="cover__sub">{sub}</p>
      </div>
      <p className="cover__foot">Make boring nights memorable.</p>
    </section>
  );
}

function RulesSheet() {
  return (
    <section className="sheet sheet--rules">
      <h1 className="rules__h1">How to play</h1>
      <ol className="rules__steps">
        <li>
          <strong>Shuffle and take turns drawing.</strong> Teal cards are secret: read them yourself and don’t show your
          partner.
        </li>
        <li>
          <strong>Do what the card says.</strong> Complete it to earn the Chaos Credits shown on the card. Skip it and
          lose {SKIP_PENALTY}.
        </li>
        <li>
          <strong>Challenge cards:</strong> compete; the winner takes the credits.{' '}
          <strong>Chaos cards:</strong> bend the rules exactly as written.
        </li>
        <li>
          <strong>First to {WIN_SCORE} Chaos Credits wins the night.</strong> Every {CREDITS_PER_COUPON} credits earns
          a Chaos Coupon. The winner claims at least 3.
        </li>
      </ol>
      <p className="rules__house">
        <strong>House rule:</strong> if a card needs something you don’t have, adapt it creatively or swap it for the
        next card. Chaos is flexible.
      </p>

      <h2 className="rules__h2">The cards</h2>
      <ul className="rules__legend">
        {CATEGORY_ORDER.map((id) => {
          const c = CATEGORIES[id];
          return (
            <li key={id}>
              <span className={`rules__swatch rules__swatch--${c.tone}`}>
                <CategoryIcon category={id} size="60%" />
              </span>
              <span>
                <strong>{c.name}</strong>
                {c.visibility === 'secret' ? ' · secret' : ''} — {c.tagline}
                <span className="rules__max">
                  <ChaosMeter value={c.maxCredits} /> up to {c.maxCredits}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      <h2 className="rules__h2">Printing</h2>
      <ul className="rules__print">
        <li>Print at <strong>actual size / 100%</strong> on Letter or A4. Card stock (250–300 gsm) feels best.</li>
        <li>
          Card sheets come in pairs: fronts, then backs. Print <strong>double-sided, flip on long edge</strong>, and
          the backs line up. Single-sided printer? Print both and glue them back to back.
        </li>
        <li>Cut along the crop marks. Each card is 2.5 × 3.5 in, the size of a standard playing card.</li>
        <li>Keep track of Chaos Credits with pen and paper, coins, or the free web game.</li>
      </ul>
    </section>
  );
}

/** Crop marks around a 3×3 grid of 2.5×3.5in cards. */
function CropMarks() {
  const xs = [0, 1, 2, 3].map((i) => `${i * 2.5}in`);
  const ys = [0, 1, 2, 3].map((i) => `${i * 3.5}in`);
  return (
    <div className="crops" aria-hidden>
      {xs.map((x) => (
        <span key={`t${x}`} className="crop crop--v crop--top" style={{ left: x }} />
      ))}
      {xs.map((x) => (
        <span key={`b${x}`} className="crop crop--v crop--bottom" style={{ left: x }} />
      ))}
      {ys.map((y) => (
        <span key={`l${y}`} className="crop crop--h crop--left" style={{ top: y }} />
      ))}
      {ys.map((y) => (
        <span key={`r${y}`} className="crop crop--h crop--right" style={{ top: y }} />
      ))}
    </div>
  );
}

function CardSheets({ cards }: { cards: Card[] }) {
  return (
    <>
      {chunk(cards, CARDS_PER_SHEET).map((group, i) => {
        // Backs are mirrored left↔right so they line up with long-edge duplex printing.
        const rows = chunk(group, 3);
        const mirrored = rows.flatMap((row) => [...row, ...Array(3 - row.length).fill(null)].reverse());
        return [
          <section key={`f${i}`} className="sheet sheet--cards">
            <div className="card-grid">
              {group.map((card) => (
                <div key={card.id} className="card-frame print-card">
                  <CardFace card={card} />
                </div>
              ))}
              <CropMarks />
            </div>
            <p className="sheet__label">Fronts · sheet {i + 1}</p>
          </section>,
          <section key={`b${i}`} className="sheet sheet--cards">
            <div className="card-grid">
              {mirrored.map((card, j) => (
                <div key={j} className="card-frame print-card">
                  {card && <CardBack />}
                </div>
              ))}
              <CropMarks />
            </div>
            <p className="sheet__label">Backs · sheet {i + 1}</p>
          </section>,
        ];
      })}
    </>
  );
}

function BlankCoupon({ n }: { n: number }) {
  return (
    <div className="coupon coupon--blank">
      <div className="coupon__main">
        <p className="coupon__kicker">I promise to give you</p>
        <div className="coupon__title coupon__write" />
        <p className="coupon__once">Just one time</p>
        <p className="coupon__fine">{COUPON_FINE_PRINT}</p>
      </div>
      <div className="coupon__stub">
        <span className="coupon__no">W{String(n).padStart(2, '0')}</span>
        <span className="coupon__emoji">✍️</span>
        <span className="coupon__brand">
          Chaotic
          <br />
          Mischief
        </span>
      </div>
      <div className="coupon__code">
        {Array.from({ length: 26 }, (_, i) => (
          <span key={i} style={{ height: `${(1 + ((i * 7 + n) % 3)) * 0.45}cqi` }} />
        ))}
      </div>
    </div>
  );
}

function CouponSheets() {
  const items = [
    ...COUPONS.map((c) => <Coupon key={c.id} coupon={c} />),
    ...Array.from({ length: BLANK_COUPONS }, (_, i) => <BlankCoupon key={`w${i}`} n={i + 1} />),
  ];
  return (
    <>
      {chunk(items, COUPONS_PER_SHEET).map((group, i) => (
        <section key={i} className="sheet sheet--coupons">
          {group.map((item, j) => (
            <div key={j} className="print-coupon">
              {item}
            </div>
          ))}
          <p className="sheet__label">
            <Bolt className="sheet__bolt" /> Cut along the dashed lines · coupons {i * COUPONS_PER_SHEET + 1}–
            {Math.min((i + 1) * COUPONS_PER_SHEET, items.length)}
          </p>
        </section>
      ))}
    </>
  );
}

export type PrintDoc = 'deck' | 'coupons' | 'bundle';

export function PrintApp({ doc }: { doc: PrintDoc }) {
  const deck = doc === 'deck' || doc === 'bundle';
  const coupons = doc === 'coupons' || doc === 'bundle';
  return (
    <div className="print-doc">
      {deck && (
        <>
          <Cover title="Print & Play Edition" sub="54 cards · 2 players · first to 21 wins" />
          <RulesSheet />
          <CardSheets cards={DECK} />
        </>
      )}
      {coupons && (
        <>
          <Cover title="The Chaos Coupon Book" sub={`${COUPONS.length} rewards + ${BLANK_COUPONS} write-your-own`} />
          <CouponSheets />
        </>
      )}
    </div>
  );
}
