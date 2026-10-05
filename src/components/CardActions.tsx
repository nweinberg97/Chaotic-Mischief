import { useState } from 'react';
import { SKIP_PENALTY } from '../game/rules';
import type { Card, GameState, Outcome, PlayerIndex } from '../types/game';

interface Props {
  game: GameState;
  card: Card;
  onResolve: (outcome: Outcome) => void;
  onHide: () => void;
}

/**
 * The buttons under a card. Each mechanic gets the smallest set of choices
 * that resolves it, so nobody has to think about scoring.
 */
export function CardActions({ game, card, onResolve, onHide }: Props) {
  const current = game.current!;
  const actor = game.players[current.actor].name;
  const n = card.creditValue;
  const [count, setCount] = useState(card.maxCount ?? 0);

  const skip = (
    <button type="button" className="btn btn--ghost actions__skip" onClick={() => onResolve({ kind: 'skip' })}>
      Skip <span className="btn__sub">−{SKIP_PENALTY}</span>
    </button>
  );
  const hide =
    card.visibility === 'secret' ? (
      <button type="button" className="link-btn" onClick={onHide}>
        Flip it face down
      </button>
    ) : null;

  switch (card.mechanic) {
    case 'standard':
      return (
        <div className="actions">
          <div className="actions__row">
            <button type="button" className="btn btn--big actions__main" onClick={() => onResolve({ kind: 'complete' })}>
              I did it <span className="btn__sub">+{n}</span>
            </button>
            {skip}
          </div>
          {hide}
        </div>
      );

    case 'shared':
      return (
        <div className="actions">
          <div className="actions__row">
            <button type="button" className="btn btn--big actions__main" onClick={() => onResolve({ kind: 'shared' })}>
              We did it <span className="btn__sub">+{n} each</span>
            </button>
            {skip}
          </div>
        </div>
      );

    case 'challenge': {
      const stake = n * (current.doubled ? 2 : 1) + game.modifiers.chaosPile;
      return (
        <div className="actions">
          <p className="actions__q">Who won? Winner takes {stake}.</p>
          <div className="actions__row actions__row--split">
            {([0, 1] as PlayerIndex[]).map((i) => (
              <button
                key={i}
                type="button"
                className={`btn btn--big ${i === 0 ? '' : 'btn--paper'} actions__winner`}
                onClick={() => onResolve({ kind: 'challenge', winner: i })}
              >
                <span className="actions__winner-name">{game.players[i].name}</span> wins
              </button>
            ))}
          </div>
          <button type="button" className="link-btn" onClick={() => onResolve({ kind: 'skip' })}>
            Chicken out ({actor} −{SKIP_PENALTY})
          </button>
        </div>
      );
    }

    case 'mischief':
      return (
        <div className="actions">
          {card.maxCount ? (
            <>
              <div className="stepper" role="group" aria-label="How many did you get away with?">
                <span className="stepper__label">Got away with</span>
                <button type="button" onClick={() => setCount((c) => Math.max(0, c - 1))} aria-label="One fewer">
                  −
                </button>
                <output className="stepper__value">{count}</output>
                <button
                  type="button"
                  onClick={() => setCount((c) => Math.min(card.maxCount!, c + 1))}
                  aria-label="One more"
                >
                  +
                </button>
              </div>
              <div className="actions__row">
                <button
                  type="button"
                  className="btn btn--big actions__main"
                  onClick={() => onResolve({ kind: 'mischief', count })}
                >
                  Lock it in <span className="btn__sub">+{count}</span>
                </button>
                {skip}
              </div>
            </>
          ) : (
            <div className="actions__row">
              <button
                type="button"
                className="btn btn--big actions__main"
                onClick={() => onResolve({ kind: 'mischief', count: 1 })}
              >
                Pulled it off <span className="btn__sub">+{n}</span>
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => onResolve({ kind: 'mischief', count: 0 })}>
                Busted <span className="btn__sub">+0</span>
              </button>
            </div>
          )}
          <div className="actions__row actions__row--quiet">
            <button type="button" className="link-btn" onClick={() => onResolve({ kind: 'mission' })}>
              Keep it running in secret
            </button>
            {card.maxCount ? null : (
              <button type="button" className="link-btn" onClick={() => onResolve({ kind: 'skip' })}>
                Skip (−{SKIP_PENALTY})
              </button>
            )}
          </div>
        </div>
      );

    case 'chaos':
      return (
        <div className="actions">
          <div className="actions__row">
            <button type="button" className="btn btn--big actions__main actions__chaos" onClick={() => onResolve({ kind: 'chaos' })}>
              Apply chaos
            </button>
            {skip}
          </div>
          {hide}
        </div>
      );
  }
}
