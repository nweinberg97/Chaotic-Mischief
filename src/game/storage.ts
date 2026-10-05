import type { GameState } from '../types/game';
import { getCard } from '../data/cards';

const KEY = 'chaotic-mischief:game:v1';

function isPlayer(p: unknown): p is { name: string; score: number } {
  return (
    typeof p === 'object' &&
    p !== null &&
    typeof (p as { name: unknown }).name === 'string' &&
    typeof (p as { score: unknown }).score === 'number'
  );
}

/**
 * Checks a parsed save looks like a game we can resume. Anything off and we
 * start fresh rather than render a broken game.
 */
export function parseSave(raw: string | null): GameState | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as GameState;
    if (s?.version !== 1) return null;
    if (!Array.isArray(s.players) || s.players.length !== 2 || !s.players.every(isPlayer)) return null;
    if (!Array.isArray(s.drawPile) || !Array.isArray(s.discard) || !Array.isArray(s.missions)) return null;
    if (!['ready', 'card', 'won'].includes(s.phase)) return null;
    if (s.turn !== 0 && s.turn !== 1) return null;
    if (s.phase === 'card' && (!s.current || !getCard(s.current.cardId))) {
      // Mid-card save pointing at a card that no longer exists: drop back to "ready".
      s.phase = 'ready';
      s.current = null;
    }
    // Forget cards that were removed from the deck since this save.
    s.drawPile = s.drawPile.filter((id) => getCard(id));
    s.missions = s.missions.filter((m) => getCard(m.cardId));
    s.players = [
      { ...s.players[0], score: Math.max(0, Math.floor(s.players[0].score)) },
      { ...s.players[1], score: Math.max(0, Math.floor(s.players[1].score)) },
    ];
    s.lastScoreEvents = [];
    return s;
  } catch {
    return null;
  }
}

export function loadGame(): GameState | null {
  try {
    return parseSave(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function saveGame(state: GameState | null) {
  try {
    if (state) localStorage.setItem(KEY, JSON.stringify(state));
    else localStorage.removeItem(KEY);
  } catch {
    // Private mode / storage full: the game still works, it just won't survive a refresh.
  }
}
