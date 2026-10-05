/**
 * Core domain types for Chaotic Mischief.
 *
 * Card content lives in `src/data`, rules live in `src/game`, and the UI only
 * ever reads these shapes. Adding a card should never require touching a
 * component.
 */

export type CategoryId =
  | 'action'
  | 'performance'
  | 'side-quest'
  | 'challenge'
  | 'chaos'
  | 'connection'
  | 'mischief';

/** Who is allowed to look at the card when it's drawn. */
export type Visibility = 'visible' | 'secret';

/** The three card stocks from the physical deck. */
export type CardTone = 'light' | 'dark' | 'teal';

/**
 * How a card resolves once it's been played.
 * - standard:  drawer completes it → earns the credits
 * - challenge: both compete → pick a winner → winner earns the credits
 * - shared:    both play together → both earn the credits
 * - mischief:  sneaky task → pulled it off / busted (optionally counted, e.g. "per swap")
 * - chaos:     applies a rule-bending effect (steal, tax, imposter…)
 */
export type Mechanic = 'standard' | 'challenge' | 'shared' | 'mischief' | 'chaos';

export type ChaosEffect =
  /** Take credits straight from your partner. */
  | { type: 'steal'; amount: number }
  /** Gain credits outright. */
  | { type: 'gain'; amount: number }
  /** The trailing player takes credits from the leader. */
  | { type: 'underdog'; amount: number }
  /** Next challenge pays double; loser owes the winner a dare. */
  | { type: 'double-next-challenge' }
  /** Both players pay 1 into the Chaos Pile; next challenge winner takes it all. */
  | { type: 'chaos-tax'; amount: number }
  /** Drawer performs their partner's next card (and keeps the credits). */
  | { type: 'imposter' }
  /** Drawer may meddle with the partner's next visible card. */
  | { type: 'sabotage'; amount: number }
  /** Drawer sets a harmless rule the partner must follow for a while. */
  | { type: 'curse'; amount: number; seconds: number };

export interface Card {
  /** Stable, unique id. Used for persistence and duplicate prevention. */
  id: string;
  /** Printed card number (#01–#54), matches the physical deck. */
  number: number;
  title: string;
  category: CategoryId;
  /** Main instruction, written to the person holding the card. */
  description: string;
  /** Chaos Credits at stake. Capped per category (see CATEGORY_RULES). */
  creditValue: number;
  visibility: Visibility;
  mechanic: Mechanic;
  /** Short line under the description: how you win, what counts, etc. */
  specialRule?: string;
  /** Optional flourish shown as a bonus line. Purely for flavour, never scored. */
  bonus?: string;
  /** Activity timer offered on the card, in seconds. */
  timerSeconds?: number;
  /** For mischief cards scored "per success" (e.g. per unnoticed swap). */
  maxCount?: number;
  /** For chaos cards. */
  chaosEffect?: ChaosEffect;
  /** Optional conversation starters the card can cycle through. */
  prompts?: string[];
}

export interface Category {
  id: CategoryId;
  name: string;
  /** The one-liner from the deck legend. */
  tagline: string;
  /** What the category is, in a sentence. */
  blurb: string;
  tone: CardTone;
  visibility: Visibility;
  /** Highest Chaos Credit value a card in this category may carry. */
  maxCredits: number;
}

export interface Coupon {
  id: string;
  number: number;
  /** Small line above the title ("I SERVE YOU"). */
  kicker: string;
  title: string;
  /** Optional fine print under the title. */
  note?: string;
  emoji: string;
}

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------

export type PlayerIndex = 0 | 1;

export interface Player {
  name: string;
  score: number;
}

export interface CurrentDraw {
  cardId: string;
  /** Who drew it (whose turn it is). */
  drawer: PlayerIndex;
  /** Who actually performs it — differs from drawer when an Imposter is active. */
  actor: PlayerIndex;
  /** Secret cards start face-down until the actor reveals them. */
  revealed: boolean;
  /** Snapshot of modifiers that apply to this card, for display. */
  doubled: boolean;
  sabotagedBy: PlayerIndex | null;
}

/** A mischief card the actor chose to keep running in the background. */
export interface SecretMission {
  cardId: string;
  owner: PlayerIndex;
}

export interface Modifiers {
  /** Set by Double Trouble: the next challenge card pays double. */
  doubleNextChallenge: boolean;
  /** Credits sitting in the Chaos Pile, paid out to the next challenge winner. */
  chaosPile: number;
  /** Player who will perform the partner's next card. */
  imposter: PlayerIndex | null;
  /** Player holding a Sabotage Pass over their partner's next visible card. */
  sabotageBy: PlayerIndex | null;
  /** Active curse: who is cursed and when it ends (epoch ms). */
  curse: { target: PlayerIndex; endsAt: number } | null;
}

export interface LogEntry {
  id: number;
  text: string;
}

/** A score change, used to drive the "+1 CHAOS" microinteraction. */
export interface ScoreEvent {
  id: number;
  player: PlayerIndex;
  delta: number;
}

export type Phase = 'ready' | 'card' | 'won';

export interface GameState {
  version: 1;
  players: [Player, Player];
  /** Whose turn it is to draw. */
  turn: PlayerIndex;
  phase: Phase;
  /** Remaining card ids, top of the deck is the last element. */
  drawPile: string[];
  /** Card ids already drawn this shuffle. */
  discard: string[];
  current: CurrentDraw | null;
  modifiers: Modifiers;
  missions: SecretMission[];
  winner: PlayerIndex | null;
  round: number;
  /** Most recent first, capped. */
  log: LogEntry[];
  lastScoreEvents: ScoreEvent[];
  /** Coupons picked by each player on the winner screen. */
  coupons: [string[], string[]];
  nextId: number;
}

export type Outcome =
  | { kind: 'complete' }
  | { kind: 'skip' }
  | { kind: 'challenge'; winner: PlayerIndex }
  | { kind: 'shared' }
  | { kind: 'mischief'; count: number }
  | { kind: 'mission' }
  | { kind: 'chaos' };
