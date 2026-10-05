import { useEffect, useState, type ReactNode } from 'react';
import type { Card } from '../types/game';
import { CardBack, CardFace } from './GameCard';

interface Props {
  card: Card;
  /** Whether the face should be showing. Secret cards stay down until revealed. */
  faceUp: boolean;
  backVariant?: 'standard' | 'secret';
  backLabel?: ReactNode;
  children?: ReactNode;
}

/**
 * A card that is dealt in face-down and flips over. Mount it with a new
 * `key` per draw so the deal animation replays.
 */
export function FlipCard({ card, faceUp, backVariant = 'standard', backLabel, children }: Props) {
  // Land face-down first, then flip, so even visible cards get the reveal moment.
  const [landed, setLanded] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setLanded(true), 320);
    return () => window.clearTimeout(t);
  }, []);
  const showFace = faceUp && landed;

  return (
    <div className="card-frame flip deal-in">
      <div className={`flip__inner ${showFace ? '' : 'is-down'}`}>
        <div className="flip__face" aria-hidden={!showFace} inert={!showFace}>
          <CardFace card={card}>{children}</CardFace>
        </div>
        <div className="flip__back" aria-hidden={showFace}>
          <CardBack variant={backVariant} label={backLabel} />
        </div>
      </div>
    </div>
  );
}
