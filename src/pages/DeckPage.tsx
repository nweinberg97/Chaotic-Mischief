import { useState } from 'react';
import { CategoryIcon } from '../components/CategoryIcon';
import { CardBack, CardFace } from '../components/GameCard';
import { SiteFooter, SiteHeader } from '../components/SiteChrome';
import { DeckUpsell } from '../components/Upsell';
import { DECK } from '../data/cards';
import { CATEGORIES, CATEGORY_ORDER } from '../data/categories';
import type { CategoryId } from '../types/game';
import { href } from '../utils/router';
import './deck.css';

type Filter = CategoryId | 'all';

export function DeckPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [peeked, setPeeked] = useState<Set<string>>(new Set());
  const cards = filter === 'all' ? DECK : DECK.filter((c) => c.category === filter);

  function peek(id: string) {
    setPeeked((prev) => new Set(prev).add(id));
  }

  return (
    <>
      <SiteHeader />
      <main id="main" className="deck-page">
        <header className="deck-page__head">
          <p className="eyebrow">The deck</p>
          <h1 className="deck-page__title">All 54 cards.</h1>
          <p className="deck-page__lede">
            Secret cards stay face down here too, in case your partner is reading over your shoulder. Tap one to
            peek.
          </p>
          <div className="chips" role="group" aria-label="Filter by card type">
            <button
              type="button"
              className={`chip ${filter === 'all' ? 'is-on' : ''}`}
              aria-pressed={filter === 'all'}
              onClick={() => setFilter('all')}
            >
              All <span className="chip__n">{DECK.length}</span>
            </button>
            {CATEGORY_ORDER.map((id) => (
              <button
                key={id}
                type="button"
                className={`chip ${filter === id ? 'is-on' : ''}`}
                aria-pressed={filter === id}
                onClick={() => setFilter(id)}
              >
                <CategoryIcon category={id} size={15} />
                {CATEGORIES[id].name}
                <span className="chip__n">{DECK.filter((c) => c.category === id).length}</span>
              </button>
            ))}
          </div>
          {filter !== 'all' && <p className="deck-page__tagline">{CATEGORIES[filter].tagline}</p>}
          <DeckUpsell />
        </header>

        <ul className="deck-grid">
          {cards.map((card) => {
            const hidden = card.visibility === 'secret' && !peeked.has(card.id);
            return (
              <li key={card.id} className="card-frame">
                {hidden ? (
                  <button
                    type="button"
                    className="deck-grid__peek"
                    onClick={() => peek(card.id)}
                    aria-label={`Peek at secret ${CATEGORIES[card.category].name} card #${card.number}`}
                  >
                    <CardBack
                      variant="secret"
                      label={
                        <>
                          👀 {CATEGORIES[card.category].name}
                          <br />
                          Tap to peek
                        </>
                      }
                    />
                  </button>
                ) : (
                  <CardFace card={card} />
                )}
              </li>
            );
          })}
        </ul>

        <div className="deck-page__cta">
          <a href={href('/play')} className="btn btn--big">
            Play with these <span aria-hidden>→</span>
          </a>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
