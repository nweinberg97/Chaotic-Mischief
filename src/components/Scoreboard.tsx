import { WIN_SCORE } from '../game/rules';
import type { GameState, PlayerIndex } from '../types/game';
import { CreditToken } from './Brand';

interface Props {
  game: GameState;
  onOpenMission: (player: PlayerIndex) => void;
}

/**
 * Persistent but quiet: two players, their credits, a progress bar to 21,
 * and a little "+2 CHAOS" that floats up when credits change.
 */
export function Scoreboard({ game, onOpenMission }: Props) {
  const active: PlayerIndex = game.current?.actor ?? game.turn;
  return (
    <section className="scoreboard" aria-label="Scores">
      {([0, 1] as PlayerIndex[]).map((i) => {
        const p = game.players[i];
        const missions = game.missions.filter((m) => m.owner === i).length;
        const events = game.lastScoreEvents.filter((e) => e.player === i);
        const lastEvent = events[events.length - 1];
        return (
          <div key={i} className={`score score--${i} ${active === i ? 'is-active' : ''}`}>
            <div className="score__row">
              <span className="score__name">
                {active === i && <span className="score__turn" aria-label="Current turn" />}
                {p.name}
              </span>
              <span className="score__value" key={lastEvent?.id ?? 'static'}>
                {p.score}
                <CreditToken className="score__token" />
              </span>
            </div>
            <div
              className="score__bar"
              role="progressbar"
              aria-label={`${p.name}: ${p.score} of ${WIN_SCORE} Chaos Credits`}
              aria-valuemin={0}
              aria-valuemax={WIN_SCORE}
              aria-valuenow={p.score}
            >
              <span style={{ width: `${Math.min(100, (p.score / WIN_SCORE) * 100)}%` }} />
            </div>
            {missions > 0 && (
              <button
                type="button"
                className="score__mission"
                onClick={() => onOpenMission(i)}
                aria-label={`${p.name} is up to something: open secret missions`}
              >
                <span aria-hidden>🃏</span> Up to something{missions > 1 ? ` ×${missions}` : ''}
              </button>
            )}
            {events.map((e) => (
              <span key={e.id} className={`burst ${e.delta < 0 ? 'burst--neg' : ''}`} aria-hidden>
                {e.delta > 0 ? '+' : '−'}
                {Math.abs(e.delta)} CHAOS
              </span>
            ))}
          </div>
        );
      })}
      <p className="visually-hidden" aria-live="polite">
        {game.log[0]?.text}
      </p>
    </section>
  );
}
