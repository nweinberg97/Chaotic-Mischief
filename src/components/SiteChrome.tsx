import { useState } from 'react';
import { href } from '../utils/router';
import { Bolt, Wordmark } from './Brand';
import './site.css';

export function SiteHeader({ ctaLabel = 'Start playing' }: { ctaLabel?: string }) {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <a href={href('/')} className="site-header__home" aria-label="Chaotic Mischief home">
        <Wordmark />
      </a>
      <nav className="site-header__nav" aria-label="Main">
        <a href={href('how-it-works')}>How it works</a>
        <a href={href('/deck')}>The deck</a>
        <a href={href('/coupons')}>Coupons</a>
        <a href={href('/shop')}>Shop</a>
      </nav>
      <a href={href('/play')} className="btn site-header__cta">
        {ctaLabel}
      </a>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <Wordmark stacked className="site-footer__mark" />
          <p className="site-footer__tag">Powered by pure chaos.</p>
        </div>
        <nav aria-label="Footer" className="site-footer__links">
          <a href={href('/play')}>Play</a>
          <a href={href('how-it-works')}>How it works</a>
          <a href={href('/deck')}>The deck</a>
          <a href={href('/coupons')}>Coupon book</a>
          <a href={href('/shop')}>Shop</a>
        </nav>
        <p className="site-footer__legal">
          <Bolt className="site-footer__bolt" /> Good trouble only. © {new Date().getFullYear()} Chaotic Mischief Games.
        </p>
      </div>
    </footer>
  );
}

/** Share the site with the native share sheet, or copy the link as a fallback. */
export function ShareButton({ className = 'btn btn--ghost' }: { className?: string }) {
  const [label, setLabel] = useState('Send this to your partner');
  async function share() {
    const url = window.location.href.split('#')[0];
    const data = { title: 'Chaotic Mischief', text: 'Date night needed a villain. Let’s play.', url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      setLabel('Link copied. Go cause problems.');
    } catch {
      // User closed the share sheet, or clipboard is blocked. Nothing to do.
    }
  }
  return (
    <button type="button" className={className} onClick={share}>
      {label}
    </button>
  );
}
