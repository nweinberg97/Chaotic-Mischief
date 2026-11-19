/**
 * Card Lab: propose card changes without touching the real deck.
 *
 * A lab "change set" is three lists on top of the real deck: edited cards,
 * new cards, and removed card ids. It lives in the browser (localStorage) and
 * travels between people inside a share link, so no server is needed.
 * Nothing here changes `src/data/cards.ts`; approved changes are copied there
 * by hand.
 */
import { CATEGORIES } from '../data/categories';
import type { Card, CategoryId, ChaosEffect, Mechanic } from '../types/game';
import { PROPOSED_CREDITS, PROPOSED_EFFECTS, PROPOSED_TANK } from './proposal';

export interface LabState {
  /** Existing cards with changes, keyed by card id. */
  edits: Record<string, Card>;
  /** Brand-new cards. */
  added: Card[];
  /** Ids of existing cards taken out of the deck (kept on file, "in the tank"). */
  removed: string[];
}

export type LabStatus = 'same' | 'edited' | 'new' | 'removed';

export interface LabCard {
  card: Card;
  status: LabStatus;
  /** The card as it is in the real deck (for edited and removed cards). */
  original?: Card;
}

export const EMPTY_LAB: LabState = { edits: {}, added: [], removed: [] };

export const CATEGORY_IDS: CategoryId[] = [
  'action',
  'performance',
  'challenge',
  'connection',
  'side-quest',
  'mischief',
  'chaos',
];

export const TIMER_OPTIONS = [0, 60, 120, 180, 300, 600];

/** Every category's mechanic follows from its type. Connection cards may be "both earn". */
export function mechanicFor(category: CategoryId, bothEarn = false): Mechanic {
  switch (category) {
    case 'challenge':
      return 'challenge';
    case 'mischief':
      return 'mischief';
    case 'chaos':
      return 'chaos';
    case 'connection':
      return bothEarn ? 'shared' : 'standard';
    default:
      return 'standard';
  }
}

/** Fill in the fields a category needs, so any edit still makes a valid card. */
export function normalizeCard(card: Card): Card {
  const both = card.mechanic === 'shared';
  const next: Card = {
    ...card,
    title: card.title.trim().slice(0, 60),
    description: card.description.trim().slice(0, 400),
    specialRule: card.specialRule?.trim() ? card.specialRule.trim().slice(0, 160) : undefined,
    creditValue: Math.max(1, Math.min(3, Math.round(card.creditValue) || 1)),
    visibility: CATEGORIES[card.category].visibility,
    mechanic: mechanicFor(card.category, card.category === 'connection' && both),
    timerSeconds: card.timerSeconds && card.timerSeconds > 0 ? card.timerSeconds : undefined,
  };
  if (next.category === 'chaos') {
    next.chaosEffect = card.chaosEffect ?? { type: 'house-rule', label: 'NEW HOUSE RULE' };
  } else {
    delete next.chaosEffect;
  }
  if (next.category !== 'mischief') delete next.maxCount;
  return next;
}

export function blankCard(category: CategoryId, number: number): Card {
  return normalizeCard({
    id: `lab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    number,
    title: '',
    category,
    description: '',
    creditValue: 1,
    visibility: CATEGORIES[category].visibility,
    mechanic: mechanicFor(category),
  });
}

function same(a: Card, b: Card): boolean {
  return JSON.stringify(normalizeCard(a)) === JSON.stringify(normalizeCard(b));
}

/** The deck as the lab sees it: real cards with edits applied, then new cards. */
export function applyLab(base: Card[], lab: LabState): LabCard[] {
  const removed = new Set(lab.removed);
  const out: LabCard[] = base.map((original) => {
    const edited = lab.edits[original.id];
    if (removed.has(original.id)) return { card: edited ?? original, status: 'removed', original };
    if (edited && !same(edited, original)) return { card: edited, status: 'edited', original };
    return { card: original, status: 'same' };
  });
  for (const card of lab.added) out.push({ card, status: 'new' });
  return out;
}

export function countChanges(lab: LabState, base: Card[]): { edited: number; added: number; removed: number } {
  const all = applyLab(base, lab);
  return {
    edited: all.filter((c) => c.status === 'edited').length,
    added: lab.added.length,
    removed: all.filter((c) => c.status === 'removed').length,
  };
}

/** Save an edited existing card (or drop the edit if it now matches the real card). */
export function saveEdit(lab: LabState, base: Card[], card: Card): LabState {
  const clean = normalizeCard(card);
  if (lab.added.some((c) => c.id === clean.id)) {
    return { ...lab, added: lab.added.map((c) => (c.id === clean.id ? clean : c)) };
  }
  const original = base.find((c) => c.id === clean.id);
  const edits = { ...lab.edits };
  if (original && same(original, clean)) delete edits[clean.id];
  else edits[clean.id] = clean;
  return { ...lab, edits };
}

export function addCard(lab: LabState, card: Card): LabState {
  return { ...lab, added: [...lab.added, normalizeCard(card)] };
}

/** Existing cards go to the tank (undo-able); new cards are simply deleted. */
export function removeCard(lab: LabState, id: string): LabState {
  if (lab.added.some((c) => c.id === id)) return { ...lab, added: lab.added.filter((c) => c.id !== id) };
  if (lab.removed.includes(id)) return lab;
  return { ...lab, removed: [...lab.removed, id] };
}

export function restoreCard(lab: LabState, id: string): LabState {
  return { ...lab, removed: lab.removed.filter((r) => r !== id) };
}

export function revertCard(lab: LabState, id: string): LabState {
  const edits = { ...lab.edits };
  delete edits[id];
  return { ...lab, edits };
}

export function nextNumber(base: Card[], lab: LabState): number {
  return Math.max(0, ...base.map((c) => c.number), ...lab.added.map((c) => c.number)) + 1;
}

// ---------------------------------------------------------------------------
// Checking data that arrives from a link or from storage
// ---------------------------------------------------------------------------

const EFFECT_TYPES = new Set([
  'steal',
  'gain',
  'underdog',
  'double-next-challenge',
  'chaos-tax',
  'imposter',
  'sabotage',
  'curse',
  'swap',
  'bankruptcy',
  'repeal',
  'house-rule',
]);

function str(v: unknown, max: number): string {
  return typeof v === 'string' ? v.slice(0, max) : '';
}

function toEffect(v: unknown): ChaosEffect | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const e = v as Record<string, unknown>;
  const type = typeof e.type === 'string' ? e.type : '';
  if (!EFFECT_TYPES.has(type)) return undefined;
  const amount = typeof e.amount === 'number' && Number.isFinite(e.amount) ? Math.max(0, Math.min(10, e.amount)) : 1;
  switch (type) {
    case 'house-rule':
      return { type: 'house-rule', label: str(e.label, 40) || 'HOUSE RULE' };
    case 'curse':
      return { type: 'curse', amount, seconds: typeof e.seconds === 'number' ? e.seconds : 300 };
    case 'double-next-challenge':
      return { type: 'double-next-challenge' };
    case 'imposter':
      return { type: 'imposter' };
    case 'swap':
      return { type: 'swap' };
    case 'bankruptcy':
      return { type: 'bankruptcy' };
    case 'steal':
      return { type: 'steal', amount };
    case 'gain':
      return { type: 'gain', amount };
    case 'underdog':
      return { type: 'underdog', amount };
    case 'chaos-tax':
      return { type: 'chaos-tax', amount };
    case 'sabotage':
      return { type: 'sabotage', amount };
    case 'repeal':
      return { type: 'repeal', amount };
    default:
      return undefined;
  }
}

function toCard(v: unknown): Card | null {
  if (!v || typeof v !== 'object') return null;
  const c = v as Record<string, unknown>;
  const category = c.category as CategoryId;
  if (!CATEGORY_IDS.includes(category)) return null;
  const id = str(c.id, 80);
  if (!id) return null;
  const card: Card = {
    id,
    number: typeof c.number === 'number' ? Math.max(0, Math.floor(c.number)) : 0,
    title: str(c.title, 60),
    category,
    description: str(c.description, 400),
    specialRule: str(c.specialRule, 160) || undefined,
    creditValue: typeof c.creditValue === 'number' ? c.creditValue : 1,
    visibility: CATEGORIES[category].visibility,
    mechanic: c.mechanic === 'shared' ? 'shared' : mechanicFor(category),
    timerSeconds: typeof c.timerSeconds === 'number' ? c.timerSeconds : undefined,
    maxCount: typeof c.maxCount === 'number' ? c.maxCount : undefined,
    chaosEffect: toEffect(c.chaosEffect),
  };
  return normalizeCard(card);
}

/** Turn anything (parsed JSON) into a safe LabState. */
export function sanitizeLab(v: unknown): LabState {
  if (!v || typeof v !== 'object') return EMPTY_LAB;
  const raw = v as Record<string, unknown>;
  const edits: Record<string, Card> = {};
  if (raw.edits && typeof raw.edits === 'object') {
    for (const value of Object.values(raw.edits as Record<string, unknown>)) {
      const card = toCard(value);
      if (card) edits[card.id] = card;
    }
  }
  const added = Array.isArray(raw.added) ? raw.added.map(toCard).filter((c): c is Card => c !== null).slice(0, 300) : [];
  const removed = Array.isArray(raw.removed)
    ? raw.removed.filter((id): id is string => typeof id === 'string').map((id) => id.slice(0, 80)).slice(0, 300)
    : [];
  return { edits, added, removed };
}

// ---------------------------------------------------------------------------
// Share links: the change set, compressed into the URL
// ---------------------------------------------------------------------------

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const body = new Blob([bytes as BlobPart]).stream().pipeThrough(stream as unknown as TransformStream<Uint8Array, Uint8Array>);
  return new Uint8Array(await new Response(body).arrayBuffer());
}

/** "z." + deflate + base64url when the browser can compress, else "j." + base64url JSON. */
export async function encodeLab(lab: LabState): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(lab));
  if (typeof CompressionStream === 'function') {
    return 'z.' + toBase64Url(await pipe(json, new CompressionStream('deflate-raw')));
  }
  return 'j.' + toBase64Url(json);
}

export async function decodeLab(code: string): Promise<LabState> {
  const [kind, data = ''] = code.split('.', 2);
  let bytes = fromBase64Url(data);
  if (kind === 'z') bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
  else if (kind !== 'j') throw new Error('Unknown link format');
  return sanitizeLab(JSON.parse(new TextDecoder().decode(bytes)));
}

// ---------------------------------------------------------------------------
// The rules proposal as a change set
// ---------------------------------------------------------------------------

/** Build the Nov 2026 proposal (new credits + tank list) on top of the real deck. */
export function proposalLab(base: Card[]): LabState {
  const edits: Record<string, Card> = {};
  for (const card of base) {
    const credits = PROPOSED_CREDITS[card.title];
    const effect = PROPOSED_EFFECTS[card.title];
    if (credits !== undefined) edits[card.id] = normalizeCard({ ...card, creditValue: credits });
    if (effect !== undefined && card.chaosEffect && 'amount' in card.chaosEffect) {
      edits[card.id] = normalizeCard({ ...card, chaosEffect: { ...card.chaosEffect, amount: effect } as ChaosEffect });
    }
  }
  const removed = base.filter((c) => PROPOSED_TANK.includes(c.title)).map((c) => c.id);
  return { edits, added: [], removed };
}
