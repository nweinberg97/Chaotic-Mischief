import type { ReactNode } from 'react';
import { CATEGORIES } from '../data/categories';
import { creditLabel } from '../game/rules';
import type { Card } from '../types/game';
import { formatClock } from '../utils/format';
import { ChaosMeter, Wordmark } from './Brand';
import { CategoryIcon, ClockIcon, EyeIcon } from './CategoryIcon';
import './card.css';

interface CardFaceProps {
  card: Card;
  /** Extra content rendered inside the card, under the rule (e.g. a prompt). */
  children?: ReactNode;
}

/**
 * The face of a card, laid out like the physical deck:
 * category → title → instructions → divider + icon → chaos meter, wordmark, number.
 * Sizes are in container units so the same card works as a thumbnail or full-screen.
 */
export function CardFace({ card, children }: CardFaceProps) {
  const category = CATEGORIES[card.category];
  return (
    <article className={`cm-card cm-card--${category.tone}`} aria-label={`${category.name} card: ${card.title}`}>
      <header className="cm-card__top">
        <span className="cm-card__cat">
          <CategoryIcon category={card.category} size="1.15em" />
          {category.name}
        </span>
        {card.visibility === 'secret' ? (
          <span className="cm-card__secret">
            <EyeIcon size="1.1em" /> Secret
          </span>
        ) : (
          card.timerSeconds && (
            <span className="cm-card__time">
              <ClockIcon size="1.05em" /> {formatClock(card.timerSeconds)}
            </span>
          )
        )}
      </header>

      <div className="cm-card__body">
        <h2 className="cm-card__title">{card.title}</h2>
        <p className="cm-card__desc">{card.description}</p>
        {card.specialRule && <p className="cm-card__rule">{card.specialRule}</p>}
        {card.bonus && <p className="cm-card__bonus">{card.bonus}</p>}
        {children}
      </div>

      <div className="cm-card__mark" aria-hidden>
        <span className="cm-card__divider" />
        <span className="cm-card__glyph">
          <CategoryIcon category={card.category} size="58%" />
        </span>
      </div>

      <div className="cm-card__credit">
        <ChaosMeter value={card.creditValue} />
        <span>{creditLabel(card)}</span>
      </div>

      <footer className="cm-card__foot">
        <Wordmark className="cm-card__brand" />
        {card.visibility === 'secret' && card.timerSeconds ? (
          <span className="cm-card__time cm-card__time--foot">
            <ClockIcon size="1.05em" /> {formatClock(card.timerSeconds)}
          </span>
        ) : null}
        <span className="cm-card__num">#{String(card.number).padStart(2, '0')}</span>
      </footer>
    </article>
  );
}

interface CardBackProps {
  variant?: 'standard' | 'secret';
  label?: ReactNode;
}

/** The back of the deck. The secret variant is what your partner sees while you read. */
export function CardBack({ variant = 'standard', label }: CardBackProps) {
  return (
    <div className={`cm-back cm-back--${variant}`} aria-hidden={label ? undefined : true}>
      <div className="cm-back__pattern" aria-hidden>
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i}>{variant === 'secret' ? 'Secret Secret Secret Secret' : 'Chaotic Chaotic Chaotic Chaotic'}</span>
        ))}
      </div>
      <div className="cm-back__inner">
        <Wordmark stacked className="cm-back__mark" />
        {label && <div className="cm-back__label">{label}</div>}
      </div>
    </div>
  );
}
