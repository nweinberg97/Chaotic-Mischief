import { useCallback, useEffect, useReducer } from 'react';
import type { GameState, Outcome, PlayerIndex } from '../types/game';
import { createGame, freshDeckOrder, gameReducer, heldCardIds, type GameAction } from './rules';
import { loadGame, saveGame } from './storage';

type Store = GameState | null;
type StoreAction = GameAction | { type: 'clear' };

function storeReducer(state: Store, action: StoreAction): Store {
  if (action.type === 'clear') return null;
  if (action.type === 'start') return createGame(action.names, action.order, action.first);
  if (!state) return state;
  return gameReducer(state, action);
}

const coinFlip = (): PlayerIndex => (Math.random() < 0.5 ? 0 : 1);

/**
 * The one place the UI touches game state. Wraps the pure reducer with
 * randomness, the clock, and localStorage persistence.
 */
export function useGame() {
  const [game, dispatch] = useReducer(storeReducer, undefined, loadGame);

  useEffect(() => {
    saveGame(game);
  }, [game]);

  const start = useCallback((names: [string, string], first: PlayerIndex = coinFlip()) => {
    dispatch({ type: 'start', names, order: freshDeckOrder(), first });
  }, []);

  const draw = useCallback(() => dispatch({ type: 'draw' }), []);
  const reveal = useCallback(() => dispatch({ type: 'reveal' }), []);
  const hide = useCallback(() => dispatch({ type: 'hide' }), []);
  const resolve = useCallback((outcome: Outcome) => dispatch({ type: 'resolve', outcome, now: Date.now() }), []);
  const resolveMission = useCallback(
    (cardId: string, points: number) => dispatch({ type: 'resolveMission', cardId, points }),
    [],
  );
  const reshuffle = useCallback(() => {
    if (!game) return;
    dispatch({ type: 'reshuffle', order: freshDeckOrder(Math.random, heldCardIds(game)) });
  }, [game]);
  const restart = useCallback(() => dispatch({ type: 'restart', order: freshDeckOrder(), first: coinFlip() }), []);
  const clear = useCallback(() => dispatch({ type: 'clear' }), []);
  const setCoupons = useCallback(
    (player: PlayerIndex, couponIds: string[]) => dispatch({ type: 'setCoupons', player, couponIds }),
    [],
  );

  return { game, start, draw, reveal, hide, resolve, resolveMission, reshuffle, restart, clear, setCoupons };
}

export type GameApi = ReturnType<typeof useGame>;
