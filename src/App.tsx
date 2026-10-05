import { useEffect } from 'react';
import { useGame } from './game/useGame';
import { CouponBookPage } from './pages/CouponBookPage';
import { DeckPage } from './pages/DeckPage';
import { GamePage } from './pages/GamePage';
import { LandingPage } from './pages/LandingPage';
import { SetupPage } from './pages/SetupPage';
import { ShopPage } from './pages/ShopPage';
import { ThanksPage } from './pages/ThanksPage';
import { navigate, useRoute } from './utils/router';

export function App() {
  const { route, anchor, params } = useRoute();
  const game = useGame();

  // Scroll to top on page change, or to the anchor on the landing page.
  useEffect(() => {
    if (anchor) {
      requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' }));
    } else {
      window.scrollTo(0, 0);
    }
  }, [route, anchor]);

  switch (route) {
    case '/play':
      return game.game ? <GamePage api={game} /> : <SetupPage onStart={game.start} />;
    case '/deck':
      return <DeckPage />;
    case '/coupons':
      return <CouponBookPage />;
    case '/shop':
      return <ShopPage />;
    case '/thanks':
      return <ThanksPage params={params} />;
    default:
      return (
        <LandingPage
          hasSavedGame={Boolean(game.game && game.game.phase !== 'won')}
          onNewGame={() => {
            game.clear();
            navigate('/play');
          }}
        />
      );
  }
}
