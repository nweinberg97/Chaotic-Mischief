import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/fonts.css';
import '../styles/tokens.css';
import { PrintApp, type PrintDoc } from './PrintApp';

const param = new URLSearchParams(window.location.search).get('doc');
const doc: PrintDoc = param === 'coupons' || param === 'bundle' ? param : 'deck';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrintApp doc={doc} />
  </StrictMode>,
);
