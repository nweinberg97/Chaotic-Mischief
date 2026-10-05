/**
 * Chaotic Mischief rules engine.
 *
 * Everything here is pure: (state, action) → state. Randomness and time are
 * passed in through actions so the engine is deterministic and testable.
 * The UI never computes scores itself.
 */
import { CATEGORIES } from '../data/categories';
import { getCard, PLAYABLE_IDS } from '../data/cards';
import type {
  Card,
  GameState,
  LogEntry,
  Modifiers,
  Outcome,
  PlayerIndex,
  ScoreEvent,
} from '../types/game';

export const WIN_SCORE = 21;
export const CREDITS_PER_COUPON = 7;
export const SKIP_PENALTY = 1;
export const MAX_NAME_LENGTH = 16;
const LOG_LIMIT = 30;

export type GameAction =
  | { type: 'start'; names: [string, string]; order: string[]; first: PlayerIndex }
  | { type: 'draw' }
  | { type: 'reveal' }
  | { type: 'hide' }
  | { type: 'resolve'; outcome: Outcome; now: number }
  | { type: 'resolveMission'; cardId: string; points: number }
  | { type: 'reshuffle'; order: string[] }
  | { type: 'restart'; order: string[]; first: PlayerIndex }
  | { type: 'setCoupons'; player: PlayerIndex; couponIds: string[] };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const other = (p: PlayerIndex): PlayerIndex => (p === 0 ? 1 : 0);

/** Fisher–Yates. `rng` returns [0, 1). */
export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function freshDeckOrder(rng: () => number = Math.random, exclude: string[] = []): string[] {
  return shuffle(
    PLAYABLE_IDS.filter((id) => !exclude.includes(id)),
    rng,
  );
}

export function cleanName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH);
}

/** Returns an error message, or null if the pair of names is good to go. */
export function validateNames(a: string, b: string): string | null {
  const x = cleanName(a);
  const y = cleanName(b);
  if (!x || !y) return 'We need two names. Chaos requires witnesses.';
  if (x.toLowerCase() === y.toLowerCase()) return 'Same name twice? Bold. Give one of you a nickname.';
  return null;
}

/** Coupons a player has earned: 1 per 7 credits (the winner always gets at least 3). */
export function couponAllowance(state: GameState, player: PlayerIndex): number {
  const earned = Math.floor(state.players[player].score / CREDITS_PER_COUPON);
  return state.winner === player ? Math.max(3, earned) : earned;
}

function emptyModifiers(): Modifiers {
  return { doubleNextChallenge: false, chaosPile: 0, imposter: null, sabotageBy: null, curse: null };
}

export function createGame(names: [string, string], order: string[], first: PlayerIndex): GameState {
  const [a, b] = names.map(cleanName);
  return {
    version: 1,
    players: [
      { name: a || 'Player 1', score: 0 },
      { name: b || 'Player 2', score: 0 },
    ],
    turn: first,
    phase: 'ready',
    drawPile: order.slice(),
    discard: [],
    current: null,
    modifiers: emptyModifiers(),
    missions: [],
    winner: null,
    round: 1,
    log: [{ id: 1, text: `${a || 'Player 1'} draws first. Good luck. You’ll need it.` }],
    lastScoreEvents: [],
    coupons: [[], []],
    nextId: 2,
  };
}

/** Which buttons a card offers. Shared by the UI and the reducer's validation. */
export function allowedOutcomes(card: Card): Outcome['kind'][] {
  switch (card.mechanic) {
    case 'standard':
      return ['complete', 'skip'];
    case 'challenge':
      return ['challenge', 'skip'];
    case 'shared':
      return ['shared', 'skip'];
    case 'mischief':
      return ['mischief', 'mission', 'skip'];
    case 'chaos':
      return ['chaos', 'skip'];
  }
}

/** Human label for what a card is worth, e.g. "+2 CHAOS CREDITS" or "STEAL 1 CREDIT". */
export function creditLabel(card: Card): string {
  const n = card.creditValue;
  const credits = (x: number) => `${x} CHAOS CREDIT${x === 1 ? '' : 'S'}`;
  const e = card.chaosEffect;
  if (e) {
    switch (e.type) {
      case 'steal':
        return `STEAL ${e.amount} CREDIT${e.amount === 1 ? '' : 'S'}`;
      case 'underdog':
        return `${e.amount}-CREDIT SWING`;
      case 'double-next-challenge':
        return 'NEXT CHALLENGE ×2';
      case 'chaos-tax':
        return 'EVERYONE PAYS 1';
      case 'imposter':
        return 'STEAL THEIR TURN';
      case 'gain':
      case 'sabotage':
      case 'curse':
        return `+${credits(e.amount)}`;
    }
  }
  if (card.mechanic === 'challenge') return `WINNER +${n}`;
  if (card.mechanic === 'shared') return `+${n} EACH`;
  if (card.maxCount) return `UP TO +${credits(n)}`;
  return `+${credits(n)}`;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

type Draft = GameState;

function pushLog(s: Draft, text: string) {
  const entry: LogEntry = { id: s.nextId++, text };
  s.log = [entry, ...s.log].slice(0, LOG_LIMIT);
}

/** Apply a score change, clamped at zero. Returns the change actually applied. */
function addScore(s: Draft, player: PlayerIndex, delta: number, events: ScoreEvent[]): number {
  const before = s.players[player].score;
  const after = Math.max(0, before + delta);
  s.players[player] = { ...s.players[player], score: after };
  const applied = after - before;
  if (applied !== 0) events.push({ id: s.nextId++, player, delta: applied });
  return applied;
}

function checkWinner(s: Draft, tieBreaker: PlayerIndex) {
  const [p0, p1] = s.players;
  const over0 = p0.score >= WIN_SCORE;
  const over1 = p1.score >= WIN_SCORE;
  if (!over0 && !over1) return;
  let winner: PlayerIndex;
  if (over0 && over1) winner = p0.score === p1.score ? tieBreaker : p0.score > p1.score ? 0 : 1;
  else winner = over0 ? 0 : 1;
  s.winner = winner;
  s.phase = 'won';
  s.current = null;
  pushLog(s, `${s.players[winner].name} hits ${WIN_SCORE}. Chaos has been claimed.`);
}

const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);

function cardName(card: Card): string {
  return card.visibility === 'secret' ? `a secret ${CATEGORIES[card.category].name} card` : card.title;
}

function applyChaos(s: Draft, card: Card, actor: PlayerIndex, now: number, events: ScoreEvent[]): string {
  const partner = other(actor);
  const me = s.players[actor].name;
  const them = s.players[partner].name;
  const e = card.chaosEffect!;
  switch (e.type) {
    case 'steal': {
      const taken = -addScore(s, partner, -e.amount, events);
      addScore(s, actor, taken, events);
      return taken > 0
        ? `HIGHWAY ROBBERY! ${me} steals ${taken} from ${them}.`
        : `${me} tried to rob ${them}, but their pockets were empty.`;
    }
    case 'gain':
      addScore(s, actor, e.amount, events);
      return `${me} played ${card.title}. ${signed(e.amount)}.`;
    case 'underdog': {
      const [a, b] = s.players;
      if (a.score === b.score) return `${me} played ${card.title}. It's tied, so nothing happens. Weird.`;
      const leader: PlayerIndex = a.score > b.score ? 0 : 1;
      const trailer = other(leader);
      const moved = -addScore(s, leader, -e.amount, events);
      addScore(s, trailer, moved, events);
      return `PLOT TWIST: ${s.players[trailer].name} takes ${moved} from ${s.players[leader].name}.`;
    }
    case 'double-next-challenge':
      s.modifiers.doubleNextChallenge = true;
      return `${me} played Double Trouble. The next challenge pays double, and the loser owes a dare.`;
    case 'chaos-tax': {
      let pile = 0;
      for (const p of [0, 1] as PlayerIndex[]) pile += -addScore(s, p, -e.amount, events);
      s.modifiers.chaosPile += pile;
      return `CHAOS TAX. ${pile} into the pile (now ${s.modifiers.chaosPile}). Next challenge winner takes it all.`;
    }
    case 'imposter':
      s.modifiers.imposter = actor;
      return `${me} is the Imposter. Whatever ${them} draws next, ${me} does instead.`;
    case 'sabotage':
      addScore(s, actor, e.amount, events);
      s.modifiers.sabotageBy = actor;
      return `${me} holds a Sabotage Pass over ${them}'s next visible card. ${signed(e.amount)}.`;
    case 'curse':
      addScore(s, actor, e.amount, events);
      s.modifiers.curse = { target: partner, endsAt: now + e.seconds * 1000 };
      return `${them} has been cursed by ${me}. ${signed(e.amount)} for the curse-caster.`;
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'start':
      return createGame(action.names, action.order, action.first);

    case 'restart': {
      const names: [string, string] = [state.players[0].name, state.players[1].name];
      return createGame(names, action.order, action.first);
    }

    case 'draw': {
      if (state.phase !== 'ready' || state.drawPile.length === 0) return state;
      const s: Draft = structuredClone(state);
      const cardId = s.drawPile.pop()!;
      const card = getCard(cardId);
      if (!card) {
        // Unknown id (e.g. stale save after deck edits): discard and carry on.
        s.discard.push(cardId);
        return s;
      }
      const drawer = s.turn;
      let actor = drawer;
      if (s.modifiers.imposter !== null && s.modifiers.imposter !== drawer) {
        actor = s.modifiers.imposter;
        s.modifiers.imposter = null;
      }
      const doubled = card.mechanic === 'challenge' && s.modifiers.doubleNextChallenge;
      if (doubled) s.modifiers.doubleNextChallenge = false;
      let sabotagedBy: PlayerIndex | null = null;
      if (card.visibility === 'visible' && s.modifiers.sabotageBy !== null && s.modifiers.sabotageBy !== actor) {
        sabotagedBy = s.modifiers.sabotageBy;
        s.modifiers.sabotageBy = null;
      }
      s.current = {
        cardId,
        drawer,
        actor,
        revealed: card.visibility === 'visible',
        doubled,
        sabotagedBy,
      };
      s.phase = 'card';
      s.lastScoreEvents = [];
      return s;
    }

    case 'reveal':
    case 'hide': {
      if (!state.current) return state;
      return { ...state, current: { ...state.current, revealed: action.type === 'reveal' } };
    }

    case 'resolve': {
      if (state.phase !== 'card' || !state.current) return state;
      const card = getCard(state.current.cardId);
      if (!card) return state;
      const { outcome } = action;
      if (!allowedOutcomes(card).includes(outcome.kind)) return state;

      const s: Draft = structuredClone(state);
      const { actor, drawer, doubled } = s.current!;
      const actorName = s.players[actor].name;
      const events: ScoreEvent[] = [];
      let text = '';

      switch (outcome.kind) {
        case 'complete':
          addScore(s, actor, card.creditValue, events);
          text = `${actorName} completed ${cardName(card)}. ${signed(card.creditValue)}.`;
          break;
        case 'skip': {
          const lost = addScore(s, actor, -SKIP_PENALTY, events);
          text = `${actorName} skipped ${cardName(card)}. ${lost === 0 ? 'Nothing left to lose.' : signed(lost) + '.'}`;
          break;
        }
        case 'shared':
          addScore(s, 0, card.creditValue, events);
          addScore(s, 1, card.creditValue, events);
          text = `${s.players[0].name} and ${s.players[1].name} did ${card.title} together. ${signed(card.creditValue)} each.`;
          break;
        case 'challenge': {
          const base = card.creditValue * (doubled ? 2 : 1);
          const pile = s.modifiers.chaosPile;
          s.modifiers.chaosPile = 0;
          addScore(s, outcome.winner, base + pile, events);
          const extras = [doubled ? 'doubled' : '', pile ? `plus the ${pile}-credit Chaos Pile` : '']
            .filter(Boolean)
            .join(', ');
          text = `${s.players[outcome.winner].name} wins ${card.title}. ${signed(base + pile)}${extras ? ` (${extras})` : ''}.`;
          if (doubled) text += ` ${s.players[other(outcome.winner)].name} owes a dare.`;
          break;
        }
        case 'mischief': {
          const max = card.maxCount ?? card.creditValue;
          const count = Math.max(0, Math.min(max, Math.floor(outcome.count)));
          // Without a counter, mischief is all-or-nothing.
          const points = card.maxCount ? count : count > 0 ? card.creditValue : 0;
          addScore(s, actor, points, events);
          text =
            points > 0
              ? `${actorName} pulled off ${card.title}. ${signed(points)}.`
              : `${actorName} got busted on ${card.title}. No credits, all the shame.`;
          break;
        }
        case 'mission':
          s.missions.push({ cardId: card.id, owner: actor });
          text = `${actorName} is up to something. A secret mission is running…`;
          break;
        case 'chaos':
          text = applyChaos(s, card, actor, action.now, events);
          break;
      }

      if (outcome.kind !== 'mission') s.discard.push(card.id);
      s.current = null;
      s.phase = 'ready';
      s.turn = other(drawer);
      s.round += 1;
      s.lastScoreEvents = events;
      pushLog(s, text);
      checkWinner(s, actor);
      return s;
    }

    case 'resolveMission': {
      if (state.phase === 'won') return state;
      const idx = state.missions.findIndex((m) => m.cardId === action.cardId);
      if (idx === -1) return state;
      const card = getCard(action.cardId);
      const s: Draft = structuredClone(state);
      const [mission] = s.missions.splice(idx, 1);
      s.discard.push(mission.cardId);
      const max = card ? (card.maxCount ?? card.creditValue) : 0;
      const points = Math.max(0, Math.min(max, Math.floor(action.points)));
      const events: ScoreEvent[] = [];
      addScore(s, mission.owner, points, events);
      s.lastScoreEvents = events;
      const name = s.players[mission.owner].name;
      pushLog(
        s,
        points > 0
          ? `REVEAL: ${name} pulled off ${card?.title ?? 'a secret mission'} the whole time. ${signed(points)}.`
          : `REVEAL: ${name} was attempting ${card?.title ?? 'a secret mission'}… and got busted.`,
      );
      checkWinner(s, mission.owner);
      return s;
    }

    case 'reshuffle': {
      if (state.phase === 'won') return state;
      return { ...state, drawPile: action.order.slice(), discard: [] };
    }

    case 'setCoupons': {
      const allowance = couponAllowance(state, action.player);
      const unique = Array.from(new Set(action.couponIds)).slice(0, allowance);
      const coupons: [string[], string[]] = [state.coupons[0].slice(), state.coupons[1].slice()];
      coupons[action.player] = unique;
      return { ...state, coupons };
    }
  }
}

/** Ids that must not go back into a reshuffled deck (cards still in someone's hand). */
export function heldCardIds(state: GameState): string[] {
  return [...state.missions.map((m) => m.cardId), ...(state.current ? [state.current.cardId] : [])];
}
