import { describe, expect, it } from 'vitest';
import { DECK } from '../data/cards';
import {
  EMPTY_LAB,
  addCard,
  applyLab,
  blankCard,
  countChanges,
  decodeLab,
  encodeLab,
  proposalLab,
  removeCard,
  restoreCard,
  sanitizeLab,
  saveEdit,
} from './lab';
import { PROPOSED_CREDITS, PROPOSED_TANK } from './proposal';

describe('card lab', () => {
  it('starts with the real deck unchanged', () => {
    const all = applyLab(DECK, EMPTY_LAB);
    expect(all).toHaveLength(DECK.length);
    expect(all.every((c) => c.status === 'same')).toBe(true);
  });

  it('edits, adds, removes and restores cards', () => {
    const first = DECK[0];
    let lab = saveEdit(EMPTY_LAB, DECK, { ...first, title: 'Renamed' });
    lab = addCard(lab, { ...blankCard('connection', 999), title: 'New one', description: 'Tell me a story.' });
    lab = removeCard(lab, DECK[1].id);
    expect(countChanges(lab, DECK)).toEqual({ edited: 1, added: 1, removed: 1 });
    lab = restoreCard(lab, DECK[1].id);
    expect(countChanges(lab, DECK).removed).toBe(0);
    const added = lab.added[0];
    lab = removeCard(lab, added.id);
    expect(lab.added).toHaveLength(0);
  });

  it('drops an edit that matches the real card again', () => {
    const first = DECK[0];
    let lab = saveEdit(EMPTY_LAB, DECK, { ...first, title: 'Renamed' });
    lab = saveEdit(lab, DECK, first);
    expect(Object.keys(lab.edits)).toHaveLength(0);
  });

  it('round-trips through a share link', async () => {
    const lab = proposalLab(DECK);
    const code = await encodeLab(lab);
    expect(code.length).toBeGreaterThan(10);
    const back = await decodeLab(code);
    expect(countChanges(back, DECK)).toEqual(countChanges(lab, DECK));
  });

  it('ignores junk from a link', () => {
    expect(sanitizeLab({ edits: { x: { category: 'nope' } }, added: [1, null], removed: [5, 'a'] })).toEqual({
      edits: {},
      added: [],
      removed: ['a'],
    });
  });

  it('builds the proposal from cards that exist', () => {
    const titles = new Set(DECK.map((c) => c.title));
    for (const t of [...Object.keys(PROPOSED_CREDITS), ...PROPOSED_TANK]) expect(titles.has(t)).toBe(true);
    const counts = countChanges(proposalLab(DECK), DECK);
    expect(counts.removed).toBe(PROPOSED_TANK.length);
  });
});
