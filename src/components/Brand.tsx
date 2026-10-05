import './brand.css';

/**
 * Brand primitives: the wordmark (lightning bolt dotting the "i" in Chaotic)
 * and the Chaos Meter (the joker-card tokens that show what a card is worth).
 */

export function Bolt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 20" className={className} aria-hidden>
      <path d="M7.6 0 0 11.3h5L3.8 20 12 7.6H6.8L7.6 0Z" fill="currentColor" />
    </svg>
  );
}

interface WordmarkProps {
  className?: string;
  /** Stack "Chaotic" above "Mischief" (hero / card back) or keep on one line. */
  stacked?: boolean;
  as?: 'span' | 'h1';
}

export function Wordmark({ className = '', stacked = false, as: Tag = 'span' }: WordmarkProps) {
  return (
    <Tag className={`wordmark ${stacked ? 'wordmark--stacked' : ''} ${className}`} aria-label="Chaotic Mischief">
      <span aria-hidden className="wordmark__line">
        Chaot
        <span className="wordmark__i">
          ı<Bolt className="wordmark__bolt" />
        </span>
        c
      </span>{' '}
      <span aria-hidden className="wordmark__line">
        Mischief
      </span>
    </Tag>
  );
}

/** A tiny joker card: one Chaos Credit. */
export function CreditToken({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 18" className={`credit-token ${className}`} aria-hidden>
      <rect x="1" y="1" width="12" height="16" rx="2.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3.6 4.4 9.4h2.7L6 14.4l3.8-6.2H7.2L8 3.6Z" fill="currentColor" />
    </svg>
  );
}

interface MeterProps {
  value: number;
  max?: number;
  className?: string;
}

/** Chaos Meter: 1 token = Wholesome, 2 = Mischievous, 3 = Chaotic. */
export function ChaosMeter({ value, max, className = '' }: MeterProps) {
  const total = Math.max(value, max ?? value);
  const level = value >= 3 ? 'Chaotic' : value === 2 ? 'Mischievous' : 'Wholesome';
  return (
    <span className={`chaos-meter ${className}`} role="img" aria-label={`Chaos meter: ${level}`}>
      {Array.from({ length: total }, (_, i) => (
        <CreditToken key={i} className={i < value ? '' : 'credit-token--off'} />
      ))}
    </span>
  );
}
