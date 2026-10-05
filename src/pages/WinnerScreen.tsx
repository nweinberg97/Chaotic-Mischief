import { useState } from 'react';
import { Bolt } from '../components/Brand';
import { Coupon } from '../components/Coupon';
import { PrintSheet } from '../components/PrintSheet';
import { CouponUpsell } from '../components/Upsell';
import { COUPON_BY_ID, COUPONS } from '../data/coupons';
import { CREDITS_PER_COUPON, couponAllowance, other } from '../game/rules';
import type { GameApi } from '../game/useGame';
import type { PlayerIndex } from '../types/game';
import { href, navigate } from '../utils/router';
import './winner.css';

export function WinnerScreen({ api }: { api: GameApi }) {
  const game = api.game!;
  const winner = game.winner ?? 0;
  const loser = other(winner);
  const w = game.players[winner];
  const l = game.players[loser];
  const allowances: [number, number] = [couponAllowance(game, 0), couponAllowance(game, 1)];
  const [picker, setPicker] = useState<PlayerIndex>(winner);
  const pickerAllowance = allowances[picker];
  const picked = game.coupons[picker];

  function toggle(id: string) {
    const next = picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id];
    api.setCoupons(picker, next);
  }

  const totalPicked = game.coupons[0].length + game.coupons[1].length;

  return (
    <div className="winner">
      <section className="winner__hero">
        <div className="winner__confetti" aria-hidden>
          {Array.from({ length: 18 }, (_, i) => (
            <Bolt key={i} className={`winner__bolt winner__bolt--${i % 6}`} />
          ))}
        </div>
        <p className="eyebrow winner__eyebrow">Game over · round {game.round - 1}</p>
        <h1 className="winner__title">Chaos has been claimed.</h1>
        <p className="winner__name">
          <strong>{w.name}</strong> wins the night.
        </p>
        <p className="winner__score">
          {w.score} – {l.score}
        </p>
        <p className="winner__sub">
          {w.score} Chaos Credits. You are officially the more chaotic partner. {l.name}, there’s always a rematch.
        </p>
      </section>

      <section className="winner__rewards" aria-labelledby="rewards-title">
        <h2 id="rewards-title" className="winner__h2">
          Claim your coupons
        </h2>
        <p className="winner__lede">
          Every {CREDITS_PER_COUPON} credits earns a Chaos Coupon. The winner claims at least three.{' '}
          {allowances[loser] > 0
            ? `${l.name} earned ${allowances[loser]} too. Consolation prizes are still prizes.`
            : `${l.name} earned none. Character building.`}
        </p>

        <div className="tabs" role="group" aria-label="Whose coupons">
          {([winner, loser] as PlayerIndex[]).map((i) => (
            <button
              key={i}
              type="button"
              aria-pressed={picker === i}
              className={`tabs__tab ${picker === i ? 'is-on' : ''}`}
              onClick={() => setPicker(i)}
              disabled={allowances[i] === 0}
            >
              {game.players[i].name}
              <span className="tabs__count">
                {game.coupons[i].length}/{allowances[i]}
              </span>
            </button>
          ))}
        </div>

        <p className="winner__pick-hint" aria-live="polite">
          {pickerAllowance === 0
            ? 'No coupons for this player.'
            : picked.length < pickerAllowance
              ? `${game.players[picker].name}, pick ${pickerAllowance - picked.length} more. ${game.players[other(picker)].name} has to honour them.`
              : `${game.players[picker].name} is all set.`}
        </p>

        <div className="coupon-grid">
          {COUPONS.map((c) => (
            <Coupon
              key={c.id}
              coupon={c}
              selected={picked.includes(c.id)}
              disabled={picked.length >= pickerAllowance}
              onToggle={() => toggle(c.id)}
            />
          ))}
        </div>

        <CouponUpsell
          title="Want the whole book?"
          sub="All 31 coupons, print-ready, plus 5 blanks to write your own. Keep the chaos going."
        />
      </section>

      <footer className="winner__dock">
        <button type="button" className="btn" onClick={() => window.print()} disabled={totalPicked === 0}>
          Print our coupons
        </button>
        <button type="button" className="btn btn--paper" onClick={api.restart}>
          Rematch
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            api.clear();
            navigate('/play');
          }}
        >
          New players
        </button>
        <a className="link-btn" href={href('/')}>
          Home
        </a>
      </footer>

      <PrintSheet title="Chaotic Mischief · Chaos Coupons">
        {([0, 1] as PlayerIndex[]).flatMap((i) =>
          game.coupons[i].map((id) => (
            <div className="print-sheet__item" key={`${i}-${id}`}>
              <Coupon coupon={COUPON_BY_ID[id]} to={game.players[i].name} from={game.players[other(i)].name} />
            </div>
          )),
        )}
      </PrintSheet>
    </div>
  );
}
