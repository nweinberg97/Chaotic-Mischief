import { CATEGORIES, CATEGORY_ORDER } from '../data/categories';
import { CREDITS_PER_COUPON, SKIP_PENALTY, WIN_SCORE } from '../game/rules';
import { CategoryIcon } from './CategoryIcon';

/** The rules, short enough to read while your partner is waiting. */
export function HowToPlay() {
  return (
    <div className="howto">
      <h2 className="howto__title">How to play</h2>
      <ol className="howto__steps">
        <li>
          <strong>Draw.</strong> Take turns drawing a card. Teal cards are secret: your partner looks away while you
          read.
        </li>
        <li>
          <strong>Do the thing.</strong> Complete it and earn the Chaos Credits on the card. Skip it and lose{' '}
          {SKIP_PENALTY}.
        </li>
        <li>
          <strong>Win.</strong> First to {WIN_SCORE} Chaos Credits wins the night. Every {CREDITS_PER_COUPON} credits
          earns a reward coupon. The winner claims at least 3.
        </li>
      </ol>
      <ul className="howto__cats">
        {CATEGORY_ORDER.map((id) => (
          <li key={id}>
            <CategoryIcon category={id} size={18} />
            <span>
              <strong>{CATEGORIES[id].name}</strong> {CATEGORIES[id].tagline}
            </span>
          </li>
        ))}
      </ul>
      <p className="howto__house">
        <strong>House rule:</strong> if a card needs something you don’t have, adapt it creatively or swap it for the
        next card. Chaos is flexible.
      </p>
    </div>
  );
}
