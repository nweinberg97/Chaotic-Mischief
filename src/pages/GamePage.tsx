import { useEffect, useState } from 'react';
import { ActivityTimer } from '../components/ActivityTimer';
import { Wordmark } from '../components/Brand';
import { CardActions } from '../components/CardActions';
import { FlipCard } from '../components/FlipCard';
import { CardBack, CardFace } from '../components/GameCard';
import { HowToPlay } from '../components/HowToPlay';
import { Scoreboard } from '../components/Scoreboard';
import { Sheet } from '../components/Sheet';
import { getCard, PLAYABLE_IDS } from '../data/cards';
import { CATEGORIES } from '../data/categories';
import { other } from '../game/rules';
import type { GameApi } from '../game/useGame';
import type { GameState, PlayerIndex } from '../types/game';
import { formatClock } from '../utils/format';
import { href, navigate } from '../utils/router';
import { WinnerScreen } from './WinnerScreen';
import './game.css';

export function GamePage({ api }: { api: GameApi }) {
  const game = api.game!;
  if (game.phase === 'won') return <WinnerScreen api={api} />;
  return <GameScreen api={api} game={game} />;
}

/** Ticks once a second while something on screen is counting down. */
function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active]);
  return now;
}

function GameScreen({ api, game }: { api: GameApi; game: GameState }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirm, setConfirm] = useState<null | 'restart' | 'new'>(null);
  const [missionFor, setMissionFor] = useState<PlayerIndex | null>(null);
  const [shuffleKey, setShuffleKey] = useState(0);

  const card = game.current ? getCard(game.current.cardId) : undefined;
  const curse = game.modifiers.curse;
  const now = useNow(Boolean(curse));
  const curseLeft = curse ? (curse.endsAt - now) / 1000 : 0;

  const turnName = game.players[game.turn].name;
  const drawn = PLAYABLE_IDS.length - game.drawPile.length;
  const backdrop = card ? CATEGORIES[card.category] : null;

  // Space / Enter draws a card when nothing else has focus.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target !== document.body || menuOpen) return;
      if ((e.key === ' ' || e.key === 'Enter') && game.phase === 'ready' && game.drawPile.length > 0) {
        e.preventDefault();
        api.draw();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [api, game.phase, game.drawPile.length, menuOpen]);

  function reshuffle() {
    api.reshuffle();
    setShuffleKey((k) => k + 1);
  }

  return (
    <div className={`game ${backdrop ? `game--${backdrop.tone}` : ''}`}>
      <header className="game__bar">
        <a href={href('/')} className="game__home" aria-label="Chaotic Mischief home">
          <Wordmark />
        </a>
        <div className="game__deck-count" aria-label={`${game.drawPile.length} cards left in the deck`}>
          <span className="game__deck-meter">
            <span style={{ width: `${(drawn / PLAYABLE_IDS.length) * 100}%` }} />
          </span>
          {game.drawPile.length} left
        </div>
        <button type="button" className="game__menu-btn" onClick={() => setMenuOpen(true)} aria-label="Menu">
          <span />
          <span />
          <span />
        </button>
      </header>

      <Scoreboard game={game} onOpenMission={setMissionFor} />

      <div className="banners" aria-live="polite">
        {curse && curseLeft > 0 && (
          <p className="banner">
            🪄 <strong>{game.players[curse.target].name}</strong> is cursed · {formatClock(curseLeft)}
          </p>
        )}
        {game.modifiers.doubleNextChallenge && <p className="banner">⚡ Next challenge pays double</p>}
        {game.modifiers.chaosPile > 0 && (
          <p className="banner">🪙 Chaos Pile: {game.modifiers.chaosPile} to the next challenge winner</p>
        )}
        {game.modifiers.imposter !== null && !game.current && (
          <p className="banner">🎭 There’s an imposter among us…</p>
        )}
      </div>

      <main className="stage" id="main">
        <div className="stage__pattern" aria-hidden>
          {Array.from({ length: 16 }, (_, i) => (
            <span key={i}>{`${backdrop?.name ?? 'Chaotic'} `.repeat(8)}</span>
          ))}
        </div>

        {game.phase === 'ready' && (
          <div className="stage__ready">
            {game.drawPile.length > 0 ? (
              <button
                type="button"
                className="deck"
                key={shuffleKey}
                onClick={api.draw}
                tabIndex={-1}
                aria-hidden
              >
                <span className="deck__card deck__card--3 card-frame">
                  <CardBack />
                </span>
                <span className="deck__card deck__card--2 card-frame">
                  <CardBack />
                </span>
                <span className="deck__card deck__card--1 card-frame">
                  <CardBack label="Tap to draw" />
                </span>
              </button>
            ) : (
              <div className="empty-deck">
                <h2>That’s the whole deck.</h2>
                <p>54 cards and still nobody’s at 21? Respect. Shuffle and keep going.</p>
                <button type="button" className="btn btn--big" onClick={reshuffle}>
                  Reshuffle the deck
                </button>
              </div>
            )}
          </div>
        )}

        {game.phase === 'card' && card && game.current && (
          <div className="stage__card">
            {game.current.actor !== game.current.drawer && (
              <p className="callout">
                🎭 IMPOSTER: <strong>{game.players[game.current.actor].name}</strong> does this one instead
              </p>
            )}
            {game.current.sabotagedBy !== null && game.current.revealed && (
              <p className="callout">
                😈 <strong>{game.players[game.current.sabotagedBy].name}</strong> has a Sabotage Pass. They may
                interfere once.
              </p>
            )}
            {game.current.doubled && (
              <p className="callout">⚡ DOUBLE TROUBLE: worth double. Loser owes the winner a dare.</p>
            )}
            <FlipCard
              key={game.current.cardId + game.round}
              card={card}
              faceUp={game.current.revealed}
              backVariant={card.visibility === 'secret' ? 'secret' : 'standard'}
              backLabel={
                card.visibility === 'secret' ? (
                  <>
                    👀 Secret card
                    <br />
                    For {game.players[game.current.actor].name}’s eyes only
                  </>
                ) : undefined
              }
            >
              {card.prompts && <PromptPicker prompts={card.prompts} />}
            </FlipCard>
          </div>
        )}
      </main>

      <footer className="dock">
        {game.phase === 'ready' && game.drawPile.length > 0 && (
          <>
            <p className="dock__turn">
              <span className="dock__name">{turnName}</span>, you’re up.
            </p>
            <button type="button" className="btn btn--big btn--block dock__draw" onClick={api.draw}>
              Draw card
            </button>
            {game.log[0] && <p className="dock__log">{game.log[0].text}</p>}
          </>
        )}

        {game.phase === 'card' && card && game.current && !game.current.revealed && (
          <>
            <p className="dock__turn">
              <span className="dock__name">{game.players[other(game.current.actor)].name}</span>, look away. 👀
            </p>
            <button type="button" className="btn btn--big btn--block" onClick={api.reveal}>
              Reveal to me, {game.players[game.current.actor].name}
            </button>
          </>
        )}

        {game.phase === 'card' && card && game.current?.revealed && (
          <>
            {card.timerSeconds && <ActivityTimer key={card.id + game.round} seconds={card.timerSeconds} />}
            <CardActions key={card.id + game.round} game={game} card={card} onResolve={api.resolve} onHide={api.hide} />
          </>
        )}
      </footer>

      {/* ── Menu ──────────────────────────────────────────────── */}
      <Sheet
        open={menuOpen}
        onClose={() => {
          setMenuOpen(false);
          setConfirm(null);
        }}
        label="Game menu"
      >
        {confirm ? (
          <div className="menu-confirm">
            <h2>{confirm === 'restart' ? 'Restart the game?' : 'Start over with new players?'}</h2>
            <p>
              {confirm === 'restart'
                ? `Scores go back to zero and the deck gets reshuffled. ${game.players[0].name} and ${game.players[1].name} stay.`
                : 'This ends the current game for good.'}
            </p>
            <div className="menu__row">
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => {
                  if (confirm === 'restart') {
                    api.restart();
                    setShuffleKey((k) => k + 1);
                  } else {
                    api.clear();
                    navigate('/play');
                  }
                  setConfirm(null);
                  setMenuOpen(false);
                }}
              >
                Yes, {confirm === 'restart' ? 'restart' : 'new game'}
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setConfirm(null)}>
                Never mind
              </button>
            </div>
          </div>
        ) : (
          <>
            <HowToPlay />
            <div className="menu__row">
              <button type="button" className="btn btn--ghost" onClick={() => setConfirm('restart')}>
                Restart game
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setConfirm('new')}>
                New players
              </button>
            </div>
            {game.log.length > 1 && (
              <details className="menu__log">
                <summary>What just happened</summary>
                <ol>
                  {game.log.slice(0, 12).map((l) => (
                    <li key={l.id}>{l.text}</li>
                  ))}
                </ol>
              </details>
            )}
            <p className="menu__links">
              <a href={href('/deck')}>Browse the deck</a> · <a href={href('/coupons')}>Coupon book</a> ·{' '}
              <a href={href('/')}>Home</a>
            </p>
          </>
        )}
      </Sheet>

      <MissionSheet game={game} player={missionFor} onClose={() => setMissionFor(null)} onResolve={api.resolveMission} />
    </div>
  );
}

/** Conversation starters for cards like The Deep End. */
function PromptPicker({ prompts }: { prompts: string[] }) {
  const [i, setI] = useState<number | null>(null);
  return (
    <div className="prompt">
      {i !== null && <p className="prompt__text">“{prompts[i]}”</p>}
      <button
        type="button"
        className="prompt__btn"
        onClick={() => setI((prev) => ((prev ?? -1) + 1 + Math.floor(Math.random() * (prompts.length - 1))) % prompts.length)}
      >
        {i === null ? 'Need a question?' : 'Another one'}
      </button>
    </div>
  );
}

interface MissionProps {
  game: GameState;
  player: PlayerIndex | null;
  onClose: () => void;
  onResolve: (cardId: string, points: number) => void;
}

/** Secret missions: mischief a player chose to keep running in the background. */
function MissionSheet({ game, player, onClose, onResolve }: MissionProps) {
  const [revealed, setRevealed] = useState(false);
  const missions = player === null ? [] : game.missions.filter((m) => m.owner === player);
  const open = player !== null && missions.length > 0;
  const close = () => {
    setRevealed(false);
    onClose();
  };

  return (
    <Sheet open={open} onClose={close} label="Secret missions">
      {player !== null && !revealed && (
        <div className="mission-gate">
          <div className="card-frame mission-gate__card">
            <CardBack variant="secret" />
          </div>
          <h2>For {game.players[player].name}’s eyes only</h2>
          <p>
            {game.players[other(player)].name}, look away. {game.players[player].name}, ready to cash in (or confess)?
          </p>
          <button type="button" className="btn btn--big" onClick={() => setRevealed(true)}>
            Show my missions
          </button>
        </div>
      )}
      {player !== null &&
        revealed &&
        missions.map((m) => {
          const card = getCard(m.cardId)!;
          const max = card.maxCount ?? card.creditValue;
          return (
            <div key={m.cardId} className="mission">
              <div className="card-frame mission__card">
                <CardFace card={card} />
              </div>
              <div className="mission__actions">
                {card.maxCount ? (
                  Array.from({ length: max + 1 }, (_, n) => (
                    <button
                      key={n}
                      type="button"
                      className={`btn ${n === 0 ? 'btn--ghost' : ''}`}
                      onClick={() => {
                        onResolve(m.cardId, n);
                        close();
                      }}
                    >
                      {n === 0 ? 'Busted (+0)' : `Got away with ${n} (+${n})`}
                    </button>
                  ))
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        onResolve(m.cardId, max);
                        close();
                      }}
                    >
                      Pulled it off (+{max})
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={() => {
                        onResolve(m.cardId, 0);
                        close();
                      }}
                    >
                      Busted (+0)
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
    </Sheet>
  );
}
