import { describe, expect, it } from 'vitest';
import { CATEGORIES } from '../data/categories';
import { DECK, PLAYABLE_IDS, getCard, validateDeck } from '../data/cards';
import { COUPONS } from '../data/coupons';
import type { GameState, Outcome, PlayerIndex } from '../types/game';
import {
  WIN_SCORE,
  allowedOutcomes,
  couponAllowance,
  createGame,
  freshDeckOrder,
  gameReducer,
  heldCardIds,
  shuffle,
  validateNames,
} from './rules';
import { parseSave } from './storage';

/** Deterministic RNG for repeatable shuffles. */
function seeded(seed = 42) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** Start a game whose next draw is exactly `cardId`. */
function gameWithTopCard(cardId: string, first: PlayerIndex = 0, scores: [number, number] = [0, 0]): GameState {
  const rest = PLAYABLE_IDS.filter((id) => id !== cardId);
  const g = createGame(['Nitai', 'Sam'], [...rest, cardId], first);
  g.players[0].score = scores[0];
  g.players[1].score = scores[1];
  return g;
}

const play = (g: GameState, outcome: Outcome, now = 0) =>
  gameReducer(gameReducer(g, { type: 'draw' }), { type: 'resolve', outcome, now });

describe('deck data', () => {
  it('is valid and complete', () => {
    expect(validateDeck(DECK)).toEqual([]);
    expect(DECK).toHaveLength(54);
    expect(PLAYABLE_IDS).toHaveLength(54);
  });

  it('respects every category credit cap and has every category', () => {
    for (const card of DECK) {
      expect(card.creditValue).toBeLessThanOrEqual(CATEGORIES[card.category].maxCredits);
    }
    for (const id of Object.keys(CATEGORIES)) {
      expect(DECK.filter((c) => c.category === id).length).toBeGreaterThanOrEqual(3);
    }
  });

  it('marks chaos, side quest and mischief cards as secret', () => {
    for (const card of DECK) {
      const secret = ['chaos', 'side-quest', 'mischief'].includes(card.category);
      expect(card.visibility).toBe(secret ? 'secret' : 'visible');
    }
  });

  it('has unique coupon ids', () => {
    expect(new Set(COUPONS.map((c) => c.id)).size).toBe(COUPONS.length);
  });
});

describe('setup', () => {
  it('rejects empty and duplicate names', () => {
    expect(validateNames('  ', 'Sam')).not.toBeNull();
    expect(validateNames('sam', 'SAM ')).not.toBeNull();
    expect(validateNames('Nitai', 'Sam')).toBeNull();
  });

  it('shuffles without losing or duplicating cards', () => {
    const order = shuffle(PLAYABLE_IDS, seeded(1));
    expect(order).toHaveLength(PLAYABLE_IDS.length);
    expect(new Set(order).size).toBe(PLAYABLE_IDS.length);
    expect(order).not.toEqual(PLAYABLE_IDS);
  });
});

describe('drawing', () => {
  it('never repeats a card until the deck is exhausted', () => {
    let g = createGame(['A', 'B'], freshDeckOrder(seeded(7)), 0);
    const seen = new Set<string>();
    for (let i = 0; i < 54; i++) {
      g = gameReducer(g, { type: 'draw' });
      const id = g.current!.cardId;
      expect(seen.has(id)).toBe(false);
      seen.add(id);
      g = gameReducer(g, { type: 'resolve', outcome: { kind: 'skip' }, now: 0 });
    }
    expect(g.drawPile).toHaveLength(0);
    // Drawing from an empty deck is a no-op until reshuffled.
    expect(gameReducer(g, { type: 'draw' })).toBe(g);
    g = gameReducer(g, { type: 'reshuffle', order: freshDeckOrder(seeded(8), heldCardIds(g)) });
    expect(g.drawPile).toHaveLength(54);
  });

  it('alternates turns', () => {
    let g = createGame(['A', 'B'], freshDeckOrder(seeded(3)), 1);
    expect(g.turn).toBe(1);
    g = play(g, { kind: 'skip' });
    expect(g.turn).toBe(0);
  });

  it('keeps secret cards face down until revealed', () => {
    let g = gameReducer(gameWithTopCard('highway-robbery'), { type: 'draw' });
    expect(g.current!.revealed).toBe(false);
    g = gameReducer(g, { type: 'reveal' });
    expect(g.current!.revealed).toBe(true);
    const visible = gameReducer(gameWithTopCard('cat-walk'), { type: 'draw' });
    expect(visible.current!.revealed).toBe(true);
  });
});

describe('scoring', () => {
  it('awards credits for completing a card', () => {
    const g = play(gameWithTopCard('food-scavenger-hunt'), { kind: 'complete' });
    expect(g.players[0].score).toBe(2);
    expect(g.lastScoreEvents).toEqual([expect.objectContaining({ player: 0, delta: 2 })]);
  });

  it('skipping costs 1 but never goes below zero', () => {
    expect(play(gameWithTopCard('cat-walk', 0, [5, 0]), { kind: 'skip' }).players[0].score).toBe(4);
    expect(play(gameWithTopCard('cat-walk', 0, [0, 0]), { kind: 'skip' }).players[0].score).toBe(0);
  });

  it('gives challenge credits to the chosen winner', () => {
    const g = play(gameWithTopCard('workout-challenge', 0), { kind: 'challenge', winner: 1 });
    expect(g.players).toMatchObject([{ score: 0 }, { score: 2 }]);
  });

  it('gives shared cards to both players', () => {
    const g = play(gameWithTopCard('bucket-list'), { kind: 'shared' });
    expect(g.players.map((p) => p.score)).toEqual([1, 1]);
  });

  it('rejects outcomes the card does not offer', () => {
    const drawn = gameReducer(gameWithTopCard('cat-walk'), { type: 'draw' });
    expect(gameReducer(drawn, { type: 'resolve', outcome: { kind: 'challenge', winner: 1 }, now: 0 })).toBe(drawn);
    expect(allowedOutcomes(getCard('cat-walk')!)).toEqual(['complete', 'skip']);
  });

  it('scores counted mischief per success, capped', () => {
    expect(play(gameWithTopCard('feet-apart'), { kind: 'mischief', count: 1 }).players[0].score).toBe(1);
    expect(play(gameWithTopCard('feet-apart'), { kind: 'mischief', count: 9 }).players[0].score).toBe(2);
    expect(play(gameWithTopCard('hungry-ninja'), { kind: 'mischief', count: 1 }).players[0].score).toBe(2);
    expect(play(gameWithTopCard('hungry-ninja'), { kind: 'mischief', count: 0 }).players[0].score).toBe(0);
  });

  it('lets mischief run as a secret mission and resolve later', () => {
    let g = play(gameWithTopCard('fake-words'), { kind: 'mission' });
    expect(g.missions).toEqual([{ cardId: 'fake-words', owner: 0 }]);
    expect(g.turn).toBe(1);
    expect(heldCardIds(g)).toContain('fake-words');
    g = gameReducer(g, { type: 'resolveMission', cardId: 'fake-words', points: 1 });
    expect(g.missions).toEqual([]);
    expect(g.players[0].score).toBe(1);
  });
});

describe('chaos cards', () => {
  it('Highway Robbery steals, but only what exists', () => {
    expect(play(gameWithTopCard('highway-robbery', 0, [3, 5]), { kind: 'chaos' }).players.map((p) => p.score)).toEqual([4, 4]);
    expect(play(gameWithTopCard('highway-robbery', 0, [3, 0]), { kind: 'chaos' }).players.map((p) => p.score)).toEqual([3, 0]);
  });

  it('Double Trouble doubles the next challenge only', () => {
    let g = play(gameWithTopCard('double-trouble'), { kind: 'chaos' });
    expect(g.modifiers.doubleNextChallenge).toBe(true);
    // Force a challenge to the top of the deck.
    g.drawPile = [...g.drawPile.filter((id) => id !== 'workout-challenge'), 'workout-challenge'];
    g = gameReducer(g, { type: 'draw' });
    expect(g.current!.doubled).toBe(true);
    g = gameReducer(g, { type: 'resolve', outcome: { kind: 'challenge', winner: 0 }, now: 0 });
    expect(g.players[0].score).toBe(4);
    expect(g.modifiers.doubleNextChallenge).toBe(false);
  });

  it('Chaos Tax builds a pile the next challenge winner collects', () => {
    let g = play(gameWithTopCard('chaos-tax', 0, [4, 6]), { kind: 'chaos' });
    expect(g.players.map((p) => p.score)).toEqual([3, 5]);
    expect(g.modifiers.chaosPile).toBe(2);
    g.drawPile = [...g.drawPile.filter((id) => id !== 'charades'), 'charades'];
    g = play(g, { kind: 'challenge', winner: 0 });
    expect(g.players[0].score).toBe(3 + 1 + 2);
    expect(g.modifiers.chaosPile).toBe(0);
  });

  it('Imposter makes the drawer perform their partner’s next card', () => {
    let g = play(gameWithTopCard('imposter', 0), { kind: 'chaos' });
    expect(g.turn).toBe(1);
    g.drawPile = [...g.drawPile.filter((id) => id !== 'cat-walk'), 'cat-walk'];
    g = gameReducer(g, { type: 'draw' });
    expect(g.current).toMatchObject({ drawer: 1, actor: 0 });
    g = gameReducer(g, { type: 'resolve', outcome: { kind: 'complete' }, now: 0 });
    expect(g.players[0].score).toBe(1);
    expect(g.turn).toBe(0); // turn order is unaffected
    expect(g.modifiers.imposter).toBeNull();
  });

  it('Plot Twist moves credits from the leader to the trailer', () => {
    const g = play(gameWithTopCard('plot-twist', 0, [10, 4]), { kind: 'chaos' });
    expect(g.players.map((p) => p.score)).toEqual([7, 7]);
    const tied = play(gameWithTopCard('plot-twist', 0, [5, 5]), { kind: 'chaos' });
    expect(tied.players.map((p) => p.score)).toEqual([5, 5]);
  });

  it('Partner’s Curse sets a timed curse on the partner', () => {
    const g = play(gameWithTopCard('partners-curse', 0), { kind: 'chaos' }, 1000);
    expect(g.modifiers.curse).toEqual({ target: 1, endsAt: 1000 + 300_000 });
    expect(g.players[0].score).toBe(1);
  });

  it('Sabotage Pass flags the partner’s next visible card', () => {
    let g = play(gameWithTopCard('sabotage-pass', 0), { kind: 'chaos' });
    g.drawPile = [...g.drawPile.filter((id) => id !== 'karaoke-time'), 'karaoke-time'];
    g = gameReducer(g, { type: 'draw' });
    expect(g.current!.sabotagedBy).toBe(0);
    expect(g.modifiers.sabotageBy).toBeNull();
  });
});

describe('winning and rewards', () => {
  it('ends the game at 21', () => {
    const g = play(gameWithTopCard('victory-lap', 0, [19, 3]), { kind: 'chaos' });
    expect(g.players[0].score).toBe(22);
    expect(g.phase).toBe('won');
    expect(g.winner).toBe(0);
    expect(gameReducer(g, { type: 'draw' })).toBe(g);
  });

  it('breaks a double-21 tie by score, then by who played the card', () => {
    const g = play(gameWithTopCard('top-5s', 1, [20, 20]), { kind: 'shared' });
    expect(g.winner).toBe(1);
  });

  it('hands out 1 coupon per 7 credits, minimum 3 for the winner', () => {
    const g = play(gameWithTopCard('victory-lap', 0, [19, 15]), { kind: 'chaos' });
    expect(couponAllowance(g, 0)).toBe(3);
    expect(couponAllowance(g, 1)).toBe(2);
    const picked = gameReducer(g, { type: 'setCoupons', player: 1, couponIds: ['massage', 'massage', 'yes-day', 'dishes'] });
    expect(picked.coupons[1]).toEqual(['massage', 'yes-day']);
  });

  it(`uses ${WIN_SCORE} as the target`, () => {
    expect(WIN_SCORE).toBe(21);
  });
});

describe('persistence', () => {
  it('round-trips a save and rejects garbage', () => {
    const g = gameReducer(gameWithTopCard('cat-walk'), { type: 'draw' });
    const back = parseSave(JSON.stringify(g));
    expect(back?.current?.cardId).toBe('cat-walk');
    expect(parseSave('{nope')).toBeNull();
    expect(parseSave(JSON.stringify({ version: 99 }))).toBeNull();
  });

  it('recovers from a save that references a deleted card', () => {
    const g = gameReducer(gameWithTopCard('cat-walk'), { type: 'draw' });
    const broken = { ...g, current: { ...g.current!, cardId: 'deleted-card' }, drawPile: ['deleted-card', ...g.drawPile] };
    const back = parseSave(JSON.stringify(broken))!;
    expect(back.phase).toBe('ready');
    expect(back.drawPile).not.toContain('deleted-card');
  });
});
