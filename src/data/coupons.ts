import type { Coupon } from '../types/game';

/**
 * Chaos Coupons: the rewards. Every 7 Chaos Credits = 1 coupon.
 * Titles and kickers come from the printable coupon book; the last few
 * are from the reward ideas list in the deck.
 */
const RAW: Omit<Coupon, 'number'>[] = [
  { id: 'pizza-date', kicker: 'You pick where we go', title: 'Pizza Date', emoji: '🍕' },
  { id: 'massage', kicker: 'You get a 30 minute', title: 'Massage', emoji: '💆' },
  { id: 'breakfast-in-bed', kicker: 'I serve you', title: 'Breakfast in Bed', emoji: '🥞' },
  { id: 'movie-night', kicker: 'You pick the movie', title: 'Movie Night', emoji: '🍿' },
  { id: 'personal-chef', kicker: 'I’ll cook your favourite meal', title: 'Personal Chef', emoji: '👨‍🍳' },
  { id: 'surprise-date', kicker: 'I’ll plan you a', title: 'Surprise Date', emoji: '📅' },
  { id: 'yes-day', kicker: 'Today is a', title: 'Yes Day', note: '(I’ll do anything you want with you)', emoji: '👍' },
  { id: 'themed-date', kicker: 'Tonight is a themed', title: 'Date Night', emoji: '🗿' },
  { id: 'piggyback', kicker: 'For 10 minutes I will give you a', title: 'Piggyback', emoji: '🐷' },
  { id: 'snack-plate', kicker: 'I will make you a', title: 'Snack Plate', emoji: '🧀' },
  { id: 'dj-for-the-day', kicker: 'You get to be the', title: 'DJ for the Day', emoji: '🎧' },
  { id: 'genie', kicker: 'I will be your', title: '5 Min Genie', emoji: '🧞' },
  { id: 'nap-pass', kicker: 'For the next day you have a', title: 'Nap Pass', emoji: '😴' },
  { id: 'mystery-box', kicker: 'You are granted one', title: 'Mystery Box', emoji: '🎁' },
  { id: 'chauffeur', kicker: 'I’ll drive you wherever you want with this', title: 'Chauffeur Pass', emoji: '🚗' },
  { id: 'dare-night', kicker: 'I will plan you a', title: 'Dare Night', emoji: '🎲' },
  { id: 'dnd-night', kicker: 'No phones. Just us. A', title: 'DND Night', emoji: '📵' },
  { id: 'new-nickname', kicker: 'For 24 hours, call me by a', title: 'New Nickname', emoji: '🏷️' },
  { id: 'lazy-legend', kicker: 'I will let you be a', title: 'Lazy Legend', emoji: '🛋️' },
  { id: 'cheat-meal', kicker: 'I’ll buy you a', title: 'Cheat Meal', emoji: '🍔' },
  { id: 'run-with-me', kicker: 'Come on a', title: 'Run With Me', emoji: '🏃' },
  { id: 'early-night', kicker: 'Give me an', title: 'Early Night', emoji: '🌙' },
  { id: 'late-night', kicker: 'Give me a', title: 'Late Night', emoji: '🌃' },
  { id: 'roadtrip', kicker: 'Let’s go on a', title: 'Roadtrip', emoji: '🛣️' },
  { id: 'concert', kicker: 'Take me to a', title: 'Concert', emoji: '🎤' },
  { id: 'dishes', kicker: 'Tonight, you do the', title: 'Dishes', emoji: '🍽️' },
  { id: 'laundry-duty', kicker: 'You are on', title: 'Laundry Duty', emoji: '🧺' },
  { id: 'chores-free', kicker: 'Get out of', title: 'Chores Free', emoji: '🧹' },
  { id: 'blanket-burrito', kicker: 'I will wrap you up in a', title: 'Blanket Burrito', emoji: '🌯' },
  { id: 'dramatic-entrance', kicker: 'Next time I walk in, I make a', title: 'Dramatic Entrance', emoji: '🎭' },
  { id: 'accent-20', kicker: 'For 20 minutes I speak in an', title: 'Accent of Your Choice', emoji: '🗣️' },
];

export const COUPONS: Coupon[] = RAW.map((c, i) => ({ ...c, number: i + 1 }));

export const COUPON_BY_ID: Record<string, Coupon> = Object.fromEntries(COUPONS.map((c) => [c.id, c]));

export const COUPON_FINE_PRINT = 'This coupon must be redeemed within a year';
