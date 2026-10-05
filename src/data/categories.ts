import type { Category, CategoryId } from '../types/game';

/**
 * The seven card types. Tones follow the physical deck:
 * secret cards are teal, the core "do stuff" cards are black,
 * connection cards are off-white.
 */
export const CATEGORIES: Record<CategoryId, Category> = {
  action: {
    id: 'action',
    name: 'Action',
    tagline: 'Do it now. No blinking.',
    blurb: 'Instant do-it-now tasks. Quick, wild, and sometimes stupid, but always fun.',
    tone: 'dark',
    visibility: 'visible',
    maxCredits: 1,
  },
  performance: {
    id: 'performance',
    name: 'Performance',
    tagline: 'Entertain. Embarrass yourself proudly.',
    blurb: 'Your moment to act ridiculous with total confidence. No shame. Full send.',
    tone: 'dark',
    visibility: 'visible',
    maxCredits: 1,
  },
  'side-quest': {
    id: 'side-quest',
    name: 'Side Quest',
    tagline: 'Do something small that means a lot.',
    blurb: 'Leave the game for a few minutes and come back with something for your partner.',
    tone: 'teal',
    visibility: 'secret',
    maxCredits: 2,
  },
  challenge: {
    id: 'challenge',
    name: 'Challenge',
    tagline: 'Compete or cry. Winner takes glory.',
    blurb: 'Head-to-head. Somebody wins, somebody gets to hear about it all week.',
    tone: 'dark',
    visibility: 'visible',
    maxCredits: 2,
  },
  chaos: {
    id: 'chaos',
    name: 'Chaos',
    tagline: 'Bend the rules. Make the night more fun.',
    blurb: 'Plot twists, stolen points, new rules. The cards that make the scoreboard lie.',
    tone: 'teal',
    visibility: 'secret',
    maxCredits: 3,
  },
  connection: {
    id: 'connection',
    name: 'Connection',
    tagline: 'Honesty, nostalgia, and connection.',
    blurb: 'Stories, lists and questions that end with “wait, how did I not know that?”',
    tone: 'light',
    visibility: 'visible',
    maxCredits: 1,
  },
  mischief: {
    id: 'mischief',
    name: 'Mischief',
    tagline: 'Harmless trouble. Maximum fun.',
    blurb: 'Sneaky little missions to mess with your partner. Never mean. Always suspicious.',
    tone: 'teal',
    visibility: 'secret',
    maxCredits: 2,
  },
};

/** Display order, matching the deck legend. */
export const CATEGORY_ORDER: CategoryId[] = [
  'action',
  'performance',
  'side-quest',
  'challenge',
  'chaos',
  'connection',
  'mischief',
];
