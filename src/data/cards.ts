import type { Card } from '../types/game';
import { CATEGORIES } from './categories';

/**
 * The full 54-card Chaotic Mischief deck.
 *
 * Content comes from the original printable deck, tightened so every card
 * reads in one breath. To add or edit a card, change this file only: the
 * rules engine and UI read everything from here.
 *
 * Authoring rules (enforced by `validateDeck` + tests):
 * - ids and numbers are unique
 * - creditValue never exceeds the category's maxCredits
 * - challenge/chaos/mischief cards declare the fields their mechanic needs
 */

type CardInput = Omit<Card, 'number' | 'visibility'>;

const MIN = 60;

const RAW_CARDS: CardInput[] = [
  // ── ACTION ──────────────────────────────────────────────────────────────
  {
    id: 'hidden-message',
    title: 'Hidden Message',
    category: 'action',
    description:
      'Write your partner a note, fold it up, and hide it somewhere in the house for them to find.',
    specialRule: 'Make it worth finding.',
    creditValue: 1,
    mechanic: 'standard',
  },
  {
    id: 'cat-walk',
    title: 'Cat Walk',
    category: 'action',
    description:
      'Raid your closet for your best (or silliest) clothes and put on a fashion show. Your partner does the commentary.',
    creditValue: 1,
    mechanic: 'standard',
  },
  {
    id: 'massage',
    title: 'Massage',
    category: 'action',
    description:
      'Give your partner a massage. They call the shots on where and how. You follow instructions like a professional.',
    creditValue: 1,
    mechanic: 'standard',
    timerSeconds: 5 * MIN,
  },
  {
    id: 'accent-mode',
    title: 'Accent Mode',
    category: 'action',
    description: 'Pick an accent. You are now speaking in it for the next 5 minutes. Total commitment.',
    specialRule: 'Break character and it doesn’t count.',
    creditValue: 1,
    mechanic: 'standard',
    timerSeconds: 5 * MIN,
  },
  {
    id: 'role-reversal',
    title: 'Role Reversal',
    category: 'action',
    description: 'Speak and act exactly like your partner for the next 5 minutes.',
    specialRule: 'Accuracy over kindness. Within reason.',
    creditValue: 1,
    mechanic: 'standard',
    timerSeconds: 5 * MIN,
  },
  {
    id: 'freeze-frame',
    title: 'Freeze Frame',
    category: 'action',
    description:
      'For the next 5 minutes your partner can yell “FREEZE” at any moment. Whatever pose or face you’re making, hold it for one full minute.',
    creditValue: 1,
    mechanic: 'standard',
    timerSeconds: 5 * MIN,
  },
  {
    id: 'narrator-mode',
    title: 'Narrator Mode',
    category: 'action',
    description:
      'For 3 minutes, narrate everything you do like it’s a nature documentary about your own life.',
    creditValue: 1,
    mechanic: 'standard',
    timerSeconds: 3 * MIN,
  },
  {
    id: 'dramatic-entrance',
    title: 'Dramatic Entrance',
    category: 'action',
    description:
      'Leave the room and come back three separate times. Each entrance must be more dramatic than the last.',
    creditValue: 1,
    mechanic: 'standard',
  },

  // ── PERFORMANCE ─────────────────────────────────────────────────────────
  {
    id: 'artifact-improv',
    title: 'Artifact Improv',
    category: 'performance',
    description:
      'Grab a random object and start an improv scene with it. Your partner has to join in. Keep it going as long as you can.',
    creditValue: 1,
    mechanic: 'standard',
  },
  {
    id: 'shark-tanked',
    title: 'Shark Tanked',
    category: 'performance',
    description:
      'Your partner hands you a random object. You have one minute to pitch it as the next billion-dollar startup.',
    specialRule: 'Get them to invest.',
    creditValue: 1,
    mechanic: 'standard',
    timerSeconds: 1 * MIN,
  },
  {
    id: 'impersonations',
    title: 'Impersonations',
    category: 'performance',
    description:
      'Your partner names three celebrities. Pick one and give them your best one-minute impersonation.',
    creditValue: 1,
    mechanic: 'standard',
    timerSeconds: 1 * MIN,
  },
  {
    id: 'comedy-special',
    title: 'Comedy Special',
    category: 'performance',
    description:
      'Tell the funniest story from your own life like it’s your first-ever stand-up special.',
    specialRule: 'Mic optional. Hairbrush encouraged.',
    creditValue: 1,
    mechanic: 'standard',
  },
  {
    id: 'karaoke-time',
    title: 'Karaoke Time',
    category: 'performance',
    description: 'Pick a song, pull up a karaoke version, and perform it.',
    bonus: 'Bonus points for commitment. Not real points. Spiritual points.',
    creditValue: 1,
    mechanic: 'standard',
  },
  {
    id: 'freestyle-rap',
    title: 'Freestyle Rap',
    category: 'performance',
    description: 'Your partner picks an instrumental beat. You have one minute to spit your best bars.',
    creditValue: 1,
    mechanic: 'standard',
    timerSeconds: 1 * MIN,
  },
  {
    id: 'hidden-talent',
    title: 'Hidden Talent',
    category: 'performance',
    description: 'Perform a hidden talent for your partner. If you don’t have one, now’s the time to discover it.',
    creditValue: 1,
    mechanic: 'standard',
  },
  {
    id: 'dance',
    title: 'Dance Break',
    category: 'performance',
    description: 'Pick any song. You have one minute to dance like nobody’s watching. Somebody is watching.',
    creditValue: 1,
    mechanic: 'standard',
    timerSeconds: 1 * MIN,
  },

  // ── SIDE QUEST (secret) ─────────────────────────────────────────────────
  {
    id: 'choose-my-fit',
    title: 'Choose My Fit',
    category: 'side-quest',
    description:
      'Hand your partner full control of your outfit for the rest of the night. Whatever they pick, you wear it. No appeals.',
    creditValue: 1,
    mechanic: 'standard',
  },
  {
    id: 'food-scavenger-hunt',
    title: 'Food Scavenger Hunt',
    category: 'side-quest',
    description:
      'Ask your partner for three random snacks they’d love right now. Don’t say why. Find all three in the kitchen and present them.',
    creditValue: 2,
    mechanic: 'standard',
  },
  {
    id: 'bring-me-something',
    title: 'Bring Me Something',
    category: 'side-quest',
    description:
      'You have 3 minutes to find something your partner would genuinely love or find comforting. Don’t tell them what it is. Go.',
    creditValue: 1,
    mechanic: 'standard',
    timerSeconds: 3 * MIN,
  },
  {
    id: 'guess-what-i-found',
    title: 'Guess What I Found',
    category: 'side-quest',
    description:
      'Go to another room and grab a random object. Hide it behind your back. Your partner has to guess what it is.',
    creditValue: 1,
    mechanic: 'standard',
  },
  {
    id: 'partner-pack',
    title: 'The Partner Pack',
    category: 'side-quest',
    description:
      'You have 5 minutes to assemble a collection of objects that perfectly represents your partner. A starter pack, but it’s them.',
    creditValue: 2,
    mechanic: 'standard',
    timerSeconds: 5 * MIN,
  },
  {
    id: 'snack-run',
    title: 'Snack / Drink Run',
    category: 'side-quest',
    description:
      'You have 10 minutes to find or buy something fun for your partner to eat or drink. Surprise is mandatory.',
    creditValue: 2,
    mechanic: 'standard',
    timerSeconds: 10 * MIN,
  },
  {
    id: 'sneaky-romance',
    title: 'Sneaky Romance',
    category: 'side-quest',
    description: 'You have 3 minutes to find something romantic to give your partner. Improvise. Be smooth.',
    creditValue: 1,
    mechanic: 'standard',
    timerSeconds: 3 * MIN,
  },
  {
    id: 'weapon-of-choice',
    title: 'Weapon of Choice',
    category: 'side-quest',
    description:
      'Find the most ridiculous object you’d use to defend yourself in a zombie apocalypse. Present it. Defend your choice.',
    creditValue: 1,
    mechanic: 'standard',
  },

  // ── CHALLENGE ───────────────────────────────────────────────────────────
  {
    id: 'costume-challenge',
    title: 'Costume Challenge',
    category: 'challenge',
    description:
      'Build a costume entirely from your wardrobe. Your partner gets three guesses to name who you are.',
    specialRule: 'They guess it: they win. You stump them: you win.',
    creditValue: 2,
    mechanic: 'challenge',
  },
  {
    id: 'cooking-challenge',
    title: 'Cooking Challenge',
    category: 'challenge',
    description:
      'Your partner picks a few random ingredients from the kitchen. Turn them into a meal, Iron Chef style. Narrate your genius.',
    specialRule: 'They score it out of 10. Six or more, you win.',
    creditValue: 2,
    mechanic: 'challenge',
  },
  {
    id: 'blind-taste-test',
    title: 'Blind Taste Test',
    category: 'challenge',
    description:
      'Blindfold on. Your partner brings you three obscure foods. Identify them by smell, touch and taste.',
    specialRule: 'Get 2 of 3 right and you win. Otherwise they do.',
    creditValue: 2,
    mechanic: 'challenge',
  },
  {
    id: 'guess-my-song',
    title: 'Guess My Song',
    category: 'challenge',
    description:
      'Take turns playing a song for each other. Fastest correct guess wins the round. Best of three.',
    creditValue: 1,
    mechanic: 'challenge',
  },
  {
    id: 'song-roulette',
    title: 'Song Roulette',
    category: 'challenge',
    description:
      'Shuffle a playlist without looking at the titles. Both of you race to name each song.',
    specialRule: 'First to 3 out of 5 wins.',
    creditValue: 2,
    mechanic: 'challenge',
  },
  {
    id: 'charades',
    title: 'Charades',
    category: 'challenge',
    description:
      'Pick a word or phrase. You have 3 minutes to get your partner to guess it without making a sound.',
    specialRule: 'They get it in time: you win. Clock runs out: they steal it.',
    creditValue: 1,
    mechanic: 'challenge',
    timerSeconds: 3 * MIN,
  },
  {
    id: 'workout-challenge',
    title: 'Workout Challenge',
    category: 'challenge',
    description:
      'Challenge your partner to a physical contest of your choice: push-ups, squats, plank, wall sit.',
    specialRule: 'Last one standing takes the credits.',
    creditValue: 2,
    mechanic: 'challenge',
  },
  {
    id: 'you-laugh-you-lose',
    title: 'You Laugh, You Lose',
    category: 'challenge',
    description:
      'Take turns telling dad jokes. Internet-sourced or off the top of the dome. Laugh and you lose the round.',
    specialRule: 'Best 3 out of 5.',
    creditValue: 1,
    mechanic: 'challenge',
  },

  // ── CHAOS (secret) ──────────────────────────────────────────────────────
  {
    id: 'highway-robbery',
    title: 'Highway Robbery',
    category: 'chaos',
    description:
      'Steal 1 Chaos Credit from your partner. You must declare “THIS IS A HIGHWAY ROBBERY!” and act it out with completely unnecessary confidence.',
    creditValue: 1,
    mechanic: 'chaos',
    chaosEffect: { type: 'steal', amount: 1 },
  },
  {
    id: 'sabotage-pass',
    title: 'Sabotage Pass',
    category: 'chaos',
    description:
      'Take 1 Chaos Credit now. On your partner’s next visible card, you get one chance to interfere and make it more embarrassing.',
    creditValue: 1,
    mechanic: 'chaos',
    chaosEffect: { type: 'sabotage', amount: 1 },
  },
  {
    id: 'double-trouble',
    title: 'Double Trouble',
    category: 'chaos',
    description:
      'The next Challenge card is worth double. The loser must also complete a dare chosen by the winner.',
    creditValue: 2,
    mechanic: 'chaos',
    chaosEffect: { type: 'double-next-challenge' },
  },
  {
    id: 'partners-curse',
    title: 'Partner’s Curse',
    category: 'chaos',
    description:
      'Take 1 Chaos Credit and choose one harmless rule your partner must follow for 5 minutes.',
    specialRule: 'Creativity encouraged. Mercy optional.',
    creditValue: 1,
    mechanic: 'chaos',
    chaosEffect: { type: 'curse', amount: 1, seconds: 5 * MIN },
  },
  {
    id: 'chaos-tax',
    title: 'Chaos Tax',
    category: 'chaos',
    description:
      'Everyone pays 1 Chaos Credit into the Chaos Pile. The winner of the next Challenge takes the entire pile.',
    creditValue: 2,
    mechanic: 'chaos',
    chaosEffect: { type: 'chaos-tax', amount: 1 },
  },
  {
    id: 'imposter',
    title: 'Imposter',
    category: 'chaos',
    description:
      'Swap roles with your partner for the next round. Whatever they draw, you do instead, and you keep the credits.',
    specialRule: 'Congratulations. You’re them now.',
    creditValue: 2,
    mechanic: 'chaos',
    chaosEffect: { type: 'imposter' },
  },
  {
    id: 'victory-lap',
    title: 'Victory Lap',
    category: 'chaos',
    description:
      'Take 3 Chaos Credits. In return, you must do a full victory lap of the room right now while your partner applauds.',
    specialRule: 'No lap, no credits.',
    creditValue: 3,
    mechanic: 'chaos',
    chaosEffect: { type: 'gain', amount: 3 },
  },
  {
    id: 'plot-twist',
    title: 'Plot Twist',
    category: 'chaos',
    description:
      'Whoever is losing takes 3 Chaos Credits from whoever is winning. Yes, even if that’s you.',
    specialRule: 'Tied? Nothing happens. You just made it weird.',
    creditValue: 3,
    mechanic: 'chaos',
    chaosEffect: { type: 'underdog', amount: 3 },
  },

  // ── CONNECTION ──────────────────────────────────────────────────────────
  {
    id: 'top-5s',
    title: 'Top 5s',
    category: 'connection',
    description:
      'Your partner picks a category (movies, snacks, fictional crushes, anything). You each build your personal Top 5.',
    specialRule: 'Then argue about whose list is objectively correct.',
    creditValue: 1,
    mechanic: 'shared',
  },
  {
    id: 'the-deep-end',
    title: 'The Deep End',
    category: 'connection',
    description: 'Ask each other a few genuinely meaningful questions. Actually listen to the answers.',
    creditValue: 1,
    mechanic: 'shared',
    prompts: [
      'What’s something you’re proud of that you never say out loud?',
      'When did you last feel completely like yourself?',
      'What’s a small thing I do that makes your day better?',
      'What did you need more of as a kid?',
      'What’s a dream you quietly gave up on? Should you un-give-up?',
      'What’s the best advice you’ve ever ignored?',
      'What do you want more of in the next year?',
      'When did you first know you liked me?',
    ],
  },
  {
    id: 'bucket-list',
    title: 'Bucket List',
    category: 'connection',
    description: 'Build an adventure bucket list together. At least five things. At least one slightly unhinged.',
    creditValue: 1,
    mechanic: 'shared',
  },
  {
    id: 'story-unlock',
    title: 'Story Unlock',
    category: 'connection',
    description: 'Find a random object and use it to unlock a real story from your life. Any story. Go.',
    creditValue: 1,
    mechanic: 'standard',
  },
  {
    id: 'nostalgia',
    title: 'Nostalgia',
    category: 'connection',
    description: 'Tell your partner a story from your childhood that you look back on fondly.',
    creditValue: 1,
    mechanic: 'standard',
  },
  {
    id: 'did-you-know',
    title: 'Did You Know?',
    category: 'connection',
    description: 'Share something about yourself your partner doesn’t know yet.',
    specialRule: 'If they already knew it, try again.',
    creditValue: 1,
    mechanic: 'standard',
  },
  {
    id: 'favorites',
    title: 'Favorites',
    category: 'connection',
    description: 'Tell your partner one of your favourite stories about the two of you.',
    creditValue: 1,
    mechanic: 'standard',
  },
  {
    id: 'tea-time',
    title: 'Tea Time',
    category: 'connection',
    description:
      'Spill the tea. Stories, confessions, guilty pleasures, celebrity drama, unpopular movie opinions. Whatever you’ve got.',
    creditValue: 1,
    mechanic: 'standard',
  },

  // ── MISCHIEF (secret) ───────────────────────────────────────────────────
  {
    id: 'reverse-robber',
    title: 'Reverse Robber',
    category: 'mischief',
    description:
      'Secretly give your partner something, or slip it into their pocket, without them noticing.',
    specialRule: 'Generosity, but make it stealth.',
    creditValue: 1,
    mechanic: 'mischief',
  },
  {
    id: 'fake-words',
    title: 'Fake Words',
    category: 'mischief',
    description: 'Sneak a completely made-up word into conversation. Use it like it’s obvious.',
    specialRule: 'If they don’t call you out, you win.',
    creditValue: 1,
    mechanic: 'mischief',
  },
  {
    id: 'copycat',
    title: 'Copycat',
    category: 'mischief',
    description: 'Secretly copy your partner’s movements. See how long it takes them to notice.',
    specialRule: 'Last 3 minutes without getting caught to win.',
    creditValue: 2,
    mechanic: 'mischief',
    timerSeconds: 3 * MIN,
  },
  {
    id: 'feet-apart',
    title: 'Feet Apart',
    category: 'mischief',
    description: 'Slowly inch backwards during conversation. Keep talking like nothing is happening.',
    specialRule: '+1 for every foot you move without being noticed (max 2).',
    creditValue: 2,
    mechanic: 'mischief',
    maxCount: 2,
  },
  {
    id: 'quick-change',
    title: 'Quick Change',
    category: 'mischief',
    description: 'Change one piece of clothing without your partner noticing. Then do it again.',
    specialRule: '+1 for every unnoticed swap (max 2).',
    creditValue: 2,
    mechanic: 'mischief',
    maxCount: 2,
  },
  {
    id: 'hungry-ninja',
    title: 'Hungry Ninja',
    category: 'mischief',
    description: 'Eat an entire snack without your partner noticing.',
    specialRule: 'Stealth level: HUNGRY NINJA.',
    creditValue: 2,
    mechanic: 'mischief',
  },
];

export const DECK: Card[] = RAW_CARDS.map((card, i) => ({
  ...card,
  number: i + 1,
  visibility: CATEGORIES[card.category].visibility,
}));

export const CARD_BY_ID: Record<string, Card> = Object.fromEntries(DECK.map((c) => [c.id, c]));

export function getCard(id: string): Card | undefined {
  return CARD_BY_ID[id];
}

/**
 * Returns a list of problems with the deck data. Empty means valid.
 * Invalid cards are dropped from play rather than allowed to break the game.
 */
export function validateCard(card: Card): string[] {
  const problems: string[] = [];
  const category = CATEGORIES[card.category];
  if (!category) return [`${card.id}: unknown category "${card.category}"`];
  if (!card.id || !card.title?.trim() || !card.description?.trim()) {
    problems.push(`${card.id || '(no id)'}: missing id, title or description`);
  }
  if (!Number.isInteger(card.creditValue) || card.creditValue < 1) {
    problems.push(`${card.id}: creditValue must be a positive integer`);
  }
  if (card.creditValue > category.maxCredits) {
    problems.push(`${card.id}: ${card.creditValue} credits exceeds ${category.name} max of ${category.maxCredits}`);
  }
  if (card.mechanic === 'chaos' && !card.chaosEffect) {
    problems.push(`${card.id}: chaos card without a chaosEffect`);
  }
  if (card.maxCount !== undefined && card.maxCount > category.maxCredits) {
    problems.push(`${card.id}: maxCount exceeds category max`);
  }
  if (card.timerSeconds !== undefined && card.timerSeconds <= 0) {
    problems.push(`${card.id}: timerSeconds must be positive`);
  }
  return problems;
}

export function validateDeck(cards: Card[]): string[] {
  const problems = cards.flatMap(validateCard);
  const ids = new Set<string>();
  for (const c of cards) {
    if (ids.has(c.id)) problems.push(`duplicate id: ${c.id}`);
    ids.add(c.id);
  }
  return problems;
}

/** The ids that are safe to play with. */
export const PLAYABLE_IDS: string[] = DECK.filter((c) => validateCard(c).length === 0).map((c) => c.id);
