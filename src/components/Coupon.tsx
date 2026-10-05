import { COUPON_FINE_PRINT } from '../data/coupons';
import type { Coupon as CouponData } from '../types/game';
import './coupon.css';

interface Props {
  coupon: CouponData;
  /** Personalise the ticket: who it's for and who has to make good on it. */
  to?: string;
  from?: string;
  selected?: boolean;
  onToggle?: () => void;
  disabled?: boolean;
}

/** Deterministic faux-barcode so every coupon gets its own stripes. */
function barcode(seed: number): number[] {
  const bars: number[] = [];
  let x = seed * 9301 + 49297;
  for (let i = 0; i < 26; i++) {
    x = (x * 9301 + 49297) % 233280;
    bars.push(1 + (x % 3));
  }
  return bars;
}

/**
 * A Chaos Coupon, styled after the printable coupon book: a ticket with a
 * tear-off stub, a number, and a deeply binding legal promise.
 */
export function Coupon({ coupon, to, from, selected, onToggle, disabled }: Props) {
  const number = String(coupon.number).padStart(3, '0');
  const body = (
    <>
      <div className="coupon__main">
        <p className="coupon__kicker">{coupon.kicker}</p>
        <h3 className="coupon__title">{coupon.title}</h3>
        {coupon.note && <p className="coupon__note">{coupon.note}</p>}
        <p className="coupon__once">Just one time</p>
        {(to || from) && (
          <p className="coupon__names">
            {to && (
              <span>
                For <strong>{to}</strong>
              </span>
            )}
            {from && (
              <span>
                From <strong>{from}</strong>
              </span>
            )}
          </p>
        )}
        <p className="coupon__fine">{COUPON_FINE_PRINT}</p>
      </div>
      <div className="coupon__stub" aria-hidden>
        <span className="coupon__no">{number}</span>
        <span className="coupon__emoji">{coupon.emoji}</span>
        <span className="coupon__brand">
          Chaotic
          <br />
          Mischief
        </span>
      </div>
      <div className="coupon__code" aria-hidden>
        {barcode(coupon.number).map((w, i) => (
          <span key={i} style={{ height: `${w * 0.45}cqi` }} />
        ))}
      </div>
      {onToggle && <span className="coupon__check" aria-hidden>{selected ? '✓' : '+'}</span>}
    </>
  );

  if (onToggle) {
    return (
      <button
        type="button"
        className={`coupon coupon--pick ${selected ? 'is-selected' : ''}`}
        aria-pressed={selected}
        onClick={onToggle}
        disabled={disabled && !selected}
      >
        {body}
      </button>
    );
  }
  return <div className="coupon">{body}</div>;
}
