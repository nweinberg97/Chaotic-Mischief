import type { ReactElement } from 'react';
import type { CategoryId } from '../types/game';

/**
 * The seven category glyphs from the card templates, drawn as simple
 * single-colour SVGs so they inherit the card's ink colour.
 */
const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const GLYPHS: Record<CategoryId, ReactElement> = {
  action: (
    <>
      <circle cx="15" cy="4.2" r="2.3" fill="currentColor" />
      <path {...STROKE} d="M13.5 8 10.5 14l3.5 2.8-1.2 5" />
      <path {...STROKE} d="M10.5 14 7.6 17.2H4" />
      <path {...STROKE} d="M8 10.2 11 7.6h3.4l2.4 3 2.6.6" />
    </>
  ),
  performance: (
    <>
      <rect x="9" y="2" width="6" height="11.5" rx="3" fill="currentColor" />
      <path {...STROKE} d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V22M8.5 22h7" />
    </>
  ),
  'side-quest': (
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M12 1.8a7.2 7.2 0 0 0-7.2 7.2c0 5.4 7.2 13.2 7.2 13.2s7.2-7.8 7.2-13.2A7.2 7.2 0 0 0 12 1.8Zm0 4.4a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z"
    />
  ),
  challenge: (
    <>
      <path fill="currentColor" d="M7 3h10v5.5a5 5 0 0 1-10 0V3Z" />
      <path {...STROKE} d="M7 5H4.2v1.6A3.4 3.4 0 0 0 7.4 10M17 5h2.8v1.6a3.4 3.4 0 0 1-3.2 3.4M12 13.5v4" />
      <path fill="currentColor" d="M8 18h8l.8 3.5H7.2L8 18Z" />
    </>
  ),
  chaos: <path fill="currentColor" d="M13.6 1.5 4 13.6h6.8L9.6 22.5 20 9.9h-7l.6-8.4Z" />,
  connection: (
    <>
      <path {...STROKE} d="M10 13.5a4.6 4.6 0 0 0 6.9.5l3-3a4.6 4.6 0 0 0-6.5-6.5l-1.7 1.7" />
      <path {...STROKE} d="M14 10.5a4.6 4.6 0 0 0-6.9-.5l-3 3a4.6 4.6 0 0 0 6.5 6.5l1.7-1.7" />
    </>
  ),
  mischief: (
    <>
      <path
        fill="currentColor"
        d="M4.2 17C4.2 12.6 3.6 9.6 2.6 7.2c3.3 1.2 5.4 3.4 6.6 6.2.7-3.5 1.5-6.6 2.8-9.4 1.3 2.8 2.1 5.9 2.8 9.4 1.2-2.8 3.3-5 6.6-6.2-1 2.4-1.6 5.4-1.6 9.8H4.2Z"
      />
      <rect x="3.6" y="17.6" width="16.8" height="3.4" rx="1.2" fill="currentColor" />
      <circle cx="2.6" cy="5.6" r="1.7" fill="currentColor" />
      <circle cx="12" cy="2.6" r="1.7" fill="currentColor" />
      <circle cx="21.4" cy="5.6" r="1.7" fill="currentColor" />
    </>
  ),
};

interface Props {
  category: CategoryId;
  size?: number | string;
  className?: string;
  title?: string;
}

export function CategoryIcon({ category, size = 24, className, title }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {GLYPHS[category]}
    </svg>
  );
}

export function ClockIcon({ size = 16 }: { size?: number | string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <circle cx="12" cy="12" r="9" {...STROKE} />
      <path {...STROKE} d="M12 7v5.2l3.2 2" />
    </svg>
  );
}

export function EyeIcon({ size = 16 }: { size?: number | string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path {...STROKE} d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}
